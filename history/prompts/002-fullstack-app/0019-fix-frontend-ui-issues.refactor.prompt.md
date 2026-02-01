---
id: "0019"
title: "fix-frontend-ui-issues"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix ui issues"
labels: ["frontend", "bugfix", "ui", "kanban", "notes"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/NoteCard.tsx"
  - "frontend/src/components/NoteForm.tsx"
  - "frontend/src/components/KanbanBoard.tsx"
tests: []
---

# Prompt

the note content is flowing out of the note when the line is long which should not happen and the markdown support is not good like with the keybindings and selection implementation so it should be made better. the delete button in kanban todos dosent ask for the confirmation and its prompt box dosent close if clicked outside

# Response

I have addressed the reported UI issues:

1.  **Note Content Overflow**: Added `break-words` to `NoteCard.tsx` to prevent long words from overflowing the container.
2.  **Markdown Editor Improvements**: Refactored `insertMarkdown` in `NoteForm.tsx` to:
    *   Correctly wrap selected text instead of replacing it.
    *   Place the cursor inside the tags (e.g., `**|**`) when no text is selected.
    *   Improve undo/redo consistency (conceptually, though still using value replacement).
3.  **Kanban Delete Confirmation**:
    *   Updated `KanbanBoard.tsx` to include a `ConfirmationDialog` when deleting a task.
    *   The dialog requires explicit confirmation before deletion.
4.  **Kanban "Add Task" Interaction**:
    *   Added a "click outside" handler to the "Add Task" form in `KanbanColumn` so it closes automatically when the user clicks elsewhere.
