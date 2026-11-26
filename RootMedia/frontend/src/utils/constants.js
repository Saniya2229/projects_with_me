export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

export const TASK_SORT_OPTIONS = [
  { value: 'createdDate-desc', label: 'Created (Newest)' },
  { value: 'createdDate-asc', label: 'Created (Oldest)' },
  { value: 'dueDate-asc', label: 'Due Date (Earliest)' },
  { value: 'dueDate-desc', label: 'Due Date (Latest)' },
  { value: 'priority-desc', label: 'Priority (High → Low)' },
  { value: 'priority-asc', label: 'Priority (Low → High)' },
  { value: 'title-asc', label: 'Title (A → Z)' },
  { value: 'title-desc', label: 'Title (Z → A)' },
];

export const MAX_ACTIVE_TASKS_PER_EMPLOYEE = 3;

/**
 * Valid status transitions enforced on both UI dropdown and Backend.
 */
export function getValidNextStatuses(currentStatus) {
  if (currentStatus === 'Todo') return ['In Progress', 'Cancelled'];
  if (currentStatus === 'In Progress') return ['Completed', 'Cancelled'];
  return [];
}

