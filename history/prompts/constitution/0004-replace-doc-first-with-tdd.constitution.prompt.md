---
id: 0004
title: replace-doc-first-with-tdd
stage: constitution
date: 2026-01-14
surface: agent
model: gemini
feature: phase-2-fullstack
branch: main
user: user
command: /sp.constitution
labels: ["governance", "refinement", "tdd"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

it will be better to use TDD instead of doc first

## Response snapshot

Replaced Principle I ("Documentation-First Architecture") with "Test-Driven Development (TDD)" as the primary non-negotiable rule. The workflow now prioritizes executable tests (Red-Green-Refactor) over static documentation for verifying correctness.

## Outcome

- ✅ Impact: Shifted primary governance from docs to tests.
- 🧪 Tests: N/A
- 📁 Files: Updated constitution.md
- 🔁 Next prompts: Continue with phase 2 planning
- 🧠 Reflection: User values code-level verification (TDD) over upfront documentation.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): null
