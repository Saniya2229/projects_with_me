// Automated integration test script — run against live backend on port 5000
const BASE = 'http://localhost:5000/api';

async function req(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

let empId1, empId2, taskId1, taskId2, taskId3, taskId4;
let pass = 0, fail = 0;

function assert(label, condition, detail) {
  if (condition) { pass++; console.log(`  ✅ ${label}`); }
  else { fail++; console.log(`  ❌ ${label} — ${detail || ''}`); }
}

async function run() {
  console.log('\n═══ 1. Health ═══');
  const h = await req('GET', '/health');
  assert('Health OK', h.status === 200 && h.data.status === 'OK');

  console.log('\n═══ 2. Create Employees ═══');
  const e1 = await req('POST', '/employees', {
    employeeId: 'TEST-001', fullName: 'Alice Dev', email: 'alice@test.com',
    phone: '1234567890', department: 'Development', role: 'Developer',
    joiningDate: '2024-01-10', status: 'Active', skills: ['React', 'Node.js']
  });
  assert('Create emp1 → 201', e1.status === 201, `got ${e1.status}`);
  empId1 = e1.data?.data?._id;

  const e2 = await req('POST', '/employees', {
    employeeId: 'TEST-002', fullName: 'Bob QA', email: 'bob@test.com',
    phone: '9876543210', department: 'QA', role: 'Tester',
    joiningDate: '2024-03-01', status: 'On Leave',
    leaveStart: '2026-11-20', leaveEnd: '2026-12-05', skills: ['Selenium']
  });
  assert('Create emp2 (On Leave) → 201', e2.status === 201, `got ${e2.status}`);
  empId2 = e2.data?.data?._id;

  // Duplicate employeeId
  const eDup = await req('POST', '/employees', {
    employeeId: 'TEST-001', fullName: 'Dup', email: 'dup@test.com',
    phone: '111', department: 'HR', role: 'HR', joiningDate: '2024-01-01'
  });
  assert('Dup employeeId → 409', eDup.status === 409, `got ${eDup.status}`);

  // Duplicate email
  const eDup2 = await req('POST', '/employees', {
    employeeId: 'TEST-099', fullName: 'Dup2', email: 'alice@test.com',
    phone: '222', department: 'HR', role: 'HR', joiningDate: '2024-01-01'
  });
  assert('Dup email → 409', eDup2.status === 409, `got ${eDup2.status}`);

  console.log('\n═══ 3. Create Tasks ═══');
  const t1 = await req('POST', '/tasks', {
    title: 'Task One', assignedEmployee: empId1,
    priority: 'High', department: 'Development',
    startDate: '2026-11-20', dueDate: '2026-11-24' // past due → overdue
  });
  assert('Create task1 → 201 & status=Todo', t1.status === 201 && t1.data?.data?.status === 'Todo', `${t1.status} ${t1.data?.data?.status}`);
  taskId1 = t1.data?.data?._id;

  const t2 = await req('POST', '/tasks', {
    title: 'Task Two', assignedEmployee: empId1,
    priority: 'Medium', department: 'Development',
    startDate: '2026-11-25', dueDate: '2026-12-15'
  });
  assert('Create task2 → 201', t2.status === 201);
  taskId2 = t2.data?.data?._id;

  const t3 = await req('POST', '/tasks', {
    title: 'Task Three', assignedEmployee: empId1,
    priority: 'Low', department: 'Development',
    startDate: '2026-11-25', dueDate: '2026-12-20'
  });
  assert('Create task3 → 201 (3rd active)', t3.status === 201);
  taskId3 = t3.data?.data?._id;

  // 4th task → capacity exceeded
  const t4 = await req('POST', '/tasks', {
    title: 'Task Four', assignedEmployee: empId1,
    priority: 'Critical', department: 'Development',
    startDate: '2026-11-25', dueDate: '2026-12-25'
  });
  assert('4th task → 400 capacity', t4.status === 400, `got ${t4.status}: ${t4.data?.message}`);

  // dueDate < startDate
  const tBadDate = await req('POST', '/tasks', {
    title: 'Bad Date', assignedEmployee: empId2,
    priority: 'Low', department: 'QA',
    startDate: '2026-12-10', dueDate: '2026-11-01'
  });
  assert('dueDate < startDate → 400', tBadDate.status === 400, `got ${tBadDate.status}`);

  // Assign to On-Leave emp during leave period
  const tOnLeave = await req('POST', '/tasks', {
    title: 'Leave Task', assignedEmployee: empId2,
    priority: 'Low', department: 'QA',
    startDate: '2026-11-25', dueDate: '2026-12-01' // falls within leave window
  });
  assert('On Leave start in window → 400', tOnLeave.status === 400, `got ${tOnLeave.status}`);

  // Assign to On-Leave emp outside leave period (should succeed)
  const tOutside = await req('POST', '/tasks', {
    title: 'Outside Leave', assignedEmployee: empId2,
    priority: 'Low', department: 'QA',
    startDate: '2026-12-10', dueDate: '2026-12-20'
  });
  assert('On Leave start outside window → 201', tOutside.status === 201, `got ${tOutside.status}`);
  taskId4 = tOutside.data?.data?._id;

  console.log('\n═══ 4. Status Transitions ═══');
  const s1 = await req('PUT', `/tasks/${taskId1}/status`, { status: 'In Progress' });
  assert('Todo → In Progress → 200', s1.status === 200 && s1.data?.data?.status === 'In Progress');

  const s2 = await req('PUT', `/tasks/${taskId1}/status`, { status: 'Completed' });
  assert('In Progress → Completed → 200 + completedDate set', s2.status === 200 && s2.data?.data?.completedDate != null, `completedDate=${s2.data?.data?.completedDate}`);

  // Invalid: Completed → In Progress
  const s3 = await req('PUT', `/tasks/${taskId1}/status`, { status: 'In Progress' });
  assert('Completed → In Progress → 400', s3.status === 400);

  // Cancel from Todo
  const s4 = await req('PUT', `/tasks/${taskId2}/status`, { status: 'Cancelled' });
  assert('Todo → Cancelled → 200', s4.status === 200);

  // Edit completed task → 400
  const eComp = await req('PUT', `/tasks/${taskId1}`, { title: 'Changed' });
  assert('Edit completed → 400', eComp.status === 400, `got ${eComp.status}`);

  // Edit cancelled task → 400
  const eCanc = await req('PUT', `/tasks/${taskId2}`, { title: 'Changed' });
  assert('Edit cancelled → 400', eCanc.status === 400, `got ${eCanc.status}`);

  console.log('\n═══ 5. Dashboard ═══');
  const d = await req('GET', '/dashboard');
  assert('Dashboard → 200', d.status === 200);
  assert('Dashboard emp total >= 2', d.data.employees.total >= 2, `total=${d.data.employees.total}`);
  assert('Dashboard overdue >= 0', typeof d.data.tasks.overdue === 'number');

  console.log('\n═══ 6. Overdue Detection ═══');
  const tDetail = await req('GET', `/tasks/${taskId1}`);
  // task1 dueDate=2026-11-24, today=2026-11-25, but it is Completed so NOT overdue
  assert('Completed task NOT overdue', tDetail.data?.data?.isOverdue === false);

  console.log('\n═══ 7. Pagination & Filters ═══');
  const paged = await req('GET', '/tasks?page=1&limit=2');
  assert('Paginated tasks → meta present', paged.data?.meta?.totalPages >= 1);

  const filtered = await req('GET', '/employees?department=Development');
  assert('Filter by dept → results match', filtered.data?.data?.every(e => e.department === 'Development'));

  console.log('\n═══ 8. CSV Export ═══');
  const csvRes = await fetch(`${BASE}/tasks/export`);
  const csvText = await csvRes.text();
  assert('CSV export → 200 + headers', csvRes.status === 200 && csvText.startsWith('Task ID,'));

  console.log('\n═══ 9. Delete Employee With Active Tasks ═══');
  // emp1 still has task3 active (Todo)
  const delBlocked = await req('DELETE', `/employees/${empId1}`);
  assert('Delete emp with active tasks → 400', delBlocked.status === 400, `got ${delBlocked.status}`);

  console.log('\n═══ 10. Cleanup ═══');
  // Delete tasks to free emp1
  await req('DELETE', `/tasks/${taskId1}`);
  await req('DELETE', `/tasks/${taskId2}`);
  await req('DELETE', `/tasks/${taskId3}`);
  await req('DELETE', `/tasks/${taskId4}`);
  const delEmp1 = await req('DELETE', `/employees/${empId1}`);
  assert('Delete emp1 after removing tasks → 200', delEmp1.status === 200, `got ${delEmp1.status}`);
  const delEmp2 = await req('DELETE', `/employees/${empId2}`);
  assert('Delete emp2 → 200', delEmp2.status === 200, `got ${delEmp2.status}`);

  console.log(`\n════════════════════════════`);
  console.log(`  TOTAL: ${pass + fail} | ✅ PASS: ${pass} | ❌ FAIL: ${fail}`);
  console.log(`════════════════════════════\n`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => { console.error('Test runner error:', err); process.exit(1); });

