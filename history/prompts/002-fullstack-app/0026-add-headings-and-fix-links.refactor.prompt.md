---
id: "0026"
title: "add-headings-and-fix-links"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "add headings and fix links"
labels: ["frontend", "markdown", "ui", "feature"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "frontend/src/components/NoteForm.tsx"
  - "frontend/src/app/globals.css"
tests: []
---

# Prompt

there ar no other heading size options then h2 and links are still not highlighted with blue color

# Response

I have addressed the requested changes:

1.  **More Heading Options**:
    *   Updated `NoteForm.tsx` to include **H1** (`# `) and **H3** (`### `) in the toolbar.
    *   Replaced the generic "Heading" button with specific buttons for H1, H2, and H3, using their respective icons.

2.  **Link Highlighting**:
    *   Updated `globals.css` to force the link color to the primary brand color (blue) using `!important`. This overrides the default Tailwind Typography plugin styles which were taking precedence.
    *   Links will now reliably appear blue, bold, and underlined in the markdown view.
