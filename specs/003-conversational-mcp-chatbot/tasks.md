# Tasks: Conversational MCP Chatbot

**Input**: Design documents from `/specs/003-conversational-mcp-chatbot/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the new `mcp/` project and prepare the monorepo for the MCP service

- [x] T001 Create `mcp/` project directory structure per plan.md (`mcp/src/mcp_service/`, `mcp/src/mcp_service/models/`, `mcp/src/mcp_service/tools/`, `mcp/tests/`, `mcp/tests/test_tools/`)
- [x] T002 Create `mcp/pyproject.toml` with dependencies: fastmcp, openai-agents, fastapi, sqlmodel, uvicorn, openai, python-dotenv, asyncpg; dev dependencies: pytest, pytest-asyncio, httpx
- [x] T003 [P] Create `mcp/.env` template with DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, MCP_HOST, MCP_PORT
- [x] T004 [P] Create `mcp/Dockerfile` for Hugging Face Spaces deployment (Python 3.13, uv-based install, uvicorn entrypoint on port 8080)
- [x] T005 Initialize uv environment: run `uv venv && uv pip install -e ".[dev]"` in `mcp/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend: Database Models & Migration

- [x] T006 Create Conversation + Message SQLModel models in `backend/src/backend/models/conversation.py` per data-model.md (UUID PKs, user_id FK, role enum, cascade delete)
- [x] T007 Register models in `backend/src/backend/models/__init__.py`
- [x] T008 Generate Alembic migration: `alembic revision --autogenerate -m "add conversation and message tables"` in `backend/`
- [x] T009 Run migration: `alembic upgrade head` in `backend/`

### MCP Service: Core Modules

- [x] T010 [P] Create config module `mcp/src/mcp_service/config.py` — Settings class with DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, MCP_HOST, MCP_PORT (use pydantic-settings or python-dotenv)
- [x] T011 [P] Create database module `mcp/src/mcp_service/database.py` — async SQLModel engine + async session factory (asyncpg, same pattern as backend)
- [x] T012 [P] Copy/adapt SQLModel models to `mcp/src/mcp_service/models/`:
  - `user.py` — User model (from backend)
  - `project.py` — Project + ProjectTask models (from backend)
  - `note.py` — Note model (from backend)
  - `category.py` — Category model (from backend)
  - `session.py` — Better Auth Session model (from backend)
  - `conversation.py` — Conversation + Message models (from data-model.md)
  - `__init__.py` — Export all models
- [x] T013 [P] Create auth module `mcp/src/mcp_service/auth.py` — validate_session_token function that queries the `session` table, checks expiry, returns user_id. Also create get_user_by_id helper.
- [x] T014 Create FastMCP server with auth middleware in `mcp/src/mcp_service/main.py`:
  - Initialize FastMCP server with Streamable HTTP transport
  - Add auth middleware that extracts Bearer token from Authorization header, validates via auth.py, injects user_id into context
  - Mount FastMCP on FastAPI app at `/mcp`
  - Add CORS middleware
- [x] T015 Create custom Gemini provider + agent in `mcp/src/mcp_service/agent.py`:
  - AsyncOpenAI client with `base_url="https://generativelanguage.googleapis.com/v1beta/openai/"` and GEMINI_API_KEY
  - Call `set_default_openai_client()` and `set_default_openai_api("chat_completions")`
  - Create Agent with model="gemini-3.5-flash", instructions (system prompt), and MCP server reference
  - Implement `run_agent_stream()` function that takes message + conversation history, runs `Runner.run_streamed()`, yields SSE events (text_delta, tool_call, tool_result, done)
- [x] T016 Add chat + conversation HTTP endpoints to `mcp/src/mcp_service/main.py`:
  - `POST /api/chat` — Accept message + conversation_id, authenticate, run agent, stream SSE response, persist user message + assistant response to DB, auto-generate conversation title on first message
  - `GET /api/conversations` — List conversations for authenticated user, ordered by updated_at desc
  - `GET /api/conversations/{conversation_id}/messages` — Get messages for a conversation (verify ownership)
  - `DELETE /api/conversations/{conversation_id}` — Delete conversation + messages (verify ownership)
