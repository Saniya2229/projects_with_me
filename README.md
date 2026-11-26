# Roots Media Marketing — Employee & Task Management System

> **MERN Stack Intern Practical Assignment** — Roots Media Marketing Pvt. Ltd.

A production-ready, full-stack **Employee & Task Management System** built for a marketing agency workflow. The system handles employee rosters, task assignments with strict business-rule enforcement, live capacity tracking, and a modern bento-grid dashboard — all across a fully separate **React frontend** and **Express + MongoDB backend**.

---

## 📋 Table of Contents

1. [Live Demo / Screenshots](#screenshots)
2. [Assignment Requirements](#assignment-requirements)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Project Structure](#project-structure)
6. [Data Models & Schema](#data-models--schema)
7. [Business Rules Enforced](#business-rules-enforced)
8. [API Reference](#api-reference)
9. [Frontend Pages & Routes](#frontend-pages--routes)
10. [Environment Variables](#environment-variables)
11. [Setup & Running Locally](#setup--running-locally)
12. [Database Seeding](#database-seeding)
13. [Assumptions Made](#assumptions-made)
14. [Assignment Q&A](#assignment-qa)

---

## 🎨 Screenshots

### 1. Dashboard — Dark Mode (Default)

![Dashboard Dark Mode](./screenshots/01-dashboard-dark.png)

### 2. Dashboard — Light Mode

![Dashboard Light Mode](./screenshots/02-dashboard-light.png)

### 3. Employees List

![Employees List](./screenshots/03-employees-list.png)

### 4. Tasks — Card Grid View

![Tasks Card Grid](./screenshots/04-tasks-cards.png)

### 5. Tasks — Table View

![Tasks Table View](./screenshots/05-tasks-table.png)

### 6. Edit Task Form

![Edit Task Form](./screenshots/06-Edit-task-form.png)

### 7. View Task Detail

![View Task Detail](./screenshots/07-View-task-form.png)

### 8. Edit Employee Form

![Edit Employee Form](./screenshots/08-Edit-employee-form.png)

### 9. View Employee Detail

![View Employee Detail](./screenshots/09-View-employee-form2.png)

---

## Assignment Requirements

The following requirements were specified in the **Roots Media Marketing MERN Stack Intern Assignment PDF**:

### Core Objective
Build a full-stack Employee & Task Management System for a marketing agency to manage employees and their assigned tasks.

### Technology Stack (Required)
| Layer | Technology |
|---|---|
| Frontend | React.js (with modern hooks) |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Styling | Tailwind CSS |

### Employee Management
- [x] Add / Edit / Delete employees
- [x] Employee fields: Name, Employee ID, Department, Role, Status, Email, Phone, Joining Date, Skills
- [x] Department options: `Development`, `Design`, `QA`, `HR`, `Sales`
- [x] Employee Status: `Active`, `Inactive`, `On Leave` (with leave date range)
- [x] Search employees by name, email, or ID
- [x] Filter employees by department and status
- [x] Pagination on employee list

### Task Management
- [x] Create / Edit / Delete tasks
- [x] Task fields: Title, Description, Assigned Employee, Department, Priority, Status, Start Date, Due Date
- [x] Priority levels: `Low`, `Medium`, `High`, `Critical`
- [x] Task Status: `Todo`, `In Progress`, `Completed`, `Cancelled`
- [x] Search tasks by title or employee
- [x] Filter by department, priority, status, and due date range
- [x] Sort by multiple criteria (created date, due date, priority, title)
- [x] Pagination on task list
- [x] CSV export of filtered tasks

### Business Rules (Mandatory)
- [x] **Max 3 active tasks per employee** (Todo + In Progress combined)
- [x] **Inactive employees** cannot be assigned new tasks (always rejected)
- [x] **On Leave employees** cannot be assigned tasks starting within their leave window
- [x] **Status transitions** are strictly enforced: `Todo → In Progress → Completed`, or any status `→ Cancelled` (no backward transitions)
- [x] **Completed Date** is automatically set server-side when a task transitions to `Completed`
- [x] **Completed and Cancelled tasks** cannot be edited (read-only)
- [x] **Employee deletion** is blocked if the employee has active (`Todo`/`In Progress`) tasks
- [x] Historical tasks retain employee details even after the employee is deleted (`employeeSnapshot`)
- [x] **Overdue detection** is dynamic: tasks where `dueDate < today` and status is not `Completed`/`Cancelled`

### Dashboard
- [x] Employee overview counters (Total, Active, On Leave, Inactive)
- [x] Task status breakdown with proportional progress bar
- [x] Weekly sprint timeline visualization
- [x] Employee workload & capacity bars
- [x] All counters click-through to filtered list views

### UI/UX
- [x] **Dark mode (default)** + Light mode toggle in navbar
- [x] Responsive design (mobile to desktop)
- [x] Toast notifications for CRUD feedback
- [x] Confirm modal before deletion
- [x] URL-synced filters, search, sorting, and pagination (bookmarkable)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI component library |
| **Vite** | 6.x | Build tool & dev server |
| **React Router DOM** | 6.x | Client-side routing + `useSearchParams` |
| **Tailwind CSS** | 4.x | Utility-first styling with CSS custom properties |
| **Axios** | 1.x | HTTP client for API calls |
| **Lucide React** | latest | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 24.x | JavaScript runtime |
| **Express** | 4.x | Web framework & REST API |
| **Mongoose** | 8.x | MongoDB ODM with schema validation |
| **MongoDB Atlas** | Cloud | Hosted database (replica set) |
| **dotenv** | 16.x | Environment variable loading |
| **cors** | 2.x | Cross-Origin Resource Sharing headers |
| **helmet** | 8.x | HTTP security headers |
| **morgan** | 1.x | HTTP request logging |
| **nodemon** | 3.x | Dev hot-reload for the server |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                               │
│                                                                     │
│  React 18 (Vite)  ─────────────────────────────────────────────    │
│  ├── React Router DOM v6 (URL-synced state via useSearchParams)     │
│  ├── ThemeContext  (dark / light — persisted to localStorage)       │
│  ├── ToastContext  (global success / error notifications)           │
│  ├── Axios Client  (baseURL = VITE_API_BASE_URL)                    │
│  └── Pages: Dashboard | Employees | Tasks (CRUD + detail views)    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  HTTP / REST API  (port 5173 → 5000)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     BACKEND  (Node.js + Express)                    │
│                                                                     │
│  Middleware Stack:                                                  │
│  ├── helmet()          — Security headers                           │
│  ├── cors()            — Allow frontend origin                      │
│  ├── morgan()          — HTTP request logging                       │
│  └── express.json()    — Parse JSON bodies                          │
│                                                                     │
│  Routes:                                                            │
│  ├── GET  /api/health                                               │
│  ├── GET  /api/dashboard                                            │
│  ├── /api/employees    → employeeController                         │
│  └── /api/tasks        → taskController                            │
│                                                                     │
│  Business Logic (src/utils/businessRules.js):                       │
│  ├── validateEmployeeEligibility()   — Active / On Leave checks     │
│  ├── isValidStatusTransition()       — Todo→InProgress→Completed    │
│  ├── validateTaskDates()             — startDate ≤ dueDate          │
│  └── MAX_ACTIVE_TASKS = 3            — Capacity enforcement         │
│                                                                     │
│  Error Handler:                                                     │
│  ├── CastError       → 400                                          │
│  ├── ValidationError → 422                                          │
│  ├── Duplicate key   → 409                                          │
│  └── AppError        → custom status                                │
└───────────────────────────────┬─────────────────────────────────────┘
                                │  Mongoose ODM (mongoose.connect)
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas (Cloud)                             │
│                                                                     │
│  Collections:                                                       │
│  ├── employees   — text index on fullName / email / employeeId      │
│  ├── tasks       — compound indexes on status+assignedEmployee,     │
│  │                 department+priority+dueDate                      │
│  └── counters    — atomic sequential taskId (TSK-001, TSK-002…)    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
Root Assignment/
│
├── frontend/                        # React 18 + Vite + Tailwind CSS
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx                 # App entry point
│       ├── App.jsx                  # Router setup
│       ├── index.css                # CSS variables (theme tokens) + motion utilities
│       │
│       ├── api/                     # Axios API layer
│       │   ├── client.js            # Axios instance (baseURL, error extraction)
│       │   ├── dashboard.api.js     # GET /api/dashboard
│       │   ├── employees.api.js     # Employee CRUD calls
│       │   └── tasks.api.js         # Task CRUD + status + CSV export
│       │
│       ├── context/
│       │   ├── ThemeContext.jsx     # Dark / Light mode (localStorage persistence)
│       │   └── ToastContext.jsx     # Global toast notification system
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx       # Top navigation + ThemeToggle
│       │   │   ├── AppLayout.jsx    # Page wrapper (Navbar + main content)
│       │   │   └── ThemeToggle.jsx  # Sun / Moon icon button
│       │   ├── common/
│       │   │   ├── ActionMenu.jsx   # Portal-based ⋮ dropdown (View / Edit / Delete)
│       │   │   ├── ConfirmModal.jsx # Delete confirmation dialog
│       │   │   ├── ErrorBanner.jsx  # Inline API error display
│       │   │   ├── LoadingSpinner.jsx
│       │   │   ├── Pagination.jsx   # Prev / Next / page number controls
│       │   │   ├── StatusBadge.jsx  # Coloured status pill
│       │   │   └── ToastContainer.jsx
│       │   └── tasks/
│       │       └── TaskStatusDropdown.jsx  # Inline status transition dropdown
│       │
│       ├── pages/
│       │   ├── DashboardPage.jsx    # /            — KPI strip, timeline, capacity
│       │   ├── EmployeesListPage.jsx# /employees   — search, filter, paginated table
│       │   ├── EmployeeFormPage.jsx # /employees/new, /employees/:id/edit
│       │   ├── EmployeeViewPage.jsx # /employees/:id
│       │   ├── TasksListPage.jsx    # /tasks       — card grid + table toggle
│       │   ├── TaskFormPage.jsx     # /tasks/new, /tasks/:id/edit
│       │   └── TaskViewPage.jsx     # /tasks/:id
│       │
│       └── utils/
│           ├── constants.js         # Departments, priorities, statuses, sort options
│           ├── dateUtils.js         # Date formatting helpers
│           └── validators.js        # Client-side form validation
│
├── backend/                         # Node.js + Express + Mongoose
│   ├── package.json
│   ├── .env                         # ⚠️ Not committed (contains real credentials)
│   ├── .env.example                 # Placeholder template for reference
│   └── src/
│       ├── server.js                # DB connect → listen
│       ├── app.js                   # Express app, middleware, routes
│       ├── seed.js                  # One-off seed script (10 employees, 28 tasks)
│       │
│       ├── config/
│       │   ├── env.js               # Parsed env exports (PORT, MONGODB_URI…)
│       │   └── db.js                # mongoose.connect() with retry logging
│       │
│       ├── models/
│       │   ├── Employee.js          # Employee schema + text index
│       │   ├── Task.js              # Task schema + priorityWeight pre-save hook
│       │   └── Counter.js           # Atomic sequential taskId counter
│       │
│       ├── controllers/
│       │   ├── dashboardController.js  # Aggregation pipeline for stats + workload
│       │   ├── employeeController.js   # CRUD + snapshot sync + delete guard
│       │   └── taskController.js       # CRUD + status transitions + CSV export
│       │
│       ├── routes/
│       │   ├── dashboardRoutes.js
│       │   ├── employeeRoutes.js
│       │   └── taskRoutes.js        # /export before /:id to avoid route conflict
│       │
│       ├── middleware/
│       │   └── errorHandler.js      # Centralized error → HTTP response mapping
│       │
│       └── utils/
│           ├── businessRules.js     # All 7 business rule validators + AppError
│           └── csvExporter.js       # tasksToCsv() with proper cell escaping
│
├── screenshots/                     # UI screenshots for README
│   ├── 01-dashboard-dark.png
│   ├── 02-dashboard-light.png
│   └── ...
│
├── .gitignore                       # node_modules, .env, dist
└── README.md                        # This file
```

---

## Data Models & Schema

### Employee

| Field | Type | Constraints |
|---|---|---|
| `employeeId` | `String` | Required, unique, uppercase (e.g., `EMP-001`) |
| `fullName` | `String` | Required, min 2 chars |
| `email` | `String` | Required, unique, lowercase, valid email format |
| `phone` | `String` | Required |
| `department` | `String` | Enum: `Development`, `Design`, `QA`, `HR`, `Sales` |
| `role` | `String` | Required (e.g., `Senior Full-Stack Developer`) |
| `joiningDate` | `Date` | Required |
| `status` | `String` | Enum: `Active`, `Inactive`, `On Leave` (default: `Active`) |
| `skills` | `[String]` | Array, default `[]` |
| `leaveStart` | `Date` | Null unless `status = On Leave` |
| `leaveEnd` | `Date` | Null unless `status = On Leave` |
| `createdAt` | `Date` | Auto (Mongoose timestamps) |
| `updatedAt` | `Date` | Auto (Mongoose timestamps) |

> **Text Index** on `fullName`, `email`, `employeeId` — powers the `search` query param.

### Task

| Field | Type | Constraints |
|---|---|---|
| `taskId` | `String` | Auto-generated, unique (`TSK-001`, `TSK-002`…) |
| `title` | `String` | Required, min 3 chars |
| `description` | `String` | Optional, default `""` |
| `assignedEmployee` | `ObjectId` | Ref `Employee`, required |
| `employeeSnapshot` | `Object` | `{ employeeId, fullName, department, role }` — preserved on employee delete |
| `department` | `String` | Enum same as Employee |
| `priority` | `String` | Enum: `Low`, `Medium`, `High`, `Critical` |
| `priorityWeight` | `Number` | Auto-computed (Low=1, Medium=2, High=3, Critical=4) — powers sort |
| `status` | `String` | Enum: `Todo`, `In Progress`, `Completed`, `Cancelled` (default: `Todo`) |
| `startDate` | `Date` | Required |
| `dueDate` | `Date` | Required, must be ≥ `startDate` |
| `createdDate` | `Date` | Default `Date.now` |
| `completedDate` | `Date` | Auto-set server-side when status → `Completed`, else `null` |

> **Compound Indexes**: `{ status, assignedEmployee }` and `{ department, priority, dueDate }`.

### Counter

Stores the latest `taskId` sequence number. Used with `findOneAndUpdate` to atomically generate `TSK-001`, `TSK-002`, etc.

---

## Business Rules Enforced

All rules are enforced **server-side** in `backend/src/utils/businessRules.js` and cannot be bypassed from the client:

| # | Rule | Implementation |
|---|---|---|
| 1 | **Max 3 active tasks per employee** (Todo + In Progress) | `POST /tasks` and `PUT /tasks/:id` count active tasks before creating/reassigning |
| 2 | **Inactive employees cannot be assigned tasks** | `validateEmployeeEligibility()` — always rejected with `400` |
| 3 | **On Leave employees blocked during leave window** | `validateEmployeeEligibility()` — task `startDate` checked against `[leaveStart, leaveEnd]` |
| 4 | **Status: Todo → In Progress → Completed only** | `isValidStatusTransition()` on `PUT /tasks/:id/status` |
| 5 | **Any status → Cancelled allowed** | Same transition map |
| 6 | **No backward transitions** | No `Completed → In Progress`, `Cancelled → Todo`, etc. |
| 7 | **Completed Date auto-set by server** | `taskController.js` sets `completedDate = new Date()` on `Completed` transition |
| 8 | **Completed / Cancelled tasks are read-only** | `PUT /tasks/:id` returns `400` if current status is terminal |
| 9 | **Employee delete blocked with active tasks** | `DELETE /employees/:id` returns `400` if `Todo`/`In Progress` tasks exist |
| 10 | **Historical task data preserved after employee delete** | `employeeSnapshot` retained; displayed as `"<Name> (Deleted)"` |
| 11 | **Overdue is dynamic** | Computed at query time: `dueDate < today AND status ∈ { Todo, In Progress }` |

---

## API Reference

Base URL: `http://localhost:5000/api`

### Health

| Method | Endpoint | Response |
|---|---|---|
| `GET` | `/health` | `{ status: "ok", timestamp }` |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard` | Returns employee counts, task counts (by status), overdue count, employee workload array |

### Employees

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/employees` | `search`, `department`, `status`, `page`, `limit` | Paginated, filterable list |
| `GET` | `/employees/:id` | — | Employee details + their assigned tasks |
| `POST` | `/employees` | — | Create employee (`409` on duplicate `employeeId` or `email`) |
| `PUT` | `/employees/:id` | — | Update employee; syncs `employeeSnapshot` on all tasks |
| `DELETE` | `/employees/:id` | — | Delete; `400` if active tasks exist |

### Tasks

| Method | Endpoint | Query Params | Description |
|---|---|---|---|
| `GET` | `/tasks` | `search`, `department`, `priority`, `status`, `dueFrom`, `dueTo`, `sortBy`, `sortOrder`, `page`, `limit` | Paginated, filterable, sortable list with `isOverdue` flag |
| `GET` | `/tasks/export` | Same as above (no pagination) | Download filtered tasks as `.csv` |
| `GET` | `/tasks/:id` | — | Single task details with `isOverdue` flag |
| `POST` | `/tasks` | — | Create task (always starts `Todo`; validates eligibility, dates, capacity) |
| `PUT` | `/tasks/:id` | — | Update task fields (blocks terminal status or direct `status` changes) |
| `PUT` | `/tasks/:id/status` | — | Transition status with validation |
| `DELETE` | `/tasks/:id` | — | Permanently delete task |

### Standard Response Shape

**Success (list):**
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 28, "page": 1, "limit": 6, "totalPages": 5 }
}
```

**Success (single):**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Human-readable error message" }
```

---

## Frontend Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | `DashboardPage` | KPI cards, task status breakdown, weekly timeline, employee capacity |
| `/employees` | `EmployeesListPage` | Search, filter, paginated table, delete with confirmation |
| `/employees/new` | `EmployeeFormPage` | Create employee with full validation |
| `/employees/:id` | `EmployeeViewPage` | Employee details + their task list |
| `/employees/:id/edit` | `EmployeeFormPage` | Edit employee (pre-populated form) |
| `/tasks` | `TasksListPage` | Card grid + table toggle, status tabs, quick status transitions |
| `/tasks/new` | `TaskFormPage` | Create task (eligibility checked on employee selection) |
| `/tasks/:id` | `TaskViewPage` | Task details with status transition history |
| `/tasks/:id/edit` | `TaskFormPage` | Edit task (blocked if Completed/Cancelled) |

> All list pages sync filters, search, sort, and page number to the URL (`useSearchParams`), making them **bookmarkable and shareable**.

---

## Environment Variables

### Backend — `backend/.env`

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
```

> See `backend/.env.example` for the full template.

### Frontend — `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> See `frontend/.env.example` for the full template.

> ⚠️ **Never commit real credentials.** The `.env` files are excluded by `.gitignore`.

---

## Setup & Running Locally

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **MongoDB Atlas** cluster (or local MongoDB instance)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd "Root Assignment"
```

### 2. Backend Setup

```bash
cd backend

# Copy env template and fill in your MongoDB URI
cp .env.example .env
# Edit .env and set MONGODB_URI, PORT, CORS_ORIGIN

# Install dependencies
npm install

# Start development server (nodemon)
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend

# Copy env template
cp .env.example .env
# VITE_API_BASE_URL=http://localhost:5000/api (default, change if needed)

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Build Frontend for Production

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

---

## Database Seeding

A one-off seed script populates **10 employees** and **28 tasks** to demonstrate the full feature set:

```bash
cd backend
node src/seed.js
```

> ⚠️ **This clears all existing data** (employees, tasks, and the taskId counter) before inserting the sample dataset. Only run on a development or testing database.

### Seeded Dataset Summary

**Employees (10):**

| ID | Name | Department | Role | Status |
|---|---|---|---|---|
| EMP-001 | Aarav Sharma | Development | Senior Full-Stack Developer | Active |
| EMP-002 | Priya Nair | Development | Frontend Developer | Active |
| EMP-003 | Rohan Mehta | Development | Backend Developer | Active |
| EMP-004 | Ananya Iyer | Design | UI/UX Designer | Active |
| EMP-005 | Kabir Singh | Design | Graphic Designer | On Leave |
| EMP-006 | Sneha Patel | QA | QA Engineer | Active |
| EMP-007 | Vikram Rao | QA | Automation Tester | Inactive |
| EMP-008 | Meera Joshi | HR | HR Manager | Active |
| EMP-009 | Arjun Kapoor | Sales | Sales Executive | Active |
| EMP-010 | Divya Menon | Sales | Account Manager | Active |

**Tasks (28):** Spread across all employees, departments, priorities, and statuses — including 2 overdue tasks (EMP-003 and EMP-010 have tasks where `dueDate < today` and status is `In Progress`).

---

## Assumptions Made

1. **No authentication/login** is required per the assignment specification — all API routes are public.
2. **Overdue is dynamic** — computed at query time (`today > dueDate && status ∈ {Todo, In Progress}`) rather than stored as a static boolean, ensuring it's always current without scheduled jobs.
3. **Employee On Leave validation** checks whether the task's `startDate` falls within `[leaveStart, leaveEnd]` inclusive. Tasks started before or after the leave window are allowed.
4. **Tasks always start as `Todo`** — the `POST /tasks` endpoint ignores any `status` field in the body and always creates tasks with `status: "Todo"`.
5. **Employee Snapshot** is populated at task creation and kept in sync whenever the employee's name, department, or role changes via `PUT /employees/:id`. This ensures historical task data remains meaningful even after the employee is deleted.
6. **Frontend URL state** (`useSearchParams`) means opening a URL with query params (e.g., `/tasks?status=In+Progress&department=Development`) restores the exact filtered view — no server-side session required.
7. **CORS** is configured to allow `http://localhost:5173` by default; update `CORS_ORIGIN` in `backend/.env` for production.

---

## Assignment Q&A

### 1. Where do you validate status transitions and why?

Status transitions are validated **server-side** in `PUT /api/tasks/:id/status` using the `ALLOWED_TRANSITIONS` map in `backend/src/utils/businessRules.js`:

```
Todo        → In Progress | Cancelled
In Progress → Completed  | Cancelled
Completed   → (none — terminal)
Cancelled   → (none — terminal)
```

The frontend dropdown also restricts options to valid next statuses (via `getValidNextStatuses()` in `src/utils/constants.js`), but backend enforcement is **mandatory** because API requests can be made directly with curl or Postman, bypassing the UI entirely.

---

### 2. Why does `Completed Date` come from the backend?

Setting `completedDate = new Date()` on the server when transitioning to `Completed` guarantees an accurate, **tamper-proof audit timestamp** based on server time. If the client set it, the timestamp could be manipulated (past-dating a completion, timezone mismatches, skewed clocks). Server-set timestamps are authoritative and consistent across all clients and timezones.

---

### 3. How do you block inactive / on-leave assignment?

Both `POST /tasks` and `PUT /tasks/:id` call `validateEmployeeEligibility(employee, taskStartDate)` before saving:

- **Inactive** → always rejected with `400 Bad Request` regardless of dates.
- **On Leave** → rejected with `400` if `taskStartDate` falls within `[employee.leaveStart, employee.leaveEnd]` inclusive.

The employee is fetched fresh from the database before every assignment check to prevent stale-data bypasses.

---

### 4. Why are filtering and pagination on the backend?

Server-side filtering, sorting, and pagination ensure the application scales to large datasets without:
- Transferring thousands of records over the network on every request.
- Overloading browser memory with large arrays.
- Applying different filter logic between the paginated list and the CSV export.

The `/api/tasks/export` endpoint reuses **exactly the same filter query** as the list endpoint (minus pagination), so the exported CSV always reflects what the user sees on screen.

---

### 5. Why do filters live in the URL?

Storing search, filters, sorting, and page numbers in URL query parameters (`useSearchParams`) makes every view:
- **Bookmarkable** — save a URL and return to the exact same filtered state.
- **Shareable** — send a URL and the recipient sees the same filtered view.
- **Refresh-safe** — reloading the page does not reset filters.
- **Back-button friendly** — browser history preserves each filter state change.

---

### 6. What can go wrong if two requests assign a 4th active task at the same time?

A **TOCTOU (Time-of-Check to Time-of-Use) race condition** can occur:

```
Request A: countActiveTasks() → returns 2  ✓ (< 3)
Request B: countActiveTasks() → returns 2  ✓ (< 3)
Request A: insert new task → employee now has 3
Request B: insert new task → employee now has 4  ⚠️
```

Both requests passed the check before either committed, resulting in **4 active tasks**.

**Production Solutions:**

1. **MongoDB Transactions** (requires a replica set): Wrap the count-check and insert in a session transaction with `readConcern: "snapshot"` to serialize concurrent access.
2. **Atomic counter on Employee**: Store `activeTaskCount` on the employee document and use:
   ```js
   Employee.findOneAndUpdate(
     { _id: empId, activeTaskCount: { $lt: 3 } },
     { $inc: { activeTaskCount: 1 } },
     { new: true }
   )
   ```
   If the update returns `null`, the employee was already at capacity — no task is created.

Both approaches eliminate the race window. The current implementation is correct for single-instance development but would need one of these patterns in production under concurrent load.

---

*Built with ❤️ for Roots Media Marketing Intern Assignment*
