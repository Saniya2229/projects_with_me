import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Employee from './models/Employee.js';
import Task from './models/Task.js';
import Counter from './models/Counter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const EMPLOYEES = [
  {
    employeeId: 'EMP-001',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@rootsmedia.example',
    phone: '9876500101',
    department: 'Development',
    role: 'Senior Full-Stack Developer',
    joiningDate: new Date('2023-02-13T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['React', 'Node.js', 'MongoDB'],
  },
  {
    employeeId: 'EMP-002',
    fullName: 'Priya Nair',
    email: 'priya.nair@rootsmedia.example',
    phone: '9876500102',
    department: 'Development',
    role: 'Frontend Developer',
    joiningDate: new Date('2023-08-21T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['React', 'Tailwind CSS', 'Vite'],
  },
  {
    employeeId: 'EMP-003',
    fullName: 'Rohan Mehta',
    email: 'rohan.mehta@rootsmedia.example',
    phone: '9876500103',
    department: 'Development',
    role: 'Backend Developer',
    joiningDate: new Date('2024-01-08T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Express', 'MongoDB', 'REST APIs'],
  },
  {
    employeeId: 'EMP-004',
    fullName: 'Ananya Iyer',
    email: 'ananya.iyer@rootsmedia.example',
    phone: '9876500104',
    department: 'Design',
    role: 'UI/UX Designer',
    joiningDate: new Date('2023-05-15T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Figma', 'Prototyping', 'Design Systems'],
  },
  {
    employeeId: 'EMP-005',
    fullName: 'Kabir Singh',
    email: 'kabir.singh@rootsmedia.example',
    phone: '9876500105',
    department: 'Design',
    role: 'Graphic Designer',
    joiningDate: new Date('2024-06-03T00:00:00.000Z'),
    status: 'On Leave',
    leaveStart: new Date('2026-11-23T00:00:00.000Z'),
    leaveEnd: new Date('2026-12-04T00:00:00.000Z'),
    skills: ['Illustrator', 'Branding'],
  },
  {
    employeeId: 'EMP-006',
    fullName: 'Sneha Patel',
    email: 'sneha.patel@rootsmedia.example',
    phone: '9876500106',
    department: 'QA',
    role: 'QA Engineer',
    joiningDate: new Date('2023-11-06T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Selenium', 'Postman', 'Test Planning'],
  },
  {
    employeeId: 'EMP-007',
    fullName: 'Vikram Rao',
    email: 'vikram.rao@rootsmedia.example',
    phone: '9876500107',
    department: 'QA',
    role: 'Automation Tester',
    joiningDate: new Date('2022-09-19T00:00:00.000Z'),
    status: 'Inactive',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Cypress', 'Jest'],
  },
  {
    employeeId: 'EMP-008',
    fullName: 'Meera Joshi',
    email: 'meera.joshi@rootsmedia.example',
    phone: '9876500108',
    department: 'HR',
    role: 'HR Manager',
    joiningDate: new Date('2021-04-12T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Recruitment', 'Payroll', 'Onboarding'],
  },
  {
    employeeId: 'EMP-009',
    fullName: 'Arjun Kapoor',
    email: 'arjun.kapoor@rootsmedia.example',
    phone: '9876500109',
    department: 'Sales',
    role: 'Sales Executive',
    joiningDate: new Date('2024-03-25T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['CRM', 'Negotiation'],
  },
  {
    employeeId: 'EMP-010',
    fullName: 'Divya Menon',
    email: 'divya.menon@rootsmedia.example',
    phone: '9876500110',
    department: 'Sales',
    role: 'Account Manager',
    joiningDate: new Date('2022-12-05T00:00:00.000Z'),
    status: 'Active',
    leaveStart: null,
    leaveEnd: null,
    skills: ['Client Relations', 'Lead Generation'],
  },
];

const TASKS = [
  {
    empId: 'EMP-001',
    title: 'Build employee CRUD API',
    priority: 'High',
    department: 'Development',
    start: '2026-10-05',
    due: '2026-10-16',
    status: 'Completed',
    description: 'Create REST endpoints for creating, listing, editing and deleting employees with validation.',
  },
  {
    empId: 'EMP-001',
    title: 'Migrate API layer to GraphQL',
    priority: 'Low',
    department: 'Development',
    start: '2026-10-19',
    due: '2026-11-06',
    status: 'Cancelled',
    description: 'Evaluate moving the REST API to GraphQL. Dropped to keep the scope small.',
  },
  {
    empId: 'EMP-001',
    title: 'Implement JWT authentication',
    priority: 'Critical',
    department: 'Development',
    start: '2026-11-16',
    due: '2026-11-27',
    status: 'In Progress',
    description: 'Add login, token refresh and route protection for all API endpoints.',
  },
  {
    empId: 'EMP-001',
    title: 'Optimize dashboard aggregation queries',
    priority: 'Medium',
    department: 'Development',
    start: '2026-11-26',
    due: '2026-12-04',
    status: 'Todo',
    description: 'Reduce load time of the dashboard summary by indexing and simplifying aggregations.',
  },
  {
    empId: 'EMP-002',
    title: 'Build responsive dashboard page',
    priority: 'High',
    department: 'Development',
    start: '2026-10-12',
    due: '2026-10-23',
    status: 'Completed',
    description: 'Create the dashboard with summary cards and charts, working from mobile to desktop.',
  },
  {
    empId: 'EMP-002',
    title: 'Add dark mode toggle',
    priority: 'Medium',
    department: 'Development',
    start: '2026-11-18',
    due: '2026-11-30',
    status: 'In Progress',
    description: 'Add a theme toggle in the navbar and remember the choice between visits.',
  },
  {
    empId: 'EMP-002',
    title: 'Task list filters and pagination UI',
    priority: 'Medium',
    department: 'Development',
    start: '2026-11-27',
    due: '2026-12-08',
    status: 'Todo',
    description: 'Add filters for status, priority and department, plus page controls on the tasks list.',
  },
  {
    empId: 'EMP-003',
    title: 'Add CSV export for tasks',
    priority: 'Medium',
    department: 'Development',
    start: '2026-11-02',
    due: '2026-11-13',
    status: 'Completed',
    description: 'Allow exporting the filtered task list as a CSV file.',
  },
  {
    empId: 'EMP-003',
    title: 'Enforce 3-active-task limit',
    priority: 'High',
    department: 'Development',
    start: '2026-11-20',
    due: '2026-11-24',
    status: 'In Progress',
    description: 'Block assigning a task when the employee already has 3 Todo or In Progress tasks.',
  },
  {
    empId: 'EMP-003',
    title: 'Add request logging middleware',
    priority: 'Low',
    department: 'Development',
    start: '2026-12-01',
    due: '2026-12-10',
    status: 'Todo',
    description: 'Log method, path and response time for every API request.',
  },
  {
    empId: 'EMP-004',
    title: 'Design employee profile page mockups',
    priority: 'High',
    department: 'Design',
    start: '2026-10-20',
    due: '2026-11-03',
    status: 'Completed',
    description: 'Produce high-fidelity mockups for the employee detail view.',
  },
  {
    empId: 'EMP-004',
    title: 'Redesign dashboard summary cards',
    priority: 'Medium',
    department: 'Design',
    start: '2026-11-17',
    due: '2026-11-28',
    status: 'In Progress',
    description: 'Refresh the card layout, icons and spacing to improve readability.',
  },
  {
    empId: 'EMP-005',
    title: 'Design social media banners',
    priority: 'Medium',
    department: 'Design',
    start: '2026-10-26',
    due: '2026-11-06',
    status: 'Completed',
    description: 'Create a set of banners for the October campaign.',
  },
  {
    empId: 'EMP-005',
    title: 'Prepare Q1 campaign creatives',
    priority: 'Medium',
    department: 'Design',
    start: '2026-12-07',
    due: '2026-12-18',
    status: 'Todo',
    description: 'Design ad creatives for the Q1 campaign. Starts after the leave period ends.',
  },
  {
    empId: 'EMP-006',
    title: 'Test employee CRUD flows',
    priority: 'High',
    department: 'QA',
    start: '2026-10-14',
    due: '2026-10-21',
    status: 'Completed',
    description: 'Write and run test cases for adding, editing and deleting employees.',
  },
  {
    empId: 'EMP-006',
    title: 'Regression test task assignment rules',
    priority: 'Critical',
    department: 'QA',
    start: '2026-11-19',
    due: '2026-11-27',
    status: 'In Progress',
    description: 'Verify inactive, on-leave and 3-task-limit rules after the latest changes.',
  },
  {
    empId: 'EMP-006',
    title: 'Write test cases for CSV export',
    priority: 'Medium',
    department: 'QA',
    start: '2026-11-26',
    due: '2026-12-03',
    status: 'Todo',
    description: 'Cover empty lists, special characters and large exports.',
  },
  {
    empId: 'EMP-007',
    title: 'Set up Cypress end-to-end suite',
    priority: 'High',
    department: 'QA',
    start: '2026-09-14',
    due: '2026-09-30',
    status: 'Completed',
    description: 'Configure Cypress and add smoke tests for the main flows.',
  },
  {
    empId: 'EMP-007',
    title: 'Run load testing on task API',
    priority: 'Low',
    department: 'QA',
    start: '2026-10-05',
    due: '2026-10-16',
    status: 'Cancelled',
    description: 'Load test the task endpoints. Cancelled when the employee left.',
  },
  {
    empId: 'EMP-008',
    title: 'Organize onboarding for new joiners',
    priority: 'Medium',
    department: 'HR',
    start: '2026-10-27',
    due: '2026-11-07',
    status: 'Completed',
    description: 'Prepare the welcome kit, accounts and the first-week schedule.',
  },
  {
    empId: 'EMP-008',
    title: 'Run Q4 hiring drive',
    priority: 'High',
    department: 'HR',
    start: '2026-11-10',
    due: '2026-12-15',
    status: 'In Progress',
    description: 'Shortlist, interview and make offers for open Development and QA roles.',
  },
  {
    empId: 'EMP-008',
    title: 'Update employee handbook',
    priority: 'Low',
    department: 'HR',
    start: '2026-12-01',
    due: '2026-12-12',
    status: 'Todo',
    description: 'Revise leave policy and remote work sections.',
  },
  {
    empId: 'EMP-009',
    title: 'Prepare client proposal for Orion Retail',
    priority: 'High',
    department: 'Sales',
    start: '2026-10-19',
    due: '2026-10-30',
    status: 'Completed',
    description: 'Draft pricing, scope and timeline for the proposal.',
  },
  {
    empId: 'EMP-009',
    title: 'Follow up with 15 warm leads',
    priority: 'Medium',
    department: 'Sales',
    start: '2026-11-23',
    due: '2026-11-30',
    status: 'In Progress',
    description: 'Call or email leads from the last campaign and log the outcomes in the CRM.',
  },
  {
    empId: 'EMP-009',
    title: 'Prepare quarterly sales report',
    priority: 'High',
    department: 'Sales',
    start: '2026-12-01',
    due: '2026-12-07',
    status: 'Todo',
    description: 'Summarize revenue, pipeline and conversion for Q4.',
  },
  {
    empId: 'EMP-010',
    title: 'Onboard new enterprise client',
    priority: 'Critical',
    department: 'Sales',
    start: '2026-10-08',
    due: '2026-10-24',
    status: 'Completed',
    description: 'Run kickoff, collect requirements and set up the account.',
  },
  {
    empId: 'EMP-010',
    title: 'Renew annual contracts for key accounts',
    priority: 'Critical',
    department: 'Sales',
    start: '2026-11-12',
    due: '2026-11-22',
    status: 'In Progress',
    description: 'Negotiate and close renewals for the top five accounts.',
  },
  {
    empId: 'EMP-010',
    title: 'Run client satisfaction survey',
    priority: 'Medium',
    department: 'Sales',
    start: '2026-12-02',
    due: '2026-12-14',
    status: 'Todo',
    description: 'Send the survey, collect responses and summarize the results.',
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in backend/.env');
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Clear existing data so sample dataset is exact
  await Promise.all([
    Task.deleteMany({}),
    Employee.deleteMany({}),
    Counter.deleteMany({ _id: 'taskId' }),
  ]);

  const insertedEmployees = await Employee.insertMany(EMPLOYEES);
  const empByCode = new Map(insertedEmployees.map((e) => [e.employeeId, e]));

  const taskDocs = TASKS.map((t, index) => {
    const emp = empByCode.get(t.empId);
    if (!emp) throw new Error(`Missing employee ${t.empId}`);
    const num = String(index + 1).padStart(3, '0');
    const startDate = new Date(`${t.start}T00:00:00.000Z`);
    const dueDate = new Date(`${t.due}T00:00:00.000Z`);

    return {
      taskId: `TSK-${num}`,
      title: t.title,
      description: t.description,
      assignedEmployee: emp._id,
      employeeSnapshot: {
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        department: emp.department,
        role: emp.role,
      },
      department: t.department,
      priority: t.priority,
      status: t.status,
      startDate,
      dueDate,
      createdDate: startDate,
      completedDate: t.status === 'Completed' ? dueDate : null,
    };
  });

  // Use create() in sequence or insertMany after computing priorityWeight
  for (const doc of taskDocs) {
    await Task.create(doc);
  }

  await Counter.create({ _id: 'taskId', seq: taskDocs.length });

  console.log(`Seeded ${insertedEmployees.length} employees and ${taskDocs.length} tasks.`);
  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