- [x] T017 [P] Create `mcp/src/mcp_service/__init__.py` (empty init)
- [x] T018 [P] Create `mcp/src/mcp_service/tools/__init__.py` (empty init, will be populated per user story)

**Checkpoint**: Foundation ready — MCP service boots, authenticates users, has agent + Gemini provider configured, conversation CRUD endpoints work (no tools yet)

---

## Phase 3: User Story 1 — Manage Tasks via Chat (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, update, and delete tasks by chatting with the bot

**Independent Test**: Open chatbot, type "Add a task called 'Buy groceries'", verify task created in default project. Type "Show my tasks", verify list returned.

### MCP Tools

- [ ] T019 [US1] Implement task tools in `mcp/src/mcp_service/tools/tasks.py`:
  - `list_tasks(project_name?, status?)` — query ProjectTask by user's project, optional status filter, return formatted list
  - `create_task(content, project_name?, priority?, due_date?)` — find/create default project, create ProjectTask, return confirmation
  - `update_task(task_content, project_name?, status?, new_content?, priority?, due_date?)` — find task by content match, update fields, return confirmation
  - `delete_task(task_content, project_name?)` — find and delete task, return confirmation
  - All tools receive user_id via FastMCP context
- [ ] T020 [US1] Register task tools with FastMCP server in `mcp/src/mcp_service/main.py`

### Frontend: Chat UI (MVP)

- [ ] T021 [P] [US1] Add chat TypeScript types to `frontend/src/lib/types.ts`: Conversation, ChatMessage, SSEEvent interfaces per data-model.md
- [ ] T022 [P] [US1] Create `frontend/src/app/api/chat/route.ts` — POST proxy that extracts session token from cookies, forwards to MCP service `POST /api/chat`, streams SSE response back
- [ ] T023 [P] [US1] Create `frontend/src/app/api/conversations/route.ts` — GET proxy to MCP service `GET /api/conversations`
- [ ] T024 [P] [US1] Create `frontend/src/app/api/conversations/[id]/route.ts` — DELETE proxy to MCP service `DELETE /api/conversations/{id}`
- [ ] T025 [P] [US1] Create `frontend/src/app/api/conversations/[id]/messages/route.ts` — GET proxy to MCP service `GET /api/conversations/{id}/messages`
- [ ] T026 [US1] Create `frontend/src/components/ChatInput.tsx` — Message input with send button, Enter to send, Shift+Enter for newline, disabled while streaming
- [ ] T027 [US1] Create `frontend/src/components/ChatMessageList.tsx` — Scrollable message list with user/assistant bubbles, markdown rendering (react-markdown + remark-gfm), auto-scroll to bottom, streaming indicator
- [ ] T028 [US1] Create `frontend/src/components/ChatPanel.tsx` — Main chat conversation panel composing ChatMessageList + ChatInput, manages SSE streaming connection, parses SSE events, maintains message state
- [ ] T029 [US1] Create `frontend/src/app/(dashboard)/chat/page.tsx` — Full chat page with ChatPanel, "New conversation" button, responsive layout

**Checkpoint**: End-to-end task management via chat works — user can open /chat, type commands, tasks are created/listed/updated/deleted through the MCP tools, responses stream back with markdown formatting

---

## Phase 4: User Story 2 — Manage Notes via Chat (Priority: P1)

**Goal**: Users can create, view, update, and delete notes by chatting with the bot

**Independent Test**: Type "Create a note titled 'Meeting notes' with content 'Discuss Q3 roadmap'", verify note created. Type "Show my notes", verify list returned.

### MCP Tools

