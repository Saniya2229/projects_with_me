import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { ACTIVE_TASK_STATUSES, toIsoDay } from '../utils/businessRules.js';

export async function getDashboard(req, res, next) {
  try {
    const todayStart = new Date(`${toIsoDay(new Date())}T00:00:00.000Z`);

    const [empCounts, taskCounts, overdueCount, workloadAgg] = await Promise.all([
      Employee.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Task.countDocuments({
        status: { $in: ACTIVE_TASK_STATUSES },
        dueDate: { $lt: todayStart },
      }),
      Employee.aggregate([
        { $match: { status: { $ne: 'Inactive' } } },
        {
          $lookup: {
            from: 'tasks',
            let: { empId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$assignedEmployee', '$$empId'] },
                      { $in: ['$status', ACTIVE_TASK_STATUSES] },
                    ],
                  },
                },
              },
              { $count: 'count' },
            ],
            as: 'activeTaskStats',
          },
        },
        {
          $project: {
            _id: 1,
            employeeId: 1,
            fullName: 1,
            department: 1,
            status: 1,
            activeTasks: {
              $ifNull: [{ $arrayElemAt: ['$activeTaskStats.count', 0] }, 0],
            },
          },
        },
        { $sort: { activeTasks: -1, fullName: 1 } },
      ]),
    ]);

    const empMap = Object.fromEntries(empCounts.map((e) => [e._id, e.count]));
    const taskMap = Object.fromEntries(taskCounts.map((t) => [t._id, t.count]));

    const active = empMap.Active || 0;
    const inactive = empMap.Inactive || 0;
    const onLeave = empMap['On Leave'] || 0;

    const todo = taskMap.Todo || 0;
    const inProgress = taskMap['In Progress'] || 0;
    const completed = taskMap.Completed || 0;
    const cancelled = taskMap.Cancelled || 0;

    res.json({
      success: true,
      employees: {
        total: active + inactive + onLeave,
        active,
        inactive,
        onLeave,
      },
      tasks: {
        total: todo + inProgress + completed + cancelled,
        todo,
        inProgress,
        completed,
        cancelled,
        overdue: overdueCount,
      },
      workload: workloadAgg,
    });
  } catch (err) {
    next(err);
  }
}

