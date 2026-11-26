import { DEPARTMENTS, EMPLOYEE_STATUSES, PRIORITIES } from './constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmployeeForm(values, isEdit = false) {
  const errors = {};

  if (!isEdit && (!values.employeeId || !values.employeeId.trim())) {
    errors.employeeId = 'Employee ID is required.';
  }
  if (!values.fullName || values.fullName.trim().length < 2) {
    errors.fullName = 'Full Name is required (minimum 2 characters).';
  }
  if (!values.email || !EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!values.phone || values.phone.trim().length < 7) {
    errors.phone = 'Please enter a valid phone number.';
  }
  if (!DEPARTMENTS.includes(values.department)) {
    errors.department = 'Please select a valid department.';
  }
  if (!values.role || !values.role.trim()) {
    errors.role = 'Role is required.';
  }
  if (!values.joiningDate) {
    errors.joiningDate = 'Joining Date is required.';
  }
  if (!EMPLOYEE_STATUSES.includes(values.status)) {
    errors.status = 'Please select a valid status.';
  }
  if (values.status === 'On Leave') {
    if (!values.leaveStart || !values.leaveEnd) {
      errors.leaveDates = 'Leave Start and Leave End dates are required when On Leave.';
    } else if (values.leaveEnd < values.leaveStart) {
      errors.leaveDates = 'Leave End Date cannot be earlier than Leave Start Date.';
    }
  }

  return errors;
}

export function validateTaskForm(values) {
  const errors = {};

  if (!values.title || values.title.trim().length < 3) {
    errors.title = 'Task title is required (minimum 3 characters).';
  }
  if (!values.assignedEmployee) {
    errors.assignedEmployee = 'Please select an Assigned Employee.';
  }
  if (!PRIORITIES.includes(values.priority)) {
    errors.priority = 'Please select a Priority level.';
  }
  if (!DEPARTMENTS.includes(values.department)) {
    errors.department = 'Please select a Department.';
  }
  if (!values.startDate) {
    errors.startDate = 'Start Date is required.';
  }
  if (!values.dueDate) {
    errors.dueDate = 'Due Date is required.';
  }
  if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
    errors.dueDate = 'Due Date cannot be earlier than Start Date.';
  }

  return errors;
}

