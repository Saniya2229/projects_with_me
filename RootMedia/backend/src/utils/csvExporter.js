import { isTaskOverdue, toIsoDay } from './businessRules.js';

function escapeCsvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function tasksToCsv(tasks) {
  const headers = [
    'Task ID',
    'Title',
    'Assigned Employee',
    'Department',
    'Priority',
    'Status',
    'Start Date',
    'Due Date',
    'Overdue',
    'Created Date',
    'Completed Date',
  ];

  const rows = tasks.map((task) => {
    const empName =
      task.assignedEmployee?.fullName ||
      (task.employeeSnapshot?.fullName
        ? `${task.employeeSnapshot.fullName} (Deleted)`
        : 'Unassigned');

    return [
      escapeCsvCell(task.taskId),
      escapeCsvCell(task.title),
      escapeCsvCell(empName),
      escapeCsvCell(task.department),
      escapeCsvCell(task.priority),
      escapeCsvCell(task.status),
      escapeCsvCell(toIsoDay(task.startDate)),
      escapeCsvCell(toIsoDay(task.dueDate)),
      escapeCsvCell(isTaskOverdue(task) ? 'Yes' : 'No'),
      escapeCsvCell(toIsoDay(task.createdDate)),
      escapeCsvCell(task.completedDate ? toIsoDay(task.completedDate) : ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

