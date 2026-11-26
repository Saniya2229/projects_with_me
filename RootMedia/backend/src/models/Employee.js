import mongoose from 'mongoose';

export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required.'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full Name is required.'],
      trim: true,
      minlength: [2, 'Full Name must be at least 2 characters.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address.'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required.'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required.'],
      enum: {
        values: DEPARTMENTS,
        message: 'Department must be one of: Development, Design, QA, HR, Sales.',
      },
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: [true, 'Joining Date is required.'],
    },
    status: {
      type: String,
      enum: {
        values: EMPLOYEE_STATUSES,
        message: 'Status must be Active, Inactive, or On Leave.',
      },
      default: 'Active',
    },
    skills: {
      type: [String],
      default: [],
    },
    leaveStart: {
      type: Date,
      default: null,
    },
    leaveEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.index({ fullName: 'text', email: 'text', employeeId: 'text' });

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;

