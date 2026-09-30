# Bug Report

## 1) Exact status filtering was using substring matching

- Expected behavior: `GET /tasks?status=todo` should only return tasks whose status is exactly `todo`.
- Actual behavior: the service used `includes()`, so values like `do` matched both `todo` and `done`.
- How it was discovered: the test for filtering by exact status and the partial-match check failed immediately.
- Likely fix: compare status values with strict equality (`task.status === status`) instead of substring matching.

## 2) Pagination used the wrong offset calculation

- Expected behavior: page numbers are 1-based, so page 1 should start at item 0 and page 2 should start at item 5 for a limit of 5.
- Actual behavior: the code used `page * limit`, which skipped the first page incorrectly and caused page 1 to start at index 5.
- How it was discovered: the pagination tests showed the wrong items on pages 1 and 2 and empty results on the final page.
- Likely fix: use `(page - 1) * limit` for the offset calculation and normalize invalid page/limit values.

## 3) Update requests could overwrite immutable fields

- Expected behavior: `id` and `createdAt` should never be changed through `PUT /tasks/:id`.
- Actual behavior: update logic merged the incoming request body directly, allowing `id` and `createdAt` to be replaced with attacker-controlled values.
- How it was discovered: the immutable-field test failed and the route returned a task with a tampered `id`.
- Likely fix: strip `id` and `createdAt` from the update payload before merging the rest of the fields into the stored task.

## 4) Completing a task reset priority unexpectedly

- Expected behavior: marking a task complete should keep its current priority and only set `status` to `done` and `completedAt`.
- Actual behavior: the completion logic forcibly set `priority` back to `medium`.
- How it was discovered: the completion tests specifically asserted that a high-priority task should remain high after completion.
- Likely fix: remove the priority override in the completion update and preserve the existing priority value.
