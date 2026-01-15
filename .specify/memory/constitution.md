<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Principles defined:
  - I. Spec-Driven Development (SDD) - NON-NEGOTIABLE (New)
  - II. API-First & Type-Safe Architecture (Replaces CLI-First)
  - III. Cloud-Native Data Persistence (Replaces Data Persistence & Integrity)
  - IV. Modern Web User Experience (Replaces User Experience Excellence)
  - V. Code Quality & Full-Stack Standards (Updated)
  - VI. Security & User Isolation (New)

Added sections:
  - Monorepo Structure
  - Technology Stack (Full-Stack)
  - Deployment Standards

Removed sections:
  - CLI-specific guidelines (Typer/Rich specifics moved to legacy or secondary)

Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Aligns with new monorepo structure option.
  ✅ .specify/templates/spec-template.md - Aligns with user stories.
  ✅ .specify/templates/tasks-template.md - Aligns with monorepo paths.

Follow-up TODOs: 
  - Migrate existing CLI code to consume API (if CLI is to be retained) or move to `legacy/`.
-->

# DoIt Todo Application Constitution

## Core Principles

### I. Test-Driven Development (TDD)

**No implementation code is written until a failing test exists:**

- **Red**: Write a test that defines the expected behavior and verify it fails.
- **Green**: Write the minimum amount of code to make the test pass.
- **Refactor**: Clean up the code while ensuring tests still pass.
- **Coverage**: New features must include comprehensive test coverage.

**Rationale**: TDD ensures that code does exactly what is intended, catches regressions immediately, and results in modular, testable architecture. It serves as a living specification of the system's behavior.

### II. API-First & Type-Safe Architecture

**The backend and frontend must communicate via strict contracts:**

- **Backend**: FastAPI exposing RESTful endpoints.
- **Frontend**: Next.js (App Router) consuming the API.
- **Strict Typing**: Pydantic models (Backend) and TypeScript interfaces (Frontend) must mirror each other.
- **Statelessness**: The backend must be stateless; all state resides in the database.

**Rationale**: Decoupling the frontend and backend allows for independent scaling and development. Strong typing across the stack prevents integration bugs and enables "Evolution of Todo" from a simple web app to future microservices.

### III. Cloud-Native Data Persistence

**Data must be durable, consistent, and user-isolated:**

- **Database**: PostgreSQL (Neon Serverless) via SQLModel.
- **Schema**: Defined in code (Python models), managed via migrations (if applicable).
- **Integrity**: Foreign keys and constraints must enforce data validity at the database level.
- **Persistence**: No local file storage for domain data; all user data lives in the cloud DB.

**Rationale**: Moving from local JSON to Postgres is essential for multi-user support, concurrency, and reliability. SQLModel bridges the gap between Python objects and the relational database, simplifying database interactions.

### IV. Modern Web User Experience

**The application must be responsive, accessible, and polished:**

- **Framework**: Next.js 14+ with App Router.
- **Styling**: Tailwind CSS for utility-first, responsive design.
- **Interactivity**: Client Components for rich interactions; Server Components for performance.
- **Visuals**: Clean, modern UI with clear feedback states (loading, success, error).

**Rationale**: Users expect a seamless experience across devices. Next.js and Tailwind provide the best balance of performance, developer experience, and maintainability for modern web applications.

### V. Code Quality & Full-Stack Standards

**Code must be maintainable, tested, and standard-compliant:**

- **Backend**: Python 3.13+, fully type-hinted, tested with pytest.
- **Frontend**: TypeScript, strict mode, component-based architecture.
- **Linting**: `ruff` (Python), `eslint` + `prettier` (TS/JS).
- **Testing**:
    - Backend: Unit tests for services, integration tests for API endpoints.
    - Frontend: Component tests where critical.

**Rationale**: A full-stack codebase requires rigorous standards to prevent "spaghetti code." Consistent tooling and strict typing are the best defense against technical debt in a growing monorepo.

### VI. Security & User Isolation

**Security is foundational, not an afterthought:**

- **Authentication**: Better Auth with JWT (JSON Web Tokens).
- **Authorization**: Resources must be scoped to the authenticated user (User Isolation).
- **Secrets**: API keys and DB credentials must be managed via environment variables (`.env`), never committed.
- **Validation**: All inputs must be validated on both client and server.

**Rationale**: In a multi-user web application, data leaks are unacceptable. Every database query and API endpoint must enforce ownership checks to ensure users only see and modify their own data.

## Technology Stack Standards

### Backend
- **Language**: Python 3.13+
- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Package Manager**: `uv`
- **Testing**: `pytest`, `pytest-cov`
- **Linting**: `ruff`

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth
- **HTTP Client**: `fetch` or `axios` (typed wrappers)

### Infrastructure & Tools
- **Monorepo Structure**:
    ```text
    /
    ├── specs/              # Design & Requirements
    ├── backend/            # FastAPI Application
    │   ├── src/
    │   └── tests/
    ├── frontend/           # Next.js Application
    │   ├── src/
    │   │   ├── app/
    │   │   └── components/
    │   └── public/
    ├── .specify/           # Agent Templates
    └── CLAUDE.md           # Agent Instructions
    ```

## Development Workflow

### 1. Specification (The Architect)
- Create/Update `specs/<feature>/spec.md`: Define user stories and requirements.
- Create/Update `specs/<feature>/plan.md`: Define data models, API endpoints, and component structure.
- **Review**: Ensure alignment with Constitution (Cloud-Native, Security).

### 2. Tasking (The Manager)
- Generate `specs/<feature>/tasks.md`: Break work into frontend and backend tasks.
- **Order**: Generally Backend (API/DB) -> Frontend (UI/Integration).

### 3. Implementation (The Builder)
- **Backend**:
    1. Define SQLModel entities.
    2. Implement API endpoints (TDD: Write test -> Fail -> Implement).
    3. Verify via Swagger UI (`/docs`) or `pytest`.
- **Frontend**:
    1. Define TS interfaces matching API.
    2. Build UI components.
    3. Integrate with API.

### 4. Verification
- Run backend tests: `pytest`
- Run linting: `ruff check`, `npm run lint`
- Manual E2E check: Verify user story flow in browser.

## Governance

### Amendment Process
- **MAJOR**: Architecture shifts (e.g., CLI to Web, Monolith to Microservices).
- **MINOR**: New tool adoption or workflow adjustment.
- **PATCH**: Clarifications.

### Enforcement
- All `plan.md` files must pass the **Constitution Check**.
- Code reviews (self or peer) must verify adherence to API-First and Security principles.

---

**Version**: 2.0.0 | **Ratified**: 2026-01-14 | **Last Amended**: 2026-01-14