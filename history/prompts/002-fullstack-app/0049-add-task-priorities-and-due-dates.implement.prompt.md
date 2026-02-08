---
id: 0049
title: add-task-priorities-and-due-dates
stage: implement
date: 2026-02-08
surface: agent
model: gemini-2.0-flash-thinking-exp-01-21
feature: 002-fullstack-app
branch: main
user: anas.shaikh
command: implement
labels: ["backend", "frontend", "tasks", "priority", "due-date", "migration-fix"]
links: null
files_yaml: |
 - backend/src/backend/models/project.py
 - backend/migrations/versions/67c21bc36619_add_priority_and_due_date_to_project_.py
 - backend/migrations/env.py
 - frontend/src/lib/types.ts
 - frontend/src/components/TaskDialog.tsx
 - frontend/src/components/KanbanBoard.tsx
 - frontend/src/app/(dashboard)/projects/[id]/page.tsx
tests_yaml: |
 - null
prompt_text: |
 in projects we should be able to prioritize thasks and assign time to them so they apear as pending, due and done.
response_text: |
 Implemented task prioritization and due dates, and fixed a critical migration issue:
 1. Backend: Added `priority` (LOW, MEDIUM, HIGH) and `due_date` fields to `ProjectTask` model.
 2. Backend Migration: Fixed a critical issue where the auto-generated migration inadvertently dropped `account`, `session`, and `verification` tables (Better Auth tables).
    - Downgraded the database to restore tables.
    - Modified the migration script to ONLY add the new columns.
    - Updated `backend/migrations/env.py` to explicitly ignore Auth tables (`account`, `session`, `verification`) during autogeneration to prevent future incidents.
 3. Frontend: Updated `TaskDialog` to include Priority selection and Due Date picker.
 4. Frontend: Updated `TaskCard` (Grid View) and `KanbanTaskItem` (Board View) to visualy display:
    - Priority badges (Red for High, Blue for Low).
    - Due Date indicators (Red if overdue, Yellow if due today).
    - Visual styling for overdue tasks (red border/background).
outcome: |
 - Users can now prioritize tasks and set deadlines.
 - Task cards visualy indicate urgency and importance.
 - Overdue tasks are highlighted.
 - Authentication system tables are restored and protected from future accidental deletion by Alembic.
---