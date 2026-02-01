---
id: "0028"
title: "fix-note-card-overlay-visibility"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix read more visibility"
labels: ["frontend", "ui", "accessibility"]
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

the click to see more text should have a more bright color its not visible or it the gradient should be more to make it visible

# Response

I have updated the `NoteCard` overlay to be much more visible:

1.  **Increased Gradient Height**: The fade-out effect now covers more vertical space (`h-24` instead of `h-12`) and starts earlier, creating a smoother transition.
2.  **Enhanced Text**:
    *   Changed color to the primary brand color (`text-primary`).
    *   Added a semi-transparent background (`bg-background/80`) behind the text.
    *   Added a subtle shadow and rounded corners (`rounded-full shadow-sm`).
    
These changes ensure the "Click to read more" call-to-action stands out clearly against any note content.
