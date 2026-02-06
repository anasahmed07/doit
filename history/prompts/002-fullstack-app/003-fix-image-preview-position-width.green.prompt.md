---
id: 003
title: Fix image preview, position, and note width
stage: green
date_iso: 2026-02-06
surface: agent
model: gemini-2.0-flash-exp
feature: 002-fullstack-app
branch: main
user: mm com
command: null
labels: ["frontend", "ui", "bugfix", "images"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - frontend/src/components/NoteCard.tsx
  - frontend/src/components/NoteViewDialog.tsx
tests_yaml:
  - None
---

# PROMPT_TEXT
the note's image dosent have a view option like when we clich an image on a note it doesent opens up its full preview fix that and als instead of images to be at the bottom of note they should be at the top and the note dosent have any max width i think becaue if a note have long lines its widhth expands to fit to the text and

# RESPONSE_TEXT
I have implemented the requested changes:
1. **Image Preview:** Clicking on note images now opens a full-screen preview modal in both `NoteCard` and `NoteViewDialog`.
2. **Image Position:** Images are now displayed at the top of the note content.
3. **Note Width:** Added `max-w-full` and `[overflow-wrap:anywhere]` to ensure note cards don't expand beyond their container due to long text lines.

# OUTCOME
The frontend UI now correctly handles image previews, positions images at the top for better visibility, and prevents layout breaking from long lines.
