# Feature Specification: Doit Phase 2 - Full-Stack Productivity Platform

**Feature Branch**: `002-fullstack-app`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "phase 2 Doit is a full-stack productivity application designed to bridge the gap between simple personal task tracking and professional project management..."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
-->

### User Story 1 - Unified Onboarding & Access (Priority: P1)

A new user visits the platform, understands the value proposition, and creates a secure account to access their personal dashboard.

**Why this priority**: Essential entry point for the application; without this, no other features can be accessed securely.

**Independent Test**: Can be fully tested by simulating a new visitor arriving at the landing page, signing up, and successfully landing on an empty dashboard.

**Acceptance Scenarios**:

1. **Given** a visitor on the public landing page, **When** they review the content, **Then** they see a clear overview of personal and professional features.
2. **Given** a visitor, **When** they choose to sign up, **Then** they can create a secure account with credentials.
3. **Given** a registered user, **When** they log in, **Then** they are redirected immediately to their personal dashboard.

---

### User Story 2 - Multimedia Note Capture & Organization (Priority: P1)

A user captures thoughts using various media types (text, todos, images, audio) in a single note and organizes them dynamically.

**Why this priority**: This is the "core of the user experience" described in the requirements.

**Independent Test**: Create a note with mixed content, assign a category, and verify it appears in the correct sidebar tab.

**Acceptance Scenarios**:

1. **Given** a user on the dashboard, **When** they create a new note, **Then** they can add text, checkbox items, images, and audio files to it.
2. **Given** a list of notes, **When** the user drags a note to a new position, **Then** the order is updated and persisted.
3. **Given** a note, **When** the user assigns a custom category (e.g., "Ideas"), **Then** a "Ideas" tab automatically appears in the sidebar.
4. **Given** the sidebar, **When** the user clicks a category tab, **Then** the dashboard filters to show only notes in that category.

---

### User Story 3 - Professional Project Management (Priority: P2)

A user manages professional work using established Agile workflows within the same interface.

**Why this priority**: Bridges the gap to professional use cases, distinguishing the app from simple todo lists.

**Independent Test**: Create a project and move items through an Agile workflow (e.g., To Do -> Doing -> Done).

**Acceptance Scenarios**:

1. **Given** a user, **When** they switch to project management mode, **Then** they can view tasks in an Agile-style layout (e.g., Kanban board or Sprint view).
2. **Given** a project, **When** a user updates a task status, **Then** the change is reflected in the workflow view.

---

### Edge Cases

- What happens when a user deletes a category that contains notes? (Assumed: Notes become uncategorized or category deletion is blocked until empty).
- How does the system handle large audio/image files? (Assumed: Size limits and error messages).
- What happens if a user is offline? (Assumed: Basic offline support or clear error state).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a public-facing landing page describing the product.
- **FR-002**: System MUST support secure user registration and authentication (Account-based system).
- **FR-003**: System MUST provide a main dashboard interface for authenticated users.
- **FR-004**: System MUST allow creation of "Notes" that serve as containers for multiple content types.
- **FR-005**: Notes MUST support rich content: Text, Todos (checkboxes), Image uploads, and Audio files.
- **FR-006**: System MUST support drag-and-drop reordering of notes on the dashboard.
- **FR-007**: System MUST support dynamic categorization of notes.
- **FR-008**: Sidebar MUST automatically generate navigation tabs for every user-created category.
- **FR-009**: System MUST provide project management views supporting Agile frameworks (Fixed Kanban: To Do, In Progress, Done).
- **FR-010**: System MUST enforce data segregation between users (secure, account-based).
- **FR-011**: Notes and Projects MUST be implemented as separate entities with distinct lifecycles.

### Key Entities

- **User**: Account holder with secure credentials.
- **Note**: The core unit of content; can contain mixed media.
- **Category**: User-defined tag/grouping for notes, drives sidebar navigation.
- **MediaAsset**: Binary data for Images and Audio attached to notes.
- **Project**: Container for professional tasks/workflows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new account and land on the dashboard in under 60 seconds.
- **SC-002**: Multimedia notes (text + image + audio) render in under 1 second on the dashboard.
- **SC-003**: Sidebar navigation updates instantly (under 200ms) when a new category is created.
- **SC-004**: System supports simultaneous management of at least 50 active notes/projects without UI degradation.
- **SC-005**: 100% of user data is isolated to their specific account (Security verification).

## Constraints & Tradeoffs

- **CT-001**: Frontend MUST be built with Next.js (TypeScript App Router).
- **CT-002**: Backend MUST be built with Python FastAPI.
- **CT-003**: Database MUST be Neon Serverless Postgres.
- **CT-004**: Media assets (images, audio) MUST be stored directly in the database as BLOBs/Bytea (User decision).
- **CT-005**: Authentication MUST use Better-Auth (Frontend) with shared secret validation on Backend.

## Clarifications

### Session 2026-01-15
- Q: Which technology stack should we use? → A: Next.js (TypeScript App Router) + FastAPI + Neon Serverless Postgres DB.
- Q: How should user-uploaded media (images, audio) be stored? → A: Database Storage (BLOBs).
- Q: For the "Agile project management" view, what is the minimum viable scope? → A: Simple Kanban (Fixed).
- Q: What is the relationship between "Notes" (capture) and "Projects" (execution)? → A: Separate Entities.
- Q: Which authentication strategy should we use? → A: Better-Auth (TS) + Shared Secret.

## Assumptions

- "Agile frameworks" implies a fixed-column Kanban board (To Do, In Progress, Done) for the initial version.
- "Full-stack" implies a modern web architecture (Frontend + Backend + Database).
- Notes and Projects are distinct entities with no direct functional linkage (converting notes to tasks is out of scope for now).
- Deployment will be web-based initially.
