---
id: 0048
title: persist-view-as-framework-and-task-dialog
stage: implement
date: 2026-02-08
surface: agent
model: gemini-2.0-flash-thinking-exp-01-21
feature: 002-fullstack-app
branch: main
user: anas.shaikh
command: implement
labels: ["frontend", "ui", "projects", "markdown", "dialog"]
links: null
files_yaml: |
 - frontend/src/components/ProjectCreationDialog.tsx
 - frontend/src/components/TaskDialog.tsx
 - frontend/src/components/KanbanBoard.tsx
 - frontend/src/app/(dashboard)/projects/[id]/page.tsx
 - backend/src/backend/models/project.py
tests_yaml: |
 - null
prompt_text: |
 instead of new view field use the framework if its kanban then view is kanban if its grid then it should be grid. the view should persist and this should also be prompted when creating the project. and the prompt boxes appear in the sidebar those should be opened in a dialog. and improve the card design in the project that should also support markdown
...
response_text: |
 Implemented requested changes:
 1. Used the existing `framework` field (KANBAN_FIXED vs GRID) to persist the project view mode.
 2. Updated `ProjectCreationDialog` to allow selecting the workflow type (Kanban vs Grid) during creation and editing.
 3. Created a new `TaskDialog` component to handle task addition and editing in a modal instead of inline forms.
 4. Updated `KanbanBoard` to trigger the `TaskDialog` for adding and editing tasks.
 5. Redesigned `TaskCard` for the Grid view with Markdown support (using `react-markdown`), status tags, and a more polished UI.
 6. Ensured that toggling the view mode on the project page persists the change to the backend by updating the project's framework.
outcome: |
 - Project views are now persistent based on the selected framework.
 - Task management is more consistent with a dedicated modal dialog.
 - Tasks now support full Markdown rendering.
 - UI for task cards in grid view is significantly improved.
---
