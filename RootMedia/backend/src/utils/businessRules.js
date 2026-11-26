export const MAX_ACTIVE_TASKS = 3;
export const ACTIVE_TASK_STATUSES = ['Todo', 'In Progress'];

const ALLOWED_TRANSITIONS = {
  Todo: ['In Progress', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

export class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export function toIsoDay(dateVal) {
  if (!dateVal) return null;
  const d = new Date(dateVal);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().split('T')[0];
}

export function isTaskOverdue(task) {
  if (!task || task.status === 'Completed' || task.status === 'Cancelled') {
    return false;
  }
  const todayStr = toIsoDay(new Date());
  const dueStr = toIsoDay(task.dueDate);
  if (!dueStr) return false;
  return todayStr > dueStr;
}

export function isValidStatusTransition(currentStatus, nextStatus) {
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function validateTaskDates(startDate, dueDate) {
  const startDay = toIsoDay(startDate);
  const dueDay = toIsoDay(dueDate);
  if (!startDay || !dueDay) {
    throw new AppError('Valid Start Date and Due Date are required.', 400);
  }
  if (dueDay < startDay) {
    throw new AppError('Due Date cannot be earlier than Start Date.', 400);
  }
}

export function validateEmployeeEligibility(employee, startDate) {
  if (!employee) {
    throw new AppError('Assigned employee not found.', 404);
  }

  if (employee.status === 'Inactive') {
    throw new AppError(
      `Cannot assign task to ${employee.fullName} because their status is Inactive.`,
      400
    );
  }

  if (employee.status === 'On Leave') {
    const startDay = toIsoDay(startDate);
    const leaveStartDay = toIsoDay(employee.leaveStart);
    const leaveEndDay = toIsoDay(employee.leaveEnd);

    if (leaveStartDay && leaveEndDay && startDay >= leaveStartDay && startDay <= leaveEndDay) {
      throw new AppError(
        `${employee.fullName} is On Leave from ${leaveStartDay} to ${leaveEndDay}. Start Date cannot fall inside the leave period.`,
        400
      );
    }
  }
}

