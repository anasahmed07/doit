# Implementation Plan: Conversational MCP Chatbot

**Branch**: `003-conversational-mcp-chatbot` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-conversational-mcp-chatbot/spec.md`

## Summary

Add a conversational chatbot to the DoIt application powered by a standalone MCP (Model Context Protocol) server. The MCP server exposes task, note, project, category, and dashboard tools to an LLM agent (Google Gemini 3.5 via OpenAI Agents SDK with a custom Gemini provider using the Gemini OpenAI-compatible endpoint). The frontend gains a floating chat widget on all dashboard pages and a dedicated chat page with conversation history, markdown rendering, and streaming responses. Conversations are persisted in the database with auto-generated titles.

## Technical Context

**Language/Version**: Python 3.13+ (MCP service), TypeScript (Frontend)
**Primary Dependencies**:
- MCP Service: FastMCP, openai-agents, FastAPI, SQLModel, uvicorn, openai (for AsyncOpenAI Gemini client)
- Frontend: react-markdown (existing), remark-gfm (existing), @tailwindcss/typography (existing)
**Storage**: PostgreSQL (Neon Serverless) — shared database, new `conversation` + `message` tables
**Testing**: pytest (MCP service), vitest (Frontend)
**Target Platform**: Linux server (Hugging Face Spaces for MCP), Vercel/similar for frontend
**Project Type**: Web application (monorepo with 3 projects: backend, frontend, mcp)
**Performance Goals**: Chat response streaming starts within 2 seconds, tool execution <5 seconds
**Package Manager**: uv (MCP service, same as backend)
**Constraints**: Single shared PostgreSQL database, session-based auth via Better Auth tokens
**Scale/Scope**: Single-user conversations, ~100 messages per conversation, ~50 conversations per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
| --------- | ------ | ----- |
| I. TDD | PASS | Tests will be written for MCP tools, agent orchestration, and frontend components |
| II. API-First & Type-Safe | PASS | MCP tools have defined schemas. Chat API contract defined. TypeScript types mirror backend models. |
| III. Cloud-Native Data Persistence | PASS | Conversations persisted in shared PostgreSQL via SQLModel. Alembic migration for new tables. |
| IV. Modern Web UX | PASS | Chat widget + full page. Streaming responses. Markdown rendering. Responsive design. |
| V. Code Quality & Standards | PASS | Python type-hinted, TypeScript strict mode. Same linting tools (ruff, eslint). |
| VI. Security & User Isolation | PASS | Session token validation. All DB queries scoped to user_id. MCP middleware enforces auth. |

**Post-Design Re-check**: All gates remain PASS. The 3rd project (mcp/) is justified below.

## Project Structure

### Documentation (this feature)

```text
specs/003-conversational-mcp-chatbot/
├── plan.md              # This file
├── research.md          # Phase 0 output — technology decisions
├── data-model.md        # Phase 1 output — Conversation + Message entities
├── quickstart.md        # Phase 1 output — setup guide
├── contracts/
│   ├── mcp-tools.md     # MCP tool definitions (15 tools)
│   └── chat-api.md      # HTTP API for chat + conversations
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/backend/
│   └── models/
│       └── conversation.py       # NEW — Conversation + Message SQLModel
└── migrations/
    └── versions/
        └── xxx_add_conversations.py  # NEW — Alembic migration

mcp/                                  # NEW — Standalone MCP service
├── src/
│   └── mcp_service/
│       ├── __init__.py
│       ├── main.py               # FastAPI app + FastMCP mount
│       ├── agent.py              # OpenAI Agents SDK orchestration
│       ├── auth.py               # Session token validation
│       ├── config.py             # Settings (DB, Gemini key, etc.)
│       ├── database.py           # SQLModel engine + session
│       ├── models/               # SQLModel models
│       │   ├── __init__.py
│       │   ├── user.py           # User model (copy from backend)
│       │   ├── project.py        # Project + ProjectTask (copy)
│       │   ├── note.py           # Note model (copy)
│       │   ├── category.py       # Category model (copy)
│       │   ├── conversation.py   # Conversation + Message
│       │   └── session.py        # Better Auth Session model (copy)
│       └── tools/                # FastMCP tool definitions
│           ├── __init__.py
│           ├── tasks.py          # list_tasks, create_task, update_task, delete_task
│           ├── notes.py          # list_notes, create_note, update_note, delete_note
│           ├── projects.py       # list_projects, create_project, update_project
│           ├── categories.py     # list_categories, create_category, delete_category
│           └── dashboard.py      # get_dashboard_summary
├── tests/
│   ├── test_tools/
│   └── test_agent.py
├── pyproject.toml
├── Dockerfile                    # For Hugging Face deployment
└── .env

frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx        # MODIFIED — Add ChatWidget
│   │   │   └── chat/
│   │   │       └── page.tsx      # NEW — Full chat page
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts      # NEW — SSE streaming proxy
│   │       └── conversations/
│   │           ├── route.ts      # NEW — List conversations
│   │           └── [id]/
│   │               ├── route.ts  # NEW — Delete conversation
│   │               └── messages/
│   │                   └── route.ts  # NEW — Get messages
│   ├── components/
│   │   ├── ChatWidget.tsx        # NEW — Floating toggle + panel
│   │   ├── ChatPanel.tsx         # NEW — Chat conversation UI
│   │   ├── ChatMessageList.tsx   # NEW — Messages with markdown
│   │   ├── ChatInput.tsx         # NEW — Message input
│   │   └── ConversationList.tsx  # NEW — Conversation sidebar
│   └── lib/
│       └── types.ts              # MODIFIED — Add chat types
```

**Structure Decision**: Extended the existing web application structure with a 3rd project (`mcp/`) for the standalone MCP service. This is required because the MCP server is deployed independently on Hugging Face, separate from the backend (which runs on its own host).

## Complexity Tracking

> **Justified violations**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 3rd project (mcp/) | MCP service deploys independently on Hugging Face, separate from backend | Embedding in backend would prevent separate deployment; the MCP server has different dependencies (openai-agents, fastmcp) and different runtime requirements |
| Model duplication (SQLModel copies in mcp/) | MCP service needs SQLModel models to query DB directly | Shared package would add monorepo tooling complexity (workspace setup) for minimal benefit; models are stable and small |
