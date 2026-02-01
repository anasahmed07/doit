---
id: "0036"
title: "restructure-sidebar-navigation"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "restructure sidebar: dashboard->notes, indent categories"
labels: ["frontend", "ui", "navigation", "refactor"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/Sidebar.tsx"
tests: []
---

# Prompt

rename the dashboard page to notes and move its position in the sidebare above categories and indent the categories below it

# Response

I have restructured the Sidebar navigation as requested:

1.  **Renamed Dashboard**: The "Dashboard" link is now labeled **"Notes"** and uses a `FileText` icon to better reflect its purpose.
2.  **Grouped Categories**: I removed the separate "Categories" section header and moved the category list directly under the "Notes" item.
3.  **Indentation**: Categories are now visually indented under "Notes" with a left border line, creating a clear hierarchy:
    *   **Notes** (All Notes)
        *   Category A
        *   Category B
4.  **UI Cleanup**:
    *   Moved the "Add Category" (+) button next to the "Notes" label (visible on hover).
    *   Improved active state logic using `useSearchParams` to distinguish between "All Notes" (`/dashboard`) and specific categories (`/dashboard?category=id`).
