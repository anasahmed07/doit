---
id: "0027"
title: "fix-markdown-spacing-and-todos"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix spacing and todos"
labels: ["frontend", "markdown", "bugfix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/NoteCard.tsx"
  - "frontend/src/components/NoteViewDialog.tsx"
  - "frontend/src/app/(dashboard)/dashboard/page.tsx"
tests: []
---

# Prompt

the spccing is ignored currently and the todo checkboxes are still not toggling

# Response

I have addressed the spacing and todo toggle issues:

1.  **Markdown Spacing**:
    *   Installed and integrated `remark-breaks` plugin.
    *   Added `remarkBreaks` to `NoteCard.tsx` and `NoteViewDialog.tsx`. This ensures that single line breaks in the editor are rendered as line breaks (`<br>`) in the view, preserving the user's intended visual spacing.

2.  **Todo Toggling**:
    *   Improved the regex in `handleToggleTodo` (`dashboard/page.tsx`) to be more robust and compliant with various GFM task list formats (e.g., `+ [ ]`, `1. [ ]`).
    *   The regex now correctly identifies the checkbox state and preserves the surrounding line structure when toggling.
    *   Ensured consistent checkbox index tracking between the renderer (`remark-gfm`) and the updater logic.
