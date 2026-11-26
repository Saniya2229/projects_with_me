import mongoose from 'mongoose';
import { DEPARTMENTS } from './Employee.js';

export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
export const PRIORITY_WEIGHT = { Low: 1, Medium: 2, High: 3, Critical: 4 };

const taskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Assigned Employee is required.'],
    },
    // Preserves meaningful employee details if the employee is later deleted
    employeeSnapshot: {
      employeeId: { type: String, required: true },
      fullName: { type: String, required: true },
      department: { type: String, required: true },
      role: { type: String, default: '' },
    },
    department: {
      type: String,
      required: [true, 'Department is required.'],
      enum: {
        values: DEPARTMENTS,
        message: 'Department must be one of: Development, Design, QA, HR, Sales.',
      },
    },
    priority: {
      type: String,
      required: [true, 'Priority is required.'],
      enum: {
        values: PRIORITIES,
        message: 'Priority must be Low, Medium, High, or Critical.',
      },
    },
    priorityWeight: {
      type: Number,
      default: 2,
    },
    status: {
      type: String,
      enum: {
        values: TASK_STATUSES,
        message: 'Status must be Todo, In Progress, Completed, or Cancelled.',
      },
      default: 'Todo',
    },
    startDate: {
      type: Date,
      required: [true, 'Start Date is required.'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due Date is required.'],
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.pre('save', function syncPriorityWeight(next) {
  this.priorityWeight = PRIORITY_WEIGHT[this.priority] || 2;
  next();
});

taskSchema.index({ status: 1, assignedEmployee: 1 });
taskSchema.index({ department: 1, priority: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;

