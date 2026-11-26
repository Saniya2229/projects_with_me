import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { getNextTaskId } from '../models/Counter.js';
import {
  ACTIVE_TASK_STATUSES,
  AppError,
  isTaskOverdue,
  isValidStatusTransition,
  MAX_ACTIVE_TASKS,
  validateEmployeeEligibility,
  validateTaskDates,
} from '../utils/businessRules.js';
import { tasksToCsv } from '../utils/csvExporter.js';

function buildTaskQuery(query) {
  const {
    search = '',
    department = '',
    priority = '',
    status = '',
    dueFrom = '',
    dueTo = '',
  } = query;

  const filter = {};

  if (search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { title: regex },
      { taskId: regex },
      { 'employeeSnapshot.fullName': regex },
    ];
  }
  if (department) filter.department = department;
  if (priority) filter.priority = priority;
  if (status) filter.status = status;

  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) filter.dueDate.$gte = new Date(`${dueFrom}T00:00:00.000Z`);
    if (dueTo) filter.dueDate.$lte = new Date(`${dueTo}T23:59:59.999Z`);
  }

  return filter;
}

function buildTaskSort(sortBy = 'createdDate', sortOrder = 'desc') {
  const dir = sortOrder === 'asc' ? 1 : -1;
  switch (sortBy) {
    case 'dueDate':
      return { dueDate: dir, createdDate: -1 };
    case 'priority':
      return { priorityWeight: dir, createdDate: -1 };
    case 'title':
      return { title: dir };
    case 'createdDate':
    default:
      return { createdDate: dir };
  }
}

export async function listTasks(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '5', 10)));
    const skip = (page - 1) * limit;

    const filter = buildTaskQuery(req.query);
    const sort = buildTaskSort(req.query.sortBy, req.query.sortOrder);

    const [total, tasks] = await Promise.all([
      Task.countDocuments(filter),
      Task.find(filter)
        .populate('assignedEmployee', 'employeeId fullName department role status')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const enriched = tasks.map((task) => ({
      ...task,
      isOverdue: isTaskOverdue(task),
    }));

    res.json({
      success: true,
      data: enriched,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function exportTasksCsv(req, res, next) {
  try {
    const filter = buildTaskQuery(req.query);
    const sort = buildTaskSort(req.query.sortBy, req.query.sortOrder);

    const tasks = await Task.find(filter)
      .populate('assignedEmployee', 'employeeId fullName department role status')
      .sort(sort)
      .lean();

    const csv = tasksToCsv(tasks);
    const filename = `tasks_export_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (err) {
    next(err);
  }
}

export async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedEmployee', 'employeeId fullName department role status')
      .lean();

    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    res.json({
      success: true,
      data: {
        ...task,
        isOverdue: isTaskOverdue(task),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const {
      title,
      description = '',
      assignedEmployee,
      department,
      priority,
      startDate,
      dueDate,
    } = req.body;

    validateTaskDates(startDate, dueDate);

    const employee = await Employee.findById(assignedEmployee);
    validateEmployeeEligibility(employee, startDate);

    const activeCount = await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $in: ACTIVE_TASK_STATUSES },
    });

    if (activeCount >= MAX_ACTIVE_TASKS) {
      throw new AppError(
        'Employee already has 3 active tasks. Please choose another employee.',
        400
      );
    }

    const taskId = await getNextTaskId();

    const task = await Task.create({
      taskId,
      title,
      description,
      assignedEmployee: employee._id,
      employeeSnapshot: {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        department: employee.department,
        role: employee.role,
      },
      department,
      priority,
      status: 'Todo', // New tasks always start as Todo
      startDate,
      dueDate,
      createdDate: new Date(),
      completedDate: null, // Never taken from frontend
    });

    const populated = await Task.findById(task._id)
      .populate('assignedEmployee', 'employeeId fullName department role status')
      .lean();

    res.status(201).json({
      success: true,
      data: {
        ...populated,
        isOverdue: isTaskOverdue(populated),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // Completed and Cancelled tasks cannot be edited
    if (task.status === 'Completed' || task.status === 'Cancelled') {
      throw new AppError(`${task.status} tasks cannot be edited.`, 400);
    }

    // Status can only be changed through PUT /api/tasks/:id/status
    if (req.body.status !== undefined && req.body.status !== task.status) {
      throw new AppError(
        'Status can only be changed through PUT /api/tasks/:id/status.',
        400
      );
    }

    const nextStartDate = req.body.startDate ?? task.startDate;
    const nextDueDate = req.body.dueDate ?? task.dueDate;
    validateTaskDates(nextStartDate, nextDueDate);

    const nextEmployeeId = req.body.assignedEmployee ?? String(task.assignedEmployee);
    const employee = await Employee.findById(nextEmployeeId);
    validateEmployeeEligibility(employee, nextStartDate);

    if (String(employee._id) !== String(task.assignedEmployee)) {
      const activeCount = await Task.countDocuments({
        assignedEmployee: employee._id,
        status: { $in: ACTIVE_TASK_STATUSES },
        _id: { $ne: task._id },
      });

      if (activeCount >= MAX_ACTIVE_TASKS) {
        throw new AppError(
          'Employee already has 3 active tasks. Please choose another employee.',
          400
        );
      }
    }

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.department !== undefined) task.department = req.body.department;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    task.startDate = nextStartDate;
    task.dueDate = nextDueDate;
    task.assignedEmployee = employee._id;
    task.employeeSnapshot = {
      employeeId: employee.employeeId,
      fullName: employee.fullName,
      department: employee.department,
      role: employee.role,
    };

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedEmployee', 'employeeId fullName department role status')
      .lean();

    res.json({
      success: true,
      data: {
        ...populated,
        isOverdue: isTaskOverdue(populated),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(req, res, next) {
  try {
    const { status: nextStatus } = req.body;
    if (!nextStatus) {
      throw new AppError('Target status is required.', 400);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    if (!isValidStatusTransition(task.status, nextStatus)) {
      throw new AppError(
        `Invalid status transition: "${task.status}" → "${nextStatus}" is not allowed.`,
        400
      );
    }

    task.status = nextStatus;
    if (nextStatus === 'Completed') {
      task.completedDate = new Date();
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedEmployee', 'employeeId fullName department role status')
      .lean();

    res.json({
      success: true,
      data: {
        ...populated,
        isOverdue: isTaskOverdue(populated),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    await Task.deleteOne({ _id: task._id });

    res.json({
      success: true,
      message: `Task ${task.taskId} deleted.`,
    });
  } catch (err) {
    next(err);
  }
}

