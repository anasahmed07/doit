---
id: "0024"
title: "implement-projects-context"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "implement shared projects context"
labels: ["frontend", "state-management", "refactor", "performance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/ProjectsContext.tsx"
  - "frontend/src/app/(dashboard)/layout.tsx"
  - "frontend/src/components/Sidebar.tsx"
  - "frontend/src/app/(dashboard)/projects/page.tsx"
tests: []
---

# Prompt

the sidebar and the projects page should use the same state and only request the backend once and if the page is updated the sidebar should also update

# Response

I have implemented a shared state management solution for Projects using React Context.

1.  **`ProjectsContext.tsx`**: Created a new context provider that manages:
    *   The `projects` list state.
    *   A single `fetchProjects` method (with logic to prevent redundant fetches).
    *   `addProject` and `removeProject` helpers for optimistic UI updates.
2.  **`layout.tsx`**: Wrapped the dashboard layout with `ProjectsProvider` so both the Sidebar and main content area (Projects Page) share the exact same state instance.
3.  **`Sidebar.tsx` Refactor**:
    *   Removed local project fetching logic.
    *   Now consumes `useProjects()` to display the list.
    *   The "Projects" dropdown now simply calls the context's `fetchProjects` if needed.
4.  **`projects/page.tsx` Refactor**:
    *   Removed local state.
    *   Now consumes `useProjects()` for the main grid.
    *   Deleting a project calls `removeProject` from context, which immediately updates both the grid AND the sidebar without a full reload.
    *   Creating a project refreshes the context, ensuring the Sidebar gets the new project instantly.
