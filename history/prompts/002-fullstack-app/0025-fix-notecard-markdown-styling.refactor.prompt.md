---
id: "0025"
title: "fix-notecard-markdown-styling"
stage: "refactor"
date: "2026-02-01"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp-01-21"
feature: "fullstack-app"
branch: "main"
user: "mm com"
command: "fix note card markdown styles"
labels: ["frontend", "markdown", "ui", "bugfix"]
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

the note view on the page dosent highlight the links in the note content with diferent color and it dosent highlight quotes and it dosent highlight the code

# Response

I have updated `NoteCard.tsx` to explicitly style markdown elements using Tailwind's prose modifiers:

1.  **Links**: Added `prose-a:text-primary prose-a:font-bold prose-a:underline` to make links stand out with the primary brand color and bold text.
2.  **Quotes**: Added `prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic` to give blockquotes a distinct left border and italicized text.
3.  **Inline Code**: Added `prose-code:text-primary prose-code:bg-secondary/50 prose-code:font-mono` and removed the default backticks (`before:content-none after:content-none`) for a cleaner look that highlights code keywords.
