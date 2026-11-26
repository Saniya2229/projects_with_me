import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { ACTIVE_TASK_STATUSES, AppError, isTaskOverdue, toIsoDay } from '../utils/businessRules.js';

function validateLeaveWindow(status, leaveStart, leaveEnd) {
  if (status === 'On Leave') {
    const start = toIsoDay(leaveStart);
    const end = toIsoDay(leaveEnd);
    if (!start || !end) {
      throw new AppError(
        'Leave Start Date and Leave End Date are required when status is On Leave.',
        400
      );
    }
    if (end < start) {
      throw new AppError('Leave End Date cannot be earlier than Leave Start Date.', 400);
    }
  }
}

export async function listEmployees(req, res, next) {
  try {
    const { search = '', department = '', status = '' } = req.query;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const filter = {};
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }];
    }
    if (department) filter.department = department;
    if (status) filter.status = status;

    const [total, employees] = await Promise.all([
      Employee.countDocuments(filter),
      Employee.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    const empIds = employees.map((e) => e._id);
    const activeCounts = await Task.aggregate([
      {
        $match: {
          assignedEmployee: { $in: empIds },
          status: { $in: ACTIVE_TASK_STATUSES },
        },
      },
      { $group: { _id: '$assignedEmployee', count: { $sum: 1 } } },
    ]);

    const countMap = Object.fromEntries(
      activeCounts.map((item) => [String(item._id), item.count])
    );

    const enriched = employees.map((emp) => ({
      ...emp,
      activeTaskCount: countMap[String(emp._id)] || 0,
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

export async function getEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id).lean();
    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }

    const tasks = await Task.find({ assignedEmployee: employee._id })
      .sort({ createdDate: -1 })
      .lean();

    const activeTaskCount = tasks.filter((t) =>
      ACTIVE_TASK_STATUSES.includes(t.status)
    ).length;

    const enrichedTasks = tasks.map((t) => ({
      ...t,
      isOverdue: isTaskOverdue(t),
    }));

    res.json({
      success: true,
      data: {
        ...employee,
        activeTaskCount,
      },
      tasks: enrichedTasks,
    });
  } catch (err) {
    next(err);
  }
}

export async function createEmployee(req, res, next) {
  try {
    const {
      employeeId,
      fullName,
      email,
      phone,
      department,
      role,
      joiningDate,
      status = 'Active',
      skills = [],
      leaveStart = null,
      leaveEnd = null,
    } = req.body;

    validateLeaveWindow(status, leaveStart, leaveEnd);

    const normalizedId = employeeId?.trim().toUpperCase();
    const normalizedEmail = email?.trim().toLowerCase();

    const existing = await Employee.findOne({
      $or: [{ employeeId: normalizedId }, { email: normalizedEmail }],
    });
    if (existing) {
      const conflictField =
        existing.employeeId === normalizedId ? 'Employee ID' : 'Email';
      throw new AppError(`${conflictField} already exists.`, 409);
    }

    const employee = await Employee.create({
      employeeId: normalizedId,
      fullName,
      email: normalizedEmail,
      phone,
      department,
      role,
      joiningDate,
      status,
      skills: Array.isArray(skills) ? skills : [],
      leaveStart: status === 'On Leave' ? leaveStart : null,
      leaveEnd: status === 'On Leave' ? leaveEnd : null,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }

    const {
      fullName,
      email,
      phone,
      department,
      role,
      joiningDate,
      status,
      skills,
      leaveStart,
      leaveEnd,
    } = req.body;

    const nextStatus = status ?? employee.status;
    const nextLeaveStart = nextStatus === 'On Leave' ? leaveStart ?? employee.leaveStart : null;
    const nextLeaveEnd = nextStatus === 'On Leave' ? leaveEnd ?? employee.leaveEnd : null;

    validateLeaveWindow(nextStatus, nextLeaveStart, nextLeaveEnd);

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicate = await Employee.findOne({
        email: normalizedEmail,
        _id: { $ne: employee._id },
      });
      if (duplicate) {
        throw new AppError('Email is already registered to another employee.', 409);
      }
      employee.email = normalizedEmail;
    }

    if (fullName !== undefined) employee.fullName = fullName;
    if (phone !== undefined) employee.phone = phone;
    if (department !== undefined) employee.department = department;
    if (role !== undefined) employee.role = role;
    if (joiningDate !== undefined) employee.joiningDate = joiningDate;
    employee.status = nextStatus;
    employee.leaveStart = nextLeaveStart;
    employee.leaveEnd = nextLeaveEnd;
    if (Array.isArray(skills)) employee.skills = skills;

    await employee.save();

    // Keep employeeSnapshot synchronized on existing tasks
    await Task.updateMany(
      { assignedEmployee: employee._id },
      {
        $set: {
          'employeeSnapshot.fullName': employee.fullName,
          'employeeSnapshot.department': employee.department,
          'employeeSnapshot.role': employee.role,
        },
      }
    );

    res.json({
      success: true,
      data: employee,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteEmployee(req, res, next) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      throw new AppError('Employee not found.', 404);
    }

    const activeCount = await Task.countDocuments({
      assignedEmployee: employee._id,
      status: { $in: ACTIVE_TASK_STATUSES },
    });

    if (activeCount > 0) {
      throw new AppError(
        `Cannot delete ${employee.fullName} while they have ${activeCount} active task(s) (Todo / In Progress).`,
        400
      );
    }

    await Employee.deleteOne({ _id: employee._id });

    res.json({
      success: true,
      message: `Employee ${employee.fullName} deleted. Historical task records preserved.`,
    });
  } catch (err) {
    next(err);
  }
}

