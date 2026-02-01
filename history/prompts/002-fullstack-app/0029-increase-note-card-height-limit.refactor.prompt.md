---
id: "0029"
title: "increase-note-card-height-limit"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "increase height limit"
labels: ["frontend", "ui", "ux"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/NoteCard.tsx"
tests: []
---

# Prompt

the hight limit should be of a page hight if content is more then it then it should show

# Response

I have increased the display limit of note cards to better reflect a "page height":

1.  **Increased Truncation Threshold**: Raised the limit from **15 lines** to **60 lines**.
    *   This allows significantly more content to be visible at a glance (approximately a full screen or A4 page worth of text) before the "Click to read more" overlay triggers.
    *   The overlay will now only appear for truly long notes that exceed this new generous limit.
