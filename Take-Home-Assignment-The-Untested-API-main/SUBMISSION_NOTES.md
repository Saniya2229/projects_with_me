# Submission Notes

## Take-Home Assignment — The Untested API

This file contains the submission notes requested in the assignment, along with the testing, bug-fix, feature, coverage, and production-readiness notes.

---

## 1. What I would test next if I had more time

If I had more time, I would add more tests around:

- Invalid pagination values such as negative numbers, zero, decimal values, and non-numeric values.
- Different date formats and invalid `dueDate` values.
- Combinations of filters, pagination, and different task statuses.
- Larger task lists to make sure pagination and filtering continue to work correctly.
- More validation cases for task creation and task updates.
- More cases for the task assignment feature, including unusual names and repeated reassignment.
- Concurrent requests and possible data consistency issues.
- Error handling for unexpected server-side failures.

I would also consider adding tests for API behavior after the server restarts because the project currently uses an in-memory data store.

---

## 2. Anything that surprised me in the codebase

The API was relatively small, but testing it revealed several issues that could easily lead to incorrect data or unexpected behavior.

The main things I found were:

### Bug 1 — Exact status filtering

- **Expected:** filtering by `todo` should return only tasks with exactly `todo` status.
- **Actual:** substring matching could make a value such as `do` match both `todo` and `done`.
- **Fix:** use strict equality when comparing the task status.

### Bug 2 — Pagination offset

- **Expected:** pagination is 1-based, so page 1 should start from index 0.
- **Actual:** the previous calculation used `page * limit`, which skipped the first page.
- **Fix:** use `(page - 1) * limit`.

### Bug 3 — Immutable fields

- **Expected:** `id` and `createdAt` should remain unchanged.
- **Actual:** the update logic could overwrite them from the request body.
- **Fix:** remove `id` and `createdAt` from the update payload before merging the remaining fields.

### Bug 4 — Priority changed when completing a task

- **Expected:** completing a task should preserve its current priority.
- **Actual:** the completion logic reset priority to `medium`.
- **Fix:** preserve the existing task data and update only the completion-related fields.

These issues were useful examples of why tests are important even when an API looks simple.

---

## 3. Questions I would ask before shipping this to production

Before shipping this API to production, I would ask:

- Should the in-memory data store be replaced with a real database?
- What database and data model should be used?
- What authentication and authorization rules are required?
- Who is allowed to create, update, delete, complete, and assign tasks?
- What are the final validation rules for task fields?
- Should an already assigned task be allowed to be reassigned?
- What should happen when an assignee no longer exists?
- What are the expected API error-response formats?
- Do we need request logging and monitoring?
- Do we need rate limiting?
- What are the expected performance and traffic requirements?
- What deployment environment will be used?
- What backup and recovery requirements are expected?
- Do we need API documentation such as OpenAPI/Swagger?
- What security requirements should be applied before production?

---

## 4. Testing completed

The assignment asked for:

- Unit tests for `taskService.js`.
- Integration tests for API routes using Supertest.
- Happy-path coverage for the endpoints.
- At least two edge cases.
- 80%+ code coverage.

The project includes:

- `tests/taskService.test.js`
- `tests/tasks.routes.test.js`
- `tests/validators.test.js`

The generated coverage report shows:

| Metric     | Coverage |
| ---------- | -------: |
| Statements |    97.4% |
| Branches   |   91.75% |
| Functions  |   93.33% |
| Lines      |   97.14% |

This is above the assignment's requested 80%+ coverage target.

---

## 5. Bug report and fixes

The bug report documents four bugs:

1. Exact status filtering used substring matching.
2. Pagination used the wrong offset calculation.
3. Update requests could overwrite immutable `id` and `createdAt` fields.
4. Completing a task reset its priority unexpectedly.

The fixes were made in the service logic and the related tests verify the corrected behavior.

---

## 6. New feature — Assign a task

The requested endpoint was implemented:

```http
PATCH /tasks/:id/assign
```

Request body:

```json
{
  "assignee": "Alex Morgan"
}
```

The implementation:

- Accepts an assignee name as a string.
- Stores the assignee on the task.
- Returns the updated task.
- Returns `404` when the task does not exist.
- Returns `400` when the assignee is missing.
- Returns `400` when the assignee is an empty or whitespace-only string.
- Returns `400` when the assignee is not a string.
- Trims the assignee before storing it.
- Allows reassignment to another user.

### Design decision for an already assigned task

I decided to allow reassignment. If a task already has an assignee, sending another valid assignee replaces the previous assignee.

This keeps the endpoint simple and allows a task to be moved from one user to another when needed.

---

## 7. New feature tests

The assignment feature has tests for:

- Successfully assigning a task.
- Checking that the assignment is persisted.
- Reassigning a task to another user.
- Returning `404` for a non-existent task.
- Returning `400` when the assignee is missing.
- Returning `400` for an empty string.
- Returning `400` for whitespace-only input.
- Returning `400` when the assignee is not a string.

---

## 8. Commands used to verify the project

From the `task-api` directory:

```bash
npm install
npm test
npm run coverage
```

The coverage report was generated successfully and the final coverage is above the required target.

---

## 9. Final submission checklist

Before pushing the project, I would verify that the repository contains:

- [x] Test files.
- [x] Unit tests for the service layer.
- [x] Integration tests using Supertest.
- [x] Happy-path endpoint tests.
- [x] Edge-case tests.
- [x] `BUG_REPORT.md`.
- [x] At least one bug fixed.
- [x] Tests updated for the bug fix.
- [x] `PATCH /tasks/:id/assign` implementation.
- [x] Tests for the new assignment endpoint.
- [x] Validation for the assignment feature.
- [x] Coverage report showing more than 80% coverage.
- [x] Submission notes with testing-next, surprises, and production questions.

---

## 10. Short version for the actual submission

If the reviewer only wants a short note, this is the concise version:

> If I had more time, I would add more tests for invalid pagination values, date validation, combinations of filters, larger task lists, and concurrent requests. I would also test more edge cases around task assignment and the in-memory data store.
>
> What surprised me was that the API was small but still had several issues around status filtering, pagination, immutable fields, and task priority when completing a task. Writing the tests helped me find these problems instead of assuming the existing behavior was correct.
>
> Before shipping to production, I would ask about the database choice, authentication and authorization, validation rules, reassignment behavior, error formats, logging, monitoring, rate limiting, performance requirements, deployment, and security requirements.

---
