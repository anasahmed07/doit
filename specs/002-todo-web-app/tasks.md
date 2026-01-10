# Implementation Tasks: Todo Full-Stack Web Application

**Feature**: Phase II - Todo Full-Stack Web Application
**Feature Branch**: `002-todo-web-app`
**Status**: In Progress

## Phase 1: Environment Setup & Configuration

**Goal**: Initialize the monorepo structure, set up the development environment, and configure foundational libraries.

- [ ] T001 Initialize monorepo structure (backend/ and frontend/ directories)
- [ ] T002 [P] Initialize Python backend with `uv init backend` and configure `pyproject.toml`
- [ ] T003 [P] Initialize Next.js frontend with `npx create-next-app@latest frontend`
- [ ] T004 [P] Install backend dependencies: `fastapi`, `uvicorn`, `sqlmodel`, `psycopg2-binary`, `python-jose`, `passlib`
- [ ] T005 [P] Install frontend dependencies: `better-auth`, `axios` (or fetch wrapper), `clsx`, `tailwind-merge`
- [ ] T006 Configure backend environment variables in `backend/.env` (DB URL, Secrets)
- [ ] T007 Configure frontend environment variables in `frontend/.env.local` (API URL, Auth Secrets)
- [ ] T008 Configure Tailwind CSS in `frontend/tailwind.config.ts` with custom theme colors
- [ ] T009 Set up database connection logic in `backend/src/core/db.py`
- [ ] T010 Create `backend/src/core/config.py` for Pydantic-based settings management

## Phase 2: Foundational Architecture

**Goal**: Implement core backend services, database schema, and authentication foundations required by all features.

- [ ] T011 Create shared SQLModel `User` entity in `backend/src/models/user.py`
- [ ] T012 Create shared SQLModel `Task` entity in `backend/src/models/task.py` with foreign key to User
- [ ] T013 Implement database initialization script in `backend/src/scripts/init_db.py`
- [ ] T014 Implement dependency injection for DB session in `backend/src/api/deps.py`
- [ ] T015 Implement `get_current_user` dependency in `backend/src/api/deps.py` using JWT validation (mock or real Better Auth integration logic)
- [ ] T016 Create base API router in `backend/src/api/main.py` and mount sub-routers
- [ ] T017 Create reusable frontend API client in `frontend/src/lib/api.ts`
- [ ] T018 Create `AuthProvider` context in `frontend/src/components/providers/AuthProvider.tsx` to handle session state

## Phase 3: User Story 1 - User Authentication

**Goal**: Enable users to sign up and log in securely.
**Story**: As a user, I want to sign up and log in so that I can access my private todo list.

- [ ] T019 [US1] Create Auth API endpoints (if not fully handled by Better Auth standalone) or integration logic in `backend/src/api/routes/auth.py`
- [ ] T020 [US1] Create Login page UI in `frontend/src/app/(auth)/login/page.tsx`
- [ ] T021 [US1] Create Signup page UI in `frontend/src/app/(auth)/signup/page.tsx`
- [ ] T022 [US1] Implement form validation for Login/Signup using Zod (or simple state)
- [ ] T023 [US1] Connect Login page to Better Auth client
- [ ] T024 [US1] Implement protected route middleware in `frontend/src/middleware.ts` to redirect unauthenticated users

## Phase 4: User Story 2 - View Task List

**Goal**: Display the user's tasks.
**Story**: As a logged-in user, I want to see all my tasks in a clear list.

- [ ] T025 [P] [US2] Implement `GET /api/tasks` endpoint in `backend/src/api/routes/tasks.py` (filtering by `current_user`)
- [ ] T026 [P] [US2] Define TypeScript interfaces for Task in `frontend/src/types/index.ts`
- [ ] T027 [P] [US2] Create `TaskCard` component in `frontend/src/components/tasks/TaskCard.tsx`
- [ ] T028 [US2] Create `TaskList` component in `frontend/src/components/tasks/TaskList.tsx`
- [ ] T029 [US2] Create Dashboard page in `frontend/src/app/dashboard/page.tsx` that fetches and renders `TaskList`
- [ ] T030 [US2] Add empty state UI to `TaskList` (e.g., "No tasks found")

## Phase 5: User Story 3 - Create Task

**Goal**: Allow users to add new tasks.
**Story**: As a logged-in user, I want to add a new task so I can track my work.

- [ ] T031 [P] [US3] Implement `POST /api/tasks` endpoint in `backend/src/api/routes/tasks.py`
- [ ] T032 [P] [US3] Create `CreateTaskForm` component in `frontend/src/components/tasks/CreateTaskForm.tsx` (or modal)
- [ ] T033 [US3] Integrate `CreateTaskForm` into Dashboard page
- [ ] T034 [US3] Implement optimistic UI update or list refresh after creation

## Phase 6: User Story 4 - Update Task

**Goal**: Allow users to edit task details.
**Story**: As a logged-in user, I want to edit a task's details.

- [ ] T035 [P] [US4] Implement `PUT /api/tasks/{id}` endpoint in `backend/src/api/routes/tasks.py`
- [ ] T036 [P] [US4] Update `TaskCard` to support edit mode or link to detail view
- [ ] T037 [US4] Create/Update edit form logic (can reuse `CreateTaskForm` or separate `EditTaskForm`)
- [ ] T038 [US4] Verify user ownership in backend before update

## Phase 7: User Story 5 - Mark as Complete

**Goal**: Toggle task status.
**Story**: As a logged-in user, I want to mark a task as done.

- [ ] T039 [P] [US5] Implement `PATCH /api/tasks/{id}/complete` endpoint in `backend/src/api/routes/tasks.py`
- [ ] T040 [P] [US5] Add checkbox/toggle to `TaskCard` component
- [ ] T041 [US5] Connect checkbox to API and handle optimistic state update
- [ ] T042 [US5] Style completed tasks visually (strikethrough/opacity)

## Phase 8: User Story 6 - Delete Task

**Goal**: Remove tasks permanently.
**Story**: As a logged-in user, I want to remove a task I no longer need.

- [ ] T043 [P] [US6] Implement `DELETE /api/tasks/{id}` endpoint in `backend/src/api/routes/tasks.py`
- [ ] T044 [P] [US6] Add delete button to `TaskCard`
- [ ] T045 [US6] Implement confirmation dialog (optional but good UX) or immediate delete
- [ ] T046 [US6] Remove task from UI list upon success

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Ensure quality, responsiveness, and final polish.

- [ ] T047 Ensure all pages are mobile-responsive (check Tailwind classes)
- [ ] T048 Implement global error handling (Toast notifications)
- [ ] T049 Verify data isolation (Test with 2 different users manually)
- [ ] T050 Run final backend linting (`ruff check .`) and formatting
- [ ] T051 Run final frontend type checking (`tsc --noEmit`) and linting

## Implementation Strategy

**Dependencies**:
- Setup (Phase 1) is strictly required for everything.
- Foundational Architecture (Phase 2) is required for all User Stories.
- User Story 1 (Auth) is a prerequisite for US2-US6 because the API depends on `current_user`.
- US2 (View) provides the container for US3-US6.

**Parallelization**:
- Frontend and Backend tasks within the same phase can largely be done in parallel once the contracts (Phase 2) are defined.
- Example: T025 (Backend List Endpoint) and T027 (Frontend Task Card) can be built simultaneously.

**MVP Scope**:
- Phases 1, 2, 3, and 4 constitute the minimal viable product (Auth + Read).
- Phases 5-8 complete the CRUD requirements.
