---
id: 0005
title: research-nextjs-best-practices
stage: misc
date: 2026-01-15
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-fullstack-app
branch: 002-fullstack-app
user: mm com
command: research
labels: ["nextjs", "best-practices", "turbopack", "react-compiler"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/002-fullstack-app/0005-research-nextjs-best-practices.misc.prompt.md
tests:
  null
---

## Prompt

Research the latest Next.js 15+ best practices regarding:
1. Should 'React Compiler' be enabled for a new production-ready app?
2. Should 'Turbopack' be enabled for local dev?
3. What is the standard/default import alias pattern now (is it still `@/*`?)?

Based on this, construct the optimal `npx create-next-app` command.

## Response snapshot

Research findings for Next.js 15:
1. React Compiler is experimental. It is not enabled by default and requires `babel-plugin-react-compiler`. Recommended to proceed with caution or incremental adoption for production.
2. Turbopack is the default bundler for local development (`next dev`) in Next.js 15. It is significantly faster.
3. The standard import alias pattern is still `@/*` and is the default in `create-next-app`.

Optimal command:
`npx create-next-app@latest <app-name> --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`

## Outcome

- ✅ Impact: Researched Next.js 15 best practices and constructed optimal create-next-app command
- 🧪 Tests: N/A
- 📁 Files: N/A
- 🔁 Next prompts: Proceed with create-next-app
- 🧠 Reflection: Found clear answers for Next.js 15 features.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