- [ ] T030 [P] [US2] Implement note tools in `mcp/src/mcp_service/tools/notes.py`:
  - `list_notes(category_name?)` — query Note by user_id, optional category filter, return formatted list with title/preview/category
  - `create_note(title?, content?, category_name?)` — create Note, optionally assign category, return confirmation
  - `update_note(note_title, new_title?, new_content?, category_name?)` — find note by title, update fields, return confirmation
  - `delete_note(note_title)` — find and delete note, return confirmation
  - All tools receive user_id via FastMCP context
- [ ] T031 [US2] Register note tools with FastMCP server in `mcp/src/mcp_service/main.py`

**Checkpoint**: Notes CRUD via chat works alongside task management

---

## Phase 5: User Story 3 — Chatbot UI Panel (Priority: P1)

**Goal**: Persistent floating chat widget on all dashboard pages with conversation history management

**Independent Test**: Click chatbot toggle on any dashboard page, panel slides open, type greeting, receive response. Navigate to another page, reopen — conversation preserved.

### Frontend: Conversation Management

- [ ] T032 [US3] Create `frontend/src/components/ConversationList.tsx` — Sidebar/list showing past conversations with titles, ordered by most recent, "New conversation" button, delete button per conversation, click to switch
- [ ] T033 [US3] Create `frontend/src/components/ChatWidget.tsx` — Floating toggle button (bottom-right corner) + slide-out panel containing ConversationList + ChatPanel. Toggle open/close. Full-screen on mobile. Manages active conversation_id state.
- [ ] T034 [US3] Modify `frontend/src/app/(dashboard)/layout.tsx` — Add ChatWidget component to the dashboard layout so it appears on all authenticated pages
- [ ] T035 [US3] Update `frontend/src/app/(dashboard)/chat/page.tsx` — Integrate ConversationList sidebar alongside ChatPanel for the full chat page view (wider layout than widget)

**Checkpoint**: Chat widget accessible from all dashboard pages, conversation list with history, new/switch/delete conversations all work

---

## Phase 6: User Story 4 — Manage Projects via Chat (Priority: P2)

**Goal**: Users can create, list, and update projects, and add tasks to specific projects

**Independent Test**: Type "Create a project called 'Website Redesign'", verify project appears. Type "Add a task 'Design mockups' to 'Website Redesign'", verify task in correct project.

### MCP Tools

- [ ] T036 [P] [US4] Implement project tools in `mcp/src/mcp_service/tools/projects.py`:
  - `list_projects()` — query Project by user_id (owner or member), return with task count breakdown
  - `create_project(name)` — create Project, add user as owner, return confirmation
  - `update_project(project_name, new_name)` — find project, rename, return confirmation
  - All tools receive user_id via FastMCP context
- [ ] T037 [US4] Register project tools with FastMCP server in `mcp/src/mcp_service/main.py`

**Checkpoint**: Project management via chat works — creates projects, lists with counts, renames. Task tools already support project_name parameter from US1.

---

## Phase 7: User Story 5 — Manage Categories via Chat (Priority: P2)

**Goal**: Users can create, list, and delete note categories through chat

**Independent Test**: Type "Create a category called 'Research' with color green", verify category created. Type "List my categories", verify list returned.

### MCP Tools

- [ ] T038 [P] [US5] Implement category tools in `mcp/src/mcp_service/tools/categories.py`:
  - `list_categories()` — query Category by user_id, return with name and color
  - `create_category(name, color?)` — create Category, return confirmation
  - `delete_category(category_name)` — find and delete category, return confirmation
  - All tools receive user_id via FastMCP context
- [ ] T039 [US5] Register category tools with FastMCP server in `mcp/src/mcp_service/main.py`

**Checkpoint**: Category management via chat works alongside all other tools

---

## Phase 8: User Story 6 — Dashboard Summary via Chat (Priority: P3)

**Goal**: Users can ask for a productivity dashboard summary via chat

**Independent Test**: Type "Show my dashboard summary", verify counts match actual dashboard page.

### MCP Tools

