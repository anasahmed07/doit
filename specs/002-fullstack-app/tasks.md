# Implementation Tasks: 002-fullstack-app

**Spec**: [specs/002-fullstack-app/spec.md](specs/002-fullstack-app/spec.md)
**Plan**: [specs/002-fullstack-app/plan.md](specs/002-fullstack-app/plan.md)
**Phase 1 Start**: [DATE]

## Phase 1: Setup & Infrastructure (T001-T010)

Goal: Initialize the full-stack monorepo environment with Next.js, FastAPI, and Database connectivity.

- [X] T001 Initialize backend with `uv init --package backend`
- [X] T002 [P] Configure FastAPI project structure (src, tests) in backend/
- [X] T003 [P] Initialize frontend with `npx create-next-app@latest frontend` (TS, Tailwind, ESLint, App Router, src dir)
- [X] T004 [P] Configure SQLModel and Alembic in backend/src/core/database.py
- [X] T005 [P] Create docker-compose.yml for local Postgres DB (dev environment)
- [X] T006 Configure environment variables (.env.example) for both services
- [X] T007 Implement CORS middleware in backend/src/main.py
- [X] T008 [P] Install Better-Auth and Dnd-kit dependencies in frontend/
- [X] T009 Verify backend health endpoint (GET /health)
- [X] T010 Verify frontend build and local server launch

## Phase 2: Foundational Components (T011-T020)

Goal: Implement Authentication and Base Data Models required by all features.

- [X] T011 [P] Define User model in backend/src/backend/models/user.py
- [X] T012 Run migration to create User table in Postgres
- [X] T013 Implement Shared Secret Auth Dependency in backend/src/backend/core/security.py
- [X] T014 [P] Configure Better-Auth client in frontend/src/lib/auth.ts
- [X] T015 Create Auth API route handler in frontend/src/app/api/auth/[...all]/route.ts
- [X] T016 Implement Sign-in/Sign-up pages in frontend/src/app/(auth)/
- [X] T017 Create authenticated API client wrapper (axios/fetch interceptor) in frontend/src/lib/api.ts
- [X] T018 Define Category model in backend/src/backend/models/category.py
- [X] T019 Implement CategoryService (CRUD) in backend/src/backend/services/category_service.py
- [X] T020 [P] Create Category API endpoints (GET, POST) in backend/src/backend/routes/categories.py

## Phase 3: User Story 1 - Unified Onboarding & Access (T021-T030)

Goal: Users can sign up, log in, and land on a personalized dashboard.

- [ ] T021 [US1] Create Landing Page (Public) in frontend/src/app/page.tsx
- [ ] T022 [P] [US1] Create Dashboard Layout (Sidebar + Main) in frontend/src/app/(dashboard)/layout.tsx
- [ ] T023 [P] [US1] Implement Sidebar component fetching Categories in frontend/src/components/Sidebar.tsx
- [ ] T024 [US1] Create "New Category" modal/form in frontend/src/components/CreateCategoryDialog.tsx
- [ ] T025 [US1] Integrate "New Category" form with API
- [ ] T026 [US1] Implement "Get Current User" endpoint (/me) in backend/src/api/auth.py
- [ ] T027 [US1] Create User Profile component in Sidebar footer
- [ ] T028 [US1] Add protected route middleware in Next.js (middleware.ts)
- [ ] T029 [US1] Verify redirect flow (Guest -> Login -> Dashboard)
- [ ] T030 [US1] Verify data isolation (User A cannot see User B's categories)

## Phase 4: User Story 2 - Multimedia Note Capture (T031-T045)

Goal: Users can create rich notes with text, images, and audio.

- [ ] T031 [P] [US2] Define Note and MediaAsset models in backend/src/models/note.py
- [ ] T032 [US2] Run migration for Note and MediaAsset tables
- [ ] T033 [US2] Implement NoteService with BLOB handling in backend/src/services/note_service.py
- [ ] T034 [P] [US2] Create Note API endpoints (CRUD + Upload) in backend/src/api/notes.py
- [ ] T035 [P] [US2] Implement Note Card component in frontend/src/components/NoteCard.tsx
- [ ] T036 [US2] Create DraggableNoteGrid component (Client) in frontend/src/components/DraggableNoteGrid.tsx
- [ ] T037 [US2] Implement Note Creation Form (Text/Image/Audio inputs) in frontend/src/components/CreateNoteForm.tsx
- [ ] T038 [US2] Integrate Dnd-kit for drag-and-drop reordering
- [ ] T039 [US2] Implement Reorder API endpoint in backend/src/api/notes.py
- [ ] T040 [US2] Connect frontend drag end event to Reorder API
- [ ] T041 [US2] Implement Category filtering on Dashboard page
- [ ] T042 [US2] Optimize BLOB loading (Lazy load images)
- [ ] T043 [US2] Verify independent test: Create note -> Drag -> Refresh -> Persisted
- [ ] T044 [P] [US2] Add audio playback support in Note Card
- [ ] T045 [P] [US2] Add image preview modal

## Phase 5: User Story 3 - Professional Project Management (T046-T055)

Goal: Users can manage projects with a fixed Kanban workflow.

- [ ] T046 [P] [US3] Define Project and ProjectTask models in backend/src/models/project.py
- [ ] T047 [US3] Run migration for Project tables
- [ ] T048 [P] [US3] Implement Project API endpoints in backend/src/api/projects.py
- [ ] T049 [US3] Create Project List view in frontend/src/app/(dashboard)/projects/page.tsx
- [ ] T050 [US3] Create Kanban Board component in frontend/src/components/KanbanBoard.tsx
- [ ] T051 [US3] Implement Drag-and-Drop for Kanban columns (To Do -> Done)
- [ ] T052 [US3] Connect Kanban moves to Task Status Update API
- [ ] T053 [US3] Implement Project Creation Dialog
- [ ] T054 [US3] Verify independent test: Move task -> Refresh -> Status persisted
- [ ] T055 [US3] Add Project navigation to Sidebar

## Phase 6: Polish & Cross-Cutting (T056-T060)

Goal: Refinement, error handling, and final verification.

- [ ] T056 [P] Implement global error handling (Toast notifications) in frontend
- [ ] T057 [P] Add loading skeletons for Dashboard and Kanban board
- [ ] T058 Audit database indexes for performance (user_id, category_id)
- [ ] T059 Final security review (Check RLS/Ownership logic on all endpoints)
- [ ] T060 Update documentation (README.md) with setup instructions

## Dependencies

1. **Phase 1 (Setup)**: Blocks everything.
2. **Phase 2 (Auth/Foundation)**: Blocks Phases 3, 4, 5.
3. **Phase 3 (US1)**: Blocks nothing, but Dashboard is container for US2/US3.
4. **Phase 4 (US2)** and **Phase 5 (US3)**: Independent, can run in parallel.

## Parallel Execution Opportunities

- **Frontend/Backend Split**: Most features have decoupled tasks (e.g., T034 Backend API vs T035 Frontend Component) that can be worked on simultaneously once the contracts (Data Models/API Specs) are agreed upon in Phase 2.
- **US2 & US3**: Entire stories can be parallelized by two different developers/agents.

## Implementation Strategy

1. **MVP (Minimal Viable Product)**: Complete Phases 1, 2, and 3. This gives a working user system with a dashboard.
2. **Core Feature**: Complete Phase 4 (Notes). This fulfills the primary "productivity" value prop.
3. **Pro Feature**: Complete Phase 5 (Projects). This adds the "full-stack/professional" layer.
