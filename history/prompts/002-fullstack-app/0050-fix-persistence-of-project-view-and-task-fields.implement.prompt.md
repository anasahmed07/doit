---
id: 0050
title: fix-persistence-of-project-view-and-task-fields
stage: implement
date: 2026-02-08
surface: agent
model: gemini-2.0-flash-thinking-exp-01-21
feature: 002-fullstack-app
branch: main
user: anas.shaikh
command: implement
labels: ["backend", "api", "persistence", "bug-fix"]
links: null
files_yaml: |
 - backend/src/backend/routes/projects.py
 - backend/src/backend/services/project_service.py
tests_yaml: |
 - null
prompt_text: |
 the project view state dosent persists in the database and the tasks card have the priority and date selection but they also dosent persists
...
response_text: |
 Fixed the persistence issue for project view states and task fields:
 1. Backend: Updated `ProjectUpdate`, `ProjectTaskCreate`, and `ProjectTaskUpdate` Pydantic models in `routes/projects.py` to include `framework`, `priority`, and `due_date`.
 2. Backend: Updated `ProjectRead` and `ProjectTaskRead` schemas to return these fields to the frontend.
 3. Backend: Updated `ProjectService` methods (`update_project`, `update_project_task`) to correctly save these fields to the database.
 4. Backend: Updated route handlers in `routes/projects.py` to pass the new fields to the service layer.
outcome: |
 - Project view mode (Board vs Cards) now persists in the database based on the project's `framework` setting.
 - Task priority and due dates are now correctly saved and retrieved from the database.
---
