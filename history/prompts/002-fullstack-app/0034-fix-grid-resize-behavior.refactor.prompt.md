---
id: "0034"
title: "fix-grid-resize-behavior"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix grid resize behavior"
labels: ["frontend", "ui", "bugfix", "resize-observer"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/DraggableNoteGrid.tsx"
tests: []
---

# Prompt

it does but work but dosent work if i resize my window

# Response

I have fixed the resize issue by switching from a `window` resize listener to a `ResizeObserver` on the grid container itself.

**Why this fixes it:**
Previously, the grid layout depended on `window.innerWidth`. If you resized the **Sidebar**, the window width didn't change, so the grid didn't recalculate its columns, even though it had less space.

Now, the grid observes its own container's width. Whether you resize the browser window OR the sidebar, the container's width changes, triggering the `ResizeObserver`, which then correctly recalculates the optimal number of columns.
