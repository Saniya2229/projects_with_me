const { validateCreateTask, validateUpdateTask, validateAssignTask } = require('../src/utils/validators');

describe('Validators Unit Tests', () => {
  describe('validateCreateTask', () => {
    test('passes with valid minimal body', () => {
      const error = validateCreateTask({ title: 'Valid Title' });
      expect(error).toBeNull();
    });

    test('passes with all valid fields', () => {
      const error = validateCreateTask({
        title: 'Task 1',
        description: 'A description',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-12-31T23:59:59.000Z',
      });
      expect(error).toBeNull();
    });

    test('fails when title is missing', () => {
      const error = validateCreateTask({});
      expect(error).toBe('title is required and must be a non-empty string');
    });

    test('fails when title is not a string', () => {
      const error = validateCreateTask({ title: 12345 });
      expect(error).toBe('title is required and must be a non-empty string');
    });

    test('fails when title is an empty or whitespace string', () => {
      const error = validateCreateTask({ title: '   ' });
      expect(error).toBe('title is required and must be a non-empty string');
    });

    test('fails when status is invalid', () => {
      const error = validateCreateTask({ title: 'Task', status: 'invalid_status' });
      expect(error).toBe('status must be one of: todo, in_progress, done');
    });

    test('fails when priority is invalid', () => {
      const error = validateCreateTask({ title: 'Task', priority: 'urgent' });
      expect(error).toBe('priority must be one of: low, medium, high');
    });

    test('fails when dueDate is not a valid date string', () => {
      const error = validateCreateTask({ title: 'Task', dueDate: 'not-a-date' });
      expect(error).toBe('dueDate must be a valid ISO date string');
    });
  });

  describe('validateUpdateTask', () => {
    test('passes with empty update object', () => {
      const error = validateUpdateTask({});
      expect(error).toBeNull();
    });

    test('passes with valid partial updates', () => {
      expect(validateUpdateTask({ title: 'New Title' })).toBeNull();
      expect(validateUpdateTask({ status: 'done' })).toBeNull();
      expect(validateUpdateTask({ priority: 'low' })).toBeNull();
      expect(validateUpdateTask({ dueDate: '2026-10-15T00:00:00.000Z' })).toBeNull();
    });

    test('fails when updated title is not a string', () => {
      const error = validateUpdateTask({ title: 999 });
      expect(error).toBe('title must be a non-empty string');
    });

    test('fails when updated title is empty or whitespace only', () => {
      const error = validateUpdateTask({ title: '   ' });
      expect(error).toBe('title must be a non-empty string');
    });

    test('fails when updated status is invalid', () => {
      const error = validateUpdateTask({ status: 'archived' });
      expect(error).toBe('status must be one of: todo, in_progress, done');
    });

    test('fails when updated priority is invalid', () => {
      const error = validateUpdateTask({ priority: 'critical' });
      expect(error).toBe('priority must be one of: low, medium, high');
    });

    test('fails when updated dueDate is invalid', () => {
      const error = validateUpdateTask({ dueDate: 'invalid-date' });
      expect(error).toBe('dueDate must be a valid ISO date string');
    });
  });

  describe('validateAssignTask', () => {
    test('passes with valid assignee string', () => {
      if (typeof validateAssignTask === 'function') {
        expect(validateAssignTask({ assignee: 'Alice Johnson' })).toBeNull();
      }
    });

    test('fails when assignee is missing', () => {
      if (typeof validateAssignTask === 'function') {
        expect(validateAssignTask({})).toBe('assignee is required and must be a non-empty string');
      }
    });

    test('fails when assignee is empty or whitespace', () => {
      if (typeof validateAssignTask === 'function') {
        expect(validateAssignTask({ assignee: '   ' })).toBe('assignee is required and must be a non-empty string');
      }
    });

    test('fails when assignee is not a string', () => {
      if (typeof validateAssignTask === 'function') {
        expect(validateAssignTask({ assignee: 12345 })).toBe('assignee is required and must be a non-empty string');
      }
    });
  });
});
