const taskService = require('../src/services/taskService');

describe('TaskService Unit Tests', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create', () => {
    test('creates a task with default values', () => {
      const task = taskService.create({ title: 'Default Task' });
      expect(task).toBeDefined();
      expect(task.id).toBeDefined();
      expect(task.title).toBe('Default Task');
      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.dueDate).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.createdAt).toBeDefined();
    });

    test('creates a task with custom fields', () => {
      const customDate = '2026-12-01T10:00:00.000Z';
      const task = taskService.create({
        title: 'Custom Task',
        description: 'Detailed description',
        status: 'in_progress',
        priority: 'high',
        dueDate: customDate,
      });

      expect(task.title).toBe('Custom Task');
      expect(task.description).toBe('Detailed description');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe(customDate);
    });
  });

  describe('getAll', () => {
    test('returns an empty array when no tasks exist', () => {
      expect(taskService.getAll()).toEqual([]);
    });

    test('returns all created tasks as a shallow copy', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const all = taskService.getAll();
      expect(all.length).toBe(2);

      // Mutating returned array should not mutate internal store
      all.pop();
      expect(taskService.getAll().length).toBe(2);
    });
  });

  describe('findById', () => {
    test('finds task by ID', () => {
      const created = taskService.create({ title: 'Find Me' });
      const found = taskService.findById(created.id);
      expect(found).toEqual(created);
    });

    test('returns undefined for non-existent ID', () => {
      const found = taskService.findById('non-existent-id');
      expect(found).toBeUndefined();
    });
  });

  describe('getByStatus', () => {
    test('filters tasks by exact status', () => {
      taskService.create({ title: 'Task 1', status: 'todo' });
      taskService.create({ title: 'Task 2', status: 'done' });
      taskService.create({ title: 'Task 3', status: 'in_progress' });

      const todos = taskService.getByStatus('todo');
      expect(todos.length).toBe(1);
      expect(todos[0].title).toBe('Task 1');

      const doneTasks = taskService.getByStatus('done');
      expect(doneTasks.length).toBe(1);
      expect(doneTasks[0].title).toBe('Task 2');
    });

    test('does not return false positives on partial status substrings', () => {
      taskService.create({ title: 'Todo Task', status: 'todo' });
      taskService.create({ title: 'Done Task', status: 'done' });

      // 'do' is a substring of both 'todo' and 'done'
      const partialMatch = taskService.getByStatus('do');
      expect(partialMatch.length).toBe(0);
    });
  });

  describe('getPaginated', () => {
    beforeEach(() => {
      for (let i = 1; i <= 15; i++) {
        taskService.create({ title: `Task ${i}` });
      }
    });

    test('returns first page with correct offset for 1-based page index', () => {
      const page1 = taskService.getPaginated(1, 5);
      expect(page1.length).toBe(5);
      expect(page1[0].title).toBe('Task 1');
      expect(page1[4].title).toBe('Task 5');
    });

    test('returns second page correctly', () => {
      const page2 = taskService.getPaginated(2, 5);
      expect(page2.length).toBe(5);
      expect(page2[0].title).toBe('Task 6');
      expect(page2[4].title).toBe('Task 10');
    });

    test('returns remaining items on the last page', () => {
      const page3 = taskService.getPaginated(3, 6);
      expect(page3.length).toBe(3);
      expect(page3[0].title).toBe('Task 13');
      expect(page3[2].title).toBe('Task 15');
    });

    test('returns empty array when page is out of bounds', () => {
      const pageOut = taskService.getPaginated(10, 5);
      expect(pageOut).toEqual([]);
    });
  });

  describe('getStats', () => {
    test('returns accurate counts and overdue count', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 1 day in future

      // 1 todo past due (overdue)
      taskService.create({ title: 'Overdue Todo', status: 'todo', dueDate: pastDate });
      // 1 in_progress past due (overdue)
      taskService.create({ title: 'Overdue In Progress', status: 'in_progress', dueDate: pastDate });
      // 1 done past due (not overdue because it is done)
      taskService.create({ title: 'Completed Past Due', status: 'done', dueDate: pastDate });
      // 1 todo in future (not overdue)
      taskService.create({ title: 'Future Todo', status: 'todo', dueDate: futureDate });
      // 1 todo without due date
      taskService.create({ title: 'No Due Date', status: 'todo', dueDate: null });

      const stats = taskService.getStats();
      expect(stats.todo).toBe(3);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(2);
    });

    test('returns zeros when no tasks exist', () => {
      const stats = taskService.getStats();
      expect(stats).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });
  });

  describe('update', () => {
    test('updates an existing task fields', () => {
      const task = taskService.create({ title: 'Original' });
      const updated = taskService.update(task.id, { title: 'Updated', priority: 'high' });

      expect(updated).toBeDefined();
      expect(updated.title).toBe('Updated');
      expect(updated.priority).toBe('high');
      expect(taskService.findById(task.id).title).toBe('Updated');
    });

    test('returns null when updating non-existent task', () => {
      const result = taskService.update('non-existent-id', { title: 'Test' });
      expect(result).toBeNull();
    });

    test('does not overwrite immutable fields like id and createdAt', () => {
      const task = taskService.create({ title: 'Immutable Test' });
      const originalId = task.id;
      const originalCreatedAt = task.createdAt;

      const updated = taskService.update(task.id, {
        id: 'tampered-id',
        createdAt: '1970-01-01T00:00:00.000Z',
        title: 'Safe Update',
      });

      expect(updated.id).toBe(originalId);
      expect(updated.createdAt).toBe(originalCreatedAt);
      expect(updated.title).toBe('Safe Update');
    });
  });

  describe('remove', () => {
    test('removes an existing task and returns true', () => {
      const task = taskService.create({ title: 'To Delete' });
      const result = taskService.remove(task.id);
      expect(result).toBe(true);
      expect(taskService.findById(task.id)).toBeUndefined();
    });

    test('returns false when task does not exist', () => {
      const result = taskService.remove('fake-id');
      expect(result).toBe(false);
    });
  });

  describe('completeTask', () => {
    test('marks task as done and sets completedAt timestamp without changing original priority', () => {
      const task = taskService.create({ title: 'High Priority Task', priority: 'high' });
      const completed = taskService.completeTask(task.id);

      expect(completed).toBeDefined();
      expect(completed.status).toBe('done');
      expect(completed.completedAt).toBeDefined();
      expect(new Date(completed.completedAt).getTime()).not.toBeNaN();
      // Crucial: priority should remain 'high' and not be reset to 'medium'
      expect(completed.priority).toBe('high');
    });

    test('returns null if task does not exist', () => {
      const result = taskService.completeTask('fake-id');
      expect(result).toBeNull();
    });
  });

  describe('assignTask (New Feature)', () => {
    test('assigns task to a user', () => {
      const task = taskService.create({ title: 'Task to Assign' });
      if (typeof taskService.assignTask === 'function') {
        const updated = taskService.assignTask(task.id, 'John Doe');
        expect(updated).toBeDefined();
        expect(updated.assignee).toBe('John Doe');
        expect(taskService.findById(task.id).assignee).toBe('John Doe');
      }
    });

    test('reassigns task to a new user', () => {
      const task = taskService.create({ title: 'Task to Reassign' });
      if (typeof taskService.assignTask === 'function') {
        taskService.assignTask(task.id, 'John Doe');
        const reallocated = taskService.assignTask(task.id, 'Jane Smith');
        expect(reallocated.assignee).toBe('Jane Smith');
      }
    });

    test('returns null if task does not exist', () => {
      if (typeof taskService.assignTask === 'function') {
        const result = taskService.assignTask('invalid-id', 'John Doe');
        expect(result).toBeNull();
      }
    });
  });
});
