<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Principles defined:
  - I. Test-First Development (TDD) - NON-NEGOTIABLE
  - II. API-First & Type-Safe Contracts
  - III. Cloud-Native & Stateless
  - IV. Secure by Design
  - V. Modern Web Experience
  - VI. Modular Monorepo Structure

Added sections:
  - Technology Stack Standards (Updated for Web/Full-stack)
  - Development Workflow (Split Frontend/Backend)
  - Governance

Removed sections:
  - CLI-First Interface (Superseded by Web/API)
  - Data Persistence (JSON) (Superseded by PostgreSQL)

Templates requiring updates:
  ⚠ .specify/templates/plan-template.md - needs update for FE/BE split
  ⚠ .specify/templates/spec-template.md - needs update for API endpoints/Auth
  ⚠ .specify/templates/tasks-template.md - needs update for integration testing layers

Follow-up TODOs:
  - Update templates to reflect monorepo structure
-->

# DoIt Todo Application Constitution

## Core Principles

### I. Test-First Development (TDD) - NON-NEGOTIABLE

**TDD is mandatory for all implementation work across the stack:**

- **Backend**: Tests MUST be written using `pytest` before route/service implementation.
- **Frontend**: Component/Unit tests (Jest/Vitest) MUST be written before UI implementation.
- **Integration**: API tests MUST verify contracts before frontend integration.
- **Rule**: No feature code without failing tests first (Red -> Green -> Refactor).
- **Approval**: User must approve test cases/plans before implementation begins.

**Rationale**: In a distributed full-stack system, debugging across layers is costly. TDD ensures each layer works in isolation and adheres to the contract, preventing "it works on my machine" issues and frontend-backend drift.

### II. API-First & Type-Safe Contracts

**The API is the product; the Frontend is a consumer:**

- API contracts (Routes, Request/Response models) defined BEFORE coding.
- Strict Type Safety: Pydantic models (Backend) must align with TypeScript interfaces (Frontend).
- RESTful conventions for all endpoints.
- Error handling must return structured, machine-readable JSON.
- No "magic strings"; use enums and constants shared or synchronized across the stack.

**Rationale**: A clear contract allows parallel development of frontend and backend. Type safety reduces runtime errors and ensures that data shapes are consistent from the database to the UI.

### III. Cloud-Native & Stateless

**The application is designed for cloud deployment (Kubernetes/Serverless):**

- **Stateless Backend**: No in-memory state between requests. Use the Database or Redis.
- **Externalized Configuration**: All secrets and config via Environment Variables (12-Factor App).
- **Container-Ready**: Code must run identically locally and in containers.
- **Persistence**: Data lives in Neon PostgreSQL, never on the local filesystem.

**Rationale**: We are evolving towards a K8s-deployed AI system. Building stateless, config-driven apps now prevents painful architectural rewrites during deployment phases.

### IV. Secure by Design

**Security is foundational, not an addon:**

- **Authentication**: Better Auth with JWT for secure, stateless sessions.
- **Authorization**: Every endpoint must verify ownership (User A cannot see User B's tasks).
- **Data Isolation**: All DB queries must be scoped to the `current_user`.
- **Secrets**: Never commit keys/tokens. Use `.env` and secret management.

**Rationale**: Multi-user web apps face threats that local CLIs do not. Data leakage between users is unacceptable. Security must be baked into the data access layer.

### V. Modern Web Experience

**The UI must be fast, responsive, and intuitive:**

- **Framework**: Next.js 14+ (App Router) for performance and SEO.
- **Styling**: Tailwind CSS for consistent, utility-first design.
- **Feedback**: Instant visual feedback for user actions (loading states, toasts, optimistic updates).
- **Responsive**: Mobile-first design principles.

**Rationale**: Users expect polished, fast web applications. Leveraging modern frameworks like Next.js ensures we deliver a production-grade user experience efficiently.

### VI. Modular Monorepo Structure

**Code organization reflects the system architecture:**

- Clear separation: `/frontend` and `/backend` directories.
- Shared specs in `/specs` drive both sides.
- Atomic commits that respect the boundary (or explicitly bridge it).
- Spec-Driven: Documentation is the single source of truth for both stacks.

**Rationale**: A monorepo keeps full-stack features synchronized while allowing distinct toolchains (Python/Node) to coexist efficiently.

## Technology Stack Standards

### Backend
- **Language**: Python 3.13+
- **Framework**: FastAPI (High performance, easy OpenAPI)
- **ORM**: SQLModel (Pydantic + SQLAlchemy integration)
- **Database**: Neon Serverless PostgreSQL
- **Package Manager**: UV
- **Testing**: pytest, pytest-asyncio, httpx

### Frontend
- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS
- **Auth Client**: Better Auth
- **State/Fetching**: React Server Components + Client Hooks
- **Package Manager**: npm/pnpm/yarn (Standardize on one, e.g., npm)

### Infrastructure & Ops
- **Containerization**: Docker (prepare for)
- **CI/CD**: Pre-commit hooks (ruff, eslint, tsc)

## Development Workflow

### 1. Spec & Architecture (Monorepo Root)
- Define Feature in `specs/features/<name>.md`.
- Define API Contract in `specs/api/<endpoint>.md`.
- Define DB Schema in `specs/database/schema.md`.
- Get approval on the "Contract" before writing code.

### 2. Implementation Planning
- Create `specs/features/<name>/plan.md`.
- Break down into **Backend Tasks** and **Frontend Tasks**.
- Identify dependencies (e.g., "Backend API must exist before Frontend Hook").

### 3. TDD - Backend Loop
- Write `tests/unit` or `tests/integration` for the API endpoint.
- Implement Model -> Service -> Route.
- Verify tests pass (Green).
- Refactor.

### 4. TDD/Component - Frontend Loop
- Create/Update TypeScript interfaces based on API.
- Create Component/Page.
- Verify UI behavior (Mocked API or Integration).

### 5. Quality Gates
**Backend**:
- [ ] `ruff check .` (Linting)
- [ ] `ruff format .` (Formatting)
- [ ] `mypy .` (Type Check)
- [ ] `pytest` (All tests pass)

**Frontend**:
- [ ] `npm run lint` (ESLint)
- [ ] `tsc --noEmit` (Type Check)
- [ ] Build passes (`npm run build`)

## Governance

### Amendment Process
1. Propose change via Pull Request/Issue.
2. Verify impact on "Cloud-Native" and "Security" principles.
3. Ratify with Version Bump.

### Versioning
- **2.0.0**: Adopted for Phase II (Web App Transition).
- **MAJOR**: Platform/Stack shift.
- **MINOR**: New architectural component (e.g., adding Redis/Kafka).
- **PATCH**: Process refinements.

### Enforcement
- All features must have a corresponding Spec.
- No code committed without passing Lint/Type/Test checks.
- Code Review (User/AI) must check for Data Isolation enforcement.

---

**Version**: 2.0.0 | **Ratified**: 2026-01-09 | **Last Amended**: 2026-01-09