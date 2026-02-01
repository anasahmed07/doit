---
id: "0042"
title: "fix-navbar-dashboard-link"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix header dashboard link"
labels: ["frontend", "ui", "navigation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/Navbar.tsx"
tests: []
---

# Prompt

the header have wrong navigation to notes of dashboard

# Response

I have updated the `Navbar.tsx` component to correctly point the "Dashboard" link to `/dashboard`. Previously, it was pointing to `/notes` which caused confusion after the routing restructure.
