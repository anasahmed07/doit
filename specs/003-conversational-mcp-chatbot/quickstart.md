# Quickstart: Conversational MCP Chatbot

**Date**: 2026-02-08
**Feature**: 003-conversational-mcp-chatbot

## Prerequisites

- Python 3.13+
- Node.js 18+
- PostgreSQL (Neon Serverless) — same DB as backend
- Google AI API key (for Gemini 3.5)
- Hugging Face account (for MCP deployment)

## Environment Variables

### MCP Service (`mcp/.env`)
```env
DATABASE_URL=postgresql://...  # Same as backend
BETTER_AUTH_SECRET=...          # Same as backend (for session validation)
GEMINI_API_KEY=...              # Google AI API key
MCP_HOST=0.0.0.0
MCP_PORT=8001
```

### Frontend additions (`frontend/.env.local`)
```env
NEXT_PUBLIC_MCP_URL=http://localhost:8080  # MCP service URL
```

## Project Setup

### 1. MCP Service
```bash
cd mcp/
uv venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
uv pip install -e ".[dev]"
```

### 2. Database Migration
```bash
cd backend/
alembic revision --autogenerate -m "add conversation and message tables"
alembic upgrade head
```

### 3. Frontend Dependencies
```bash
cd frontend/
npm install  # No new deps expected beyond what's already installed
```

## Running Locally

### Terminal 1: Backend (existing)
```bash
cd backend/ && uv run dev
```

### Terminal 2: MCP Service
```bash
cd mcp/ && uvicorn mcp_service.main:app --reload --port 8080
```

### Terminal 3: Frontend (existing)
```bash
cd frontend/ && npm run dev
```

## Verification Steps

1. **MCP tools available**: `curl http://localhost:8080/mcp` (should respond with MCP protocol)
2. **Chat API works**: `curl -X POST http://localhost:8080/api/chat -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"message": "hello"}'`
3. **Frontend chat**: Navigate to `http://localhost:3000/chat` — should see chat interface
4. **Widget**: Click the chat toggle on any dashboard page — panel should slide open

## Key Files to Create

```
mcp/                              # NEW — standalone MCP service
├── src/
│   └── mcp_service/
│       ├── __init__.py
│       ├── main.py               # FastAPI app + FastMCP server mount
│       ├── agent.py              # OpenAI Agents SDK + custom Gemini provider
│       ├── auth.py               # Session token validation (mirrors backend)
│       ├── config.py             # Settings (DATABASE_URL, GEMINI_API_KEY, etc.)
│       ├── database.py           # SQLModel engine + session
│       ├── models/               # SQLModel models (shared with backend)
│       │   ├── __init__.py
│       │   ├── conversation.py   # Conversation + Message models
│       │   └── ...               # Copies/imports of existing models
│       └── tools/                # MCP tool definitions
│           ├── __init__.py
│           ├── tasks.py          # Task CRUD tools
│           ├── notes.py          # Note CRUD tools
│           ├── projects.py       # Project tools
│           ├── categories.py     # Category tools
│           └── dashboard.py      # Dashboard summary tool
├── tests/
├── pyproject.toml
└── .env

backend/
├── src/backend/models/
│   └── conversation.py           # NEW — Conversation + Message SQLModel
└── migrations/
    └── versions/
        └── xxx_add_conversation_tables.py  # NEW — Alembic migration

frontend/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── chat/
│   │   │       └── page.tsx      # NEW — Full chat page
│   │   └── api/
│   │       ├── chat/
│   │       │   └── route.ts      # NEW — Chat proxy (SSE streaming)
│   │       └── conversations/
│   │           ├── route.ts      # NEW — List conversations proxy
│   │           └── [id]/
│   │               ├── messages/
│   │               │   └── route.ts  # NEW — Get messages proxy
│   │               └── route.ts      # NEW — Delete conversation proxy
│   ├── components/
│   │   ├── ChatWidget.tsx        # NEW — Floating chat panel + toggle
│   │   ├── ChatPanel.tsx         # NEW — Chat conversation UI
│   │   ├── ChatMessageList.tsx   # NEW — Message list with markdown
│   │   ├── ChatInput.tsx         # NEW — Message input with send
│   │   └── ConversationList.tsx  # NEW — Conversation sidebar/list
│   └── lib/
│       └── types.ts              # MODIFIED — Add Conversation, ChatMessage types
```