- [ ] T040 [P] [US6] Implement dashboard tool in `mcp/src/mcp_service/tools/dashboard.py`:
  - `get_dashboard_summary()` — aggregate query: total projects, active tasks (TODO + IN_PROGRESS), completed tasks (DONE), total notes. Return formatted summary.
  - Receives user_id via FastMCP context
- [ ] T041 [US6] Register dashboard tool with FastMCP server in `mcp/src/mcp_service/main.py`

**Checkpoint**: All 15 MCP tools operational, full conversational interface complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, mobile polish, and deployment readiness

- [ ] T042 [P] Add graceful error handling in ChatPanel for MCP service unavailability (FR-014) — show user-friendly error message
- [ ] T043 [P] Add session expiry detection in chat proxy routes — detect 401 from MCP, prompt re-login (FR-014)
- [ ] T044 [P] Mobile responsiveness for ChatWidget — full-screen panel on small screens (FR-016)
- [ ] T045 [P] Update agent system prompt in `mcp/src/mcp_service/agent.py` — refine instructions for all 15 tools, edge cases (ambiguous commands, not-found items), friendly tone
- [ ] T046 Run quickstart.md validation — verify all setup steps, environment variables, and verification steps work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **US1 Tasks via Chat (Phase 3)**: Depends on Phase 2 — delivers MVP with chat UI + task tools
- **US2 Notes via Chat (Phase 4)**: Depends on Phase 2 — can run in parallel with US1 (tools only), but chat UI from US1 is needed to test
- **US3 Chatbot UI Panel (Phase 5)**: Depends on Phase 3 (needs ChatPanel + ChatInput from US1)
- **US4 Projects via Chat (Phase 6)**: Depends on Phase 2 — can run in parallel with US1-US3 (tools only)
- **US5 Categories via Chat (Phase 7)**: Depends on Phase 2 — can run in parallel with US1-US4 (tools only)
- **US6 Dashboard Summary (Phase 8)**: Depends on Phase 2 — can run in parallel with US1-US5 (tools only)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Models/tools before registration
- Registration before testing
- Core implementation before integration

### Parallel Opportunities

- T003, T004 can run in parallel (both Phase 1, different files)
- T010, T011, T012, T013, T017, T018 can all run in parallel (different files in Phase 2)
- T021, T022, T023, T024, T025 can all run in parallel (different files, frontend proxies + types)
- All tool implementation tasks (T019, T030, T036, T038, T040) touch different files and can run in parallel once Phase 2 is complete
- Polish tasks T042-T045 are all independent

---

## Implementation Strategy

### Recommended: MVP First (Phase 1 → 2 → 3)

1. Complete Phase 1: Setup (`mcp/` project init)
2. Complete Phase 2: Foundational (DB models, migration, auth, config, agent, endpoints)
3. Complete Phase 3: US1 — Task tools + Chat UI (delivers working chatbot)
4. **STOP and VALIDATE**: Test end-to-end task management via chat
5. Continue with US2 (notes) → US3 (widget) → US4 (projects) → US5 (categories) → US6 (dashboard)
6. Polish phase last

### Total Tasks: 46

| Phase | Tasks | Key Deliverable |
|-------|-------|-----------------|
| Phase 1: Setup | T001–T005 (5) | `mcp/` project initialized |
| Phase 2: Foundational | T006–T018 (13) | MCP service boots with auth, agent, endpoints |
| Phase 3: US1 Tasks + Chat UI | T019–T029 (11) | End-to-end chat with task management |
| Phase 4: US2 Notes | T030–T031 (2) | Note CRUD tools |
| Phase 5: US3 Chat Widget | T032–T035 (4) | Floating widget on all pages |
| Phase 6: US4 Projects | T036–T037 (2) | Project tools |
| Phase 7: US5 Categories | T038–T039 (2) | Category tools |
| Phase 8: US6 Dashboard | T040–T041 (2) | Dashboard summary tool |
| Phase 9: Polish | T042–T046 (5) | Error handling, mobile, deployment |
