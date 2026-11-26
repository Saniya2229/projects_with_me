import { Router } from 'express';
import {
  createTask,
  deleteTask,
  exportTasksCsv,
  getTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../controllers/taskController.js';

const router = Router();

router.get('/export', exportTasksCsv);
router.get('/', listTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.put('/:id/status', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;

