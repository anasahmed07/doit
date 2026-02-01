---
id: "0046"
title: "fix-sidebar-suspense-error"
stage: "green"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix sidebar suspense error"
labels: ["frontend", "bugfix", "suspense"]
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

build error: useSearchParams() should be wrapped in a suspense boundary

# Response

I fixed the build error by wrapping the `Sidebar` content in a `Suspense` boundary.

1.  Refactored the sidebar logic into a new `SidebarContent` component.
2.  Updated `Sidebar` to be a lightweight wrapper that renders `SidebarContent` inside `<Suspense>`.
3.  Provided a fallback skeleton UI to prevent hydration mismatches and improve perceived performance.
