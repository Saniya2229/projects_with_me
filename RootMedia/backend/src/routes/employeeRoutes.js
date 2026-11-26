import { Router } from 'express';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from '../controllers/employeeController.js';

const router = Router();

router.get('/', listEmployees);
router.post('/', createEmployee);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

export default router;

