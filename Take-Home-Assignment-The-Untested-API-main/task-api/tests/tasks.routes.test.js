const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API Routes Integration Tests', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks/stats', () => {
    test('returns correct counts when database is empty', async () => {
      const res = await request(app).get('/tasks/stats');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        todo: 0,
        in_progress: 0,
        done: 0,
        overdue: 0,
      });
    });

    test('returns accurate stats including overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await request(app).post('/tasks').send({ title: 'Task 1', status: 'todo', dueDate: yesterday });
      await request(app).post('/tasks').send({ title: 'Task 2', status: 'in_progress', dueDate: yesterday });
      await request(app).post('/tasks').send({ title: 'Task 3', status: 'done', dueDate: yesterday });
      await request(app).post('/tasks').send({ title: 'Task 4', status: 'todo', dueDate: tomorrow });

      const res = await request(app).get('/tasks/stats');
      expect(res.status).toBe(200);
      expect(res.body.todo).toBe(2);
      expect(res.body.in_progress).toBe(1);
      expect(res.body.done).toBe(1);
      expect(res.body.overdue).toBe(2); // Task 1 and Task 2 (not Task 3 because status is done)
    });
  });

  describe('GET /tasks', () => {
    test('returns all tasks when no filters are applied', async () => {
      await request(app).post('/tasks').send({ title: 'Task 1' });
      await request(app).post('/tasks').send({ title: 'Task 2' });

      const res = await request(app).get('/tasks');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Task 1');
      expect(res.body[1].title).toBe('Task 2');
    });

    test('filters tasks by exact status', async () => {
      await request(app).post('/tasks').send({ title: 'Todo Task', status: 'todo' });
      await request(app).post('/tasks').send({ title: 'Done Task', status: 'done' });
      await request(app).post('/tasks').send({ title: 'Progress Task', status: 'in_progress' });

      const resTodo = await request(app).get('/tasks?status=todo');
      expect(resTodo.status).toBe(200);
      expect(resTodo.body.length).toBe(1);
      expect(resTodo.body[0].title).toBe('Todo Task');

      const resDone = await request(app).get('/tasks?status=done');
      expect(resDone.status).toBe(200);
      expect(resDone.body.length).toBe(1);
      expect(resDone.body[0].title).toBe('Done Task');

      // Edge case: Substring query should not falsely match
      const resPartial = await request(app).get('/tasks?status=do');
      expect(resPartial.status).toBe(200);
      expect(resPartial.body.length).toBe(0);
    });

    test('paginates tasks correctly using page and limit', async () => {
      for (let i = 1; i <= 6; i++) {
        await request(app).post('/tasks').send({ title: `Task ${i}` });
      }

      // Page 1 with limit 2 -> Task 1, Task 2
      const resPage1 = await request(app).get('/tasks?page=1&limit=2');
      expect(resPage1.status).toBe(200);
      expect(resPage1.body.length).toBe(2);
      expect(resPage1.body[0].title).toBe('Task 1');
      expect(resPage1.body[1].title).toBe('Task 2');

      // Page 2 with limit 2 -> Task 3, Task 4
      const resPage2 = await request(app).get('/tasks?page=2&limit=2');
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.length).toBe(2);
      expect(resPage2.body[0].title).toBe('Task 3');
      expect(resPage2.body[1].title).toBe('Task 4');

      // Page 3 with limit 2 -> Task 5, Task 6
      const resPage3 = await request(app).get('/tasks?page=3&limit=2');
      expect(resPage3.status).toBe(200);
      expect(resPage3.body.length).toBe(2);
      expect(resPage3.body[0].title).toBe('Task 5');
      expect(resPage3.body[1].title).toBe('Task 6');

      // Edge case: Page out of range returns empty list
      const resEmpty = await request(app).get('/tasks?page=10&limit=2');
      expect(resEmpty.status).toBe(200);
      expect(resEmpty.body).toEqual([]);
    });

    test('supports combined status filtering and pagination', async () => {
      for (let i = 1; i <= 5; i++) {
        await request(app).post('/tasks').send({ title: `Todo ${i}`, status: 'todo' });
      }
      for (let i = 1; i <= 3; i++) {
        await request(app).post('/tasks').send({ title: `Done ${i}`, status: 'done' });
      }

      const res = await request(app).get('/tasks?status=todo&page=1&limit=3');
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
      expect(res.body[0].title).toBe('Todo 1');
      expect(res.body[2].title).toBe('Todo 3');

      const resPage2 = await request(app).get('/tasks?status=todo&page=2&limit=3');
      expect(resPage2.status).toBe(200);
      expect(resPage2.body.length).toBe(2);
      expect(resPage2.body[0].title).toBe('Todo 4');
      expect(resPage2.body[1].title).toBe('Todo 5');
    });
  });

  describe('POST /tasks', () => {
    test('creates a task with valid required and optional fields', async () => {
      const payload = {
        title: 'New API Task',
        description: 'Complete all requirements',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-11-20T18:00:00.000Z',
      };

      const res = await request(app).post('/tasks').send(payload);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe(payload.title);
      expect(res.body.description).toBe(payload.description);
      expect(res.body.status).toBe(payload.status);
      expect(res.body.priority).toBe(payload.priority);
      expect(res.body.dueDate).toBe(payload.dueDate);
      expect(res.body.completedAt).toBeNull();
      expect(res.body.createdAt).toBeDefined();
    });

    test('creates a task with defaults when only title is given', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Minimal Task' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Minimal Task');
      expect(res.body.description).toBe('');
      expect(res.body.status).toBe('todo');
      expect(res.body.priority).toBe('medium');
      expect(res.body.dueDate).toBeNull();
      expect(res.body.completedAt).toBeNull();
    });

    test('returns 400 when title is missing or empty', async () => {
      const res1 = await request(app).post('/tasks').send({});
      expect(res1.status).toBe(400);
      expect(res1.body.error).toBe('title is required and must be a non-empty string');

      const res2 = await request(app).post('/tasks').send({ title: '   ' });
      expect(res2.status).toBe(400);
      expect(res2.body.error).toBe('title is required and must be a non-empty string');

      const res3 = await request(app).post('/tasks').send({ title: 1234 });
      expect(res3.status).toBe(400);
      expect(res3.body.error).toBe('title is required and must be a non-empty string');
    });

    test('returns 400 when invalid status is provided', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Task', status: 'blocked' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('status must be one of: todo, in_progress, done');
    });

    test('returns 400 when invalid priority is provided', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Task', priority: 'emergency' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('priority must be one of: low, medium, high');
    });

    test('returns 400 when invalid dueDate is provided', async () => {
      const res = await request(app).post('/tasks').send({ title: 'Task', dueDate: 'invalid-date-format' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('dueDate must be a valid ISO date string');
    });
  });

  describe('PUT /tasks/:id', () => {
    test('successfully updates existing task fields', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Original Task' });
      const id = createRes.body.id;

      const updateRes = await request(app).put(`/tasks/${id}`).send({
        title: 'Updated Task Title',
        priority: 'high',
        description: 'New Description',
        status: 'in_progress',
      });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.id).toBe(id);
      expect(updateRes.body.title).toBe('Updated Task Title');
      expect(updateRes.body.priority).toBe('high');
      expect(updateRes.body.description).toBe('New Description');
      expect(updateRes.body.status).toBe('in_progress');
    });

    test('returns 404 when updating non-existent task', async () => {
      const res = await request(app).put('/tasks/non-existent-uuid').send({ title: 'Update Non-existent' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    test('returns 400 when update payload has invalid fields', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Test Task' });
      const id = createRes.body.id;

      const resEmptyTitle = await request(app).put(`/tasks/${id}`).send({ title: '   ' });
      expect(resEmptyTitle.status).toBe(400);
      expect(resEmptyTitle.body.error).toBe('title must be a non-empty string');

      const resBadStatus = await request(app).put(`/tasks/${id}`).send({ status: 'unknown' });
      expect(resBadStatus.status).toBe(400);
      expect(resBadStatus.body.error).toBe('status must be one of: todo, in_progress, done');

      const resBadPriority = await request(app).put(`/tasks/${id}`).send({ priority: 'urgent' });
      expect(resBadPriority.status).toBe(400);
      expect(resBadPriority.body.error).toBe('priority must be one of: low, medium, high');

      const resBadDate = await request(app).put(`/tasks/${id}`).send({ dueDate: 'bad-date' });
      expect(resBadDate.status).toBe(400);
      expect(resBadDate.body.error).toBe('dueDate must be a valid ISO date string');
    });

    test('does not allow overwriting immutable id or createdAt', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Immutable Guard' });
      const id = createRes.body.id;
      const createdAt = createRes.body.createdAt;

      const res = await request(app).put(`/tasks/${id}`).send({
        id: 'new-malicious-id',
        createdAt: '1999-01-01T00:00:00.000Z',
        title: 'New Title',
      });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.createdAt).toBe(createdAt);
      expect(res.body.title).toBe('New Title');
    });
  });

  describe('DELETE /tasks/:id', () => {
    test('successfully deletes task and returns 204 No Content', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Task to Delete' });
      const id = createRes.body.id;

      const deleteRes = await request(app).delete(`/tasks/${id}`);
      expect(deleteRes.status).toBe(204);
      expect(deleteRes.body).toEqual({});

      // Confirm it cannot be fetched
      const getRes = await request(app).get('/tasks');
      expect(getRes.body.find((t) => t.id === id)).toBeUndefined();
    });

    test('returns 404 when deleting non-existent task', async () => {
      const res = await request(app).delete('/tasks/random-non-existent-id');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    test('returns 404 on subsequent delete of the same task', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Task' });
      const id = createRes.body.id;

      await request(app).delete(`/tasks/${id}`);
      const secondDelete = await request(app).delete(`/tasks/${id}`);
      expect(secondDelete.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id/complete', () => {
    test('marks task as completed, sets completedAt, and preserves priority', async () => {
      const createRes = await request(app).post('/tasks').send({
        title: 'Critical Task',
        priority: 'high',
        status: 'todo',
      });
      const id = createRes.body.id;

      const res = await request(app).patch(`/tasks/${id}/complete`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.status).toBe('done');
      expect(res.body.completedAt).toBeDefined();
      expect(new Date(res.body.completedAt).getTime()).not.toBeNaN();
      // Crucial test: Priority must stay 'high', NOT be reset to 'medium'
      expect(res.body.priority).toBe('high');
    });

    test('returns 404 when completing non-existent task', async () => {
      const res = await request(app).patch('/tasks/non-existent-id/complete');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });
  });

  describe('PATCH /tasks/:id/assign (New Feature)', () => {
    test('successfully assigns a task to a user', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Feature Task' });
      const id = createRes.body.id;

      const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Alex Morgan' });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.assignee).toBe('Alex Morgan');

      // Verify persistence
      const listRes = await request(app).get('/tasks');
      const updated = listRes.body.find((t) => t.id === id);
      expect(updated.assignee).toBe('Alex Morgan');
    });

    test('allows reassigning task to a new assignee', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Feature Task' });
      const id = createRes.body.id;

      await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Initial Assignee' });
      const res = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 'Second Assignee' });
      expect(res.status).toBe(200);
      expect(res.body.assignee).toBe('Second Assignee');
    });

    test('returns 404 when assigning a non-existent task', async () => {
      const res = await request(app).patch('/tasks/non-existent-id/assign').send({ assignee: 'Alex Morgan' });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Task not found');
    });

    test('returns 400 when assignee is missing or empty or whitespace', async () => {
      const createRes = await request(app).post('/tasks').send({ title: 'Task' });
      const id = createRes.body.id;

      const resMissing = await request(app).patch(`/tasks/${id}/assign`).send({});
      expect(resMissing.status).toBe(400);
      expect(resMissing.body.error).toBe('assignee is required and must be a non-empty string');

      const resEmpty = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: '   ' });
      expect(resEmpty.status).toBe(400);
      expect(resEmpty.body.error).toBe('assignee is required and must be a non-empty string');

      const resNumber = await request(app).patch(`/tasks/${id}/assign`).send({ assignee: 12345 });
      expect(resNumber.status).toBe(400);
      expect(resNumber.body.error).toBe('assignee is required and must be a non-empty string');
    });
  });
});
