# Implementation Plan: 002-fullstack-app

**Branch**: `002-fullstack-app` | **Date**: 2026-01-15 | **Spec**: [specs/002-fullstack-app/spec.md](specs/002-fullstack-app/spec.md)
**Input**: Feature specification from `/specs/002-fullstack-app/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Transition DoIt to a full-stack web application with a Next.js 15+ frontend and FastAPI backend. The system uses Neon Serverless Postgres for data, Better Auth for authentication (with shared secret validation), and SQLModel for type-safe database interactions. Key features include a personal dashboard with multimedia notes (stored as BLOBs), drag-and-drop organization, dynamic categorization, and a separate project management view with a fixed Kanban workflow.

## Technical Context

**Language/Version**: Python 3.13+ (Backend), TypeScript 5.0+ (Frontend)
**Primary Dependencies**: FastAPI, SQLModel (Backend); Next.js 15+, Tailwind CSS, Better Auth, Dnd-kit (Frontend)
**Storage**: Neon Serverless PostgreSQL (Data + Media BLOBs)
**Testing**: pytest (Backend), Vitest/Jest (Frontend)
**Target Platform**: Modern Web Browsers
**Project Type**: Full-Stack Monorepo (Web)
**Performance Goals**: <60s onboarding, <1s note render, <200ms nav update
**Constraints**: Separate Note/Project entities, Media in DB (BLOBs), Shared Secret Auth
**Scale/Scope**: ~50 active items, Personal + Professional workflows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-Driven Development**: Spec exists and is clarified.
- [x] **II. API-First & Type-Safe**: Backend (FastAPI) + Frontend (Next.js) with strict contracts.
- [x] **III. Cloud-Native Data Persistence**: Neon Postgres used for all persistence (no local files).
- [x] **IV. Modern Web User Experience**: Next.js 15 + Tailwind CSS + Dnd-kit.
- [x] **V. Code Quality & Full-Stack Standards**: Python 3.13+, TypeScript, Monorepo structure.
- [x] **VI. Security & User Isolation**: Better Auth + Shared Secret, RLS/App-level isolation.

## Project Structure

### Documentation (this feature)

```text
specs/002-fullstack-app/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Monorepo Structure
backend/
├── src/
│   ├── api/             # API Endpoints (Routers)
│   ├── core/            # Config, Security, Database
│   ├── models/          # SQLModel entities
│   └── services/        # Business Logic
└── tests/
    ├── unit/
    └── integration/

frontend/
├── src/
│   ├── app/             # Next.js App Router Pages
│   ├── components/      # Reusable UI Components
│   ├── lib/             # Utilities (Auth, API Client)
│   └── types/           # TS Interfaces
└── public/
```

**Structure Decision**: Standard Full-Stack Monorepo. Backend and Frontend are distinct services sharing only the repo root for coordination.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Media in DB (BLOBs) | User Constraint (Spec CT-004) | S3/R2 rejected by user preference for simple backup/single service. |
