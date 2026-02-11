# DoIt — Conversational MCP Chatbot

## Overview

Phase 3 adds a conversational AI layer to DoIt. A standalone MCP (Model Context Protocol) service exposes 15 tools that let users manage tasks, notes, projects, and categories through natural language. The frontend gains a dedicated `/chat` page and a floating chat widget that is accessible from every screen.

Instead of navigating menus and forms, users can type things like "Add a task called Deploy v3 to the Backend project" or "Show my notes in the Work category" and the assistant handles the rest.

## How It Works

```
User types a message
        |
        v
  Next.js /api/chat proxy
        |  (forwards session token as Bearer)
        v
  MCP Service  POST /api/chat
        |
        |-- Authenticates user via session token
        |-- Loads conversation history from DB
        |-- Sends message + history to Gemini agent
        |
        v
  Gemini Agent (OpenAI Agents SDK)
        |
        |-- Decides which MCP tools to call
        |-- Calls tools via Streamable HTTP transport
        |-- Tools query/mutate the shared PostgreSQL DB
        |-- Streams text deltas back
        |
        v
  SSE stream back to frontend
        |
        v
  Chat UI renders markdown in real time
```

## MCP Service

The MCP service is a standalone Python application that combines FastMCP (for tool hosting) and FastAPI (for the chat and conversation REST endpoints) into a single ASGI server.

### Stack

| Component | Technology |
|-----------|-----------|
| MCP framework | FastMCP with Streamable HTTP transport |
| AI agent | OpenAI Agents SDK + Google Gemini |
| HTTP framework | FastAPI |
| Database access | SQLAlchemy (async) on the same Neon PostgreSQL as the backend |
| Auth | Session token validation against the `session` table |
| Package manager | uv |

### Tools

All tools receive the authenticated `user_id` via middleware context. Users can only access their own data.

#### Tasks (4 tools)

| Tool | Description |
|------|-------------|
| `list_tasks` | List tasks in a project, optionally filtered by status (TODO, IN_PROGRESS, DONE) |
| `create_task` | Create a task with content, optional priority (LOW/MEDIUM/HIGH), due date, and project |
| `update_task` | Update a task's status, content, priority, or due date |
| `delete_task` | Delete a task by its content |

When no project is specified, tasks default to the user's default project. If the user has no projects, one named "My Tasks" is created automatically.

#### Notes (4 tools)

| Tool | Description |
|------|-------------|
| `list_notes` | List all notes, optionally filtered by category |
| `create_note` | Create a note with title, markdown content, and optional category |
| `update_note` | Update a note's title, content, or category |
| `delete_note` | Delete a note by its title |

#### Projects (3 tools)

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects with task count breakdowns |
| `create_project` | Create a new project |
| `update_project` | Rename a project |

#### Categories (3 tools)

| Tool | Description |
|------|-------------|
| `list_categories` | List all note categories with name and color |
| `create_category` | Create a category with name and hex color |
| `delete_category` | Delete a category by name |

#### Dashboard (1 tool)

| Tool | Description |
|------|-------------|
| `get_dashboard_summary` | Returns total projects, active/completed tasks, total notes, and categories |

### Agent

The Gemini agent is configured with a system prompt that tells it how to use the tools and handle natural language inputs:

- Parses natural language dates ("tomorrow", "next Monday") into ISO format
- Interprets priority from phrases like "urgent" or "low priority"
- Converts color names ("green", "blue") to hex codes
- Asks for clarification when a command is ambiguous
- Confirms every action after completing it

The agent uses the OpenAI Agents SDK with Gemini's OpenAI-compatible endpoint. It connects to the MCP tools via Streamable HTTP transport with the user's ID injected as a header.

If the Gemini API returns an error (e.g. from malformed history), the agent retries once with only the latest message, dropping conversation history.

## Chat API

### POST /api/chat

Send a message and receive a streamed response.

**Request body:**
```json
{
  "conversation_id": "uuid or null",
  "message": "Add a task called Buy groceries"
}
```

**Response:** Server-Sent Events stream with these event types:

| Event type | Fields | Description |
|------------|--------|-------------|
| `text_delta` | `content` | Incremental text from the agent |
| `tool_call` | `tool`, `args` | Agent is calling an MCP tool |
| `tool_result` | `tool`, `result` | Tool returned a result |
| `done` | `conversation_id`, `message_id` | Stream complete, IDs for persistence |
| `error` | `content` | Something went wrong |

### GET /api/conversations

List all conversations for the authenticated user, ordered by most recent.

### GET /api/conversations/{id}/messages

Get all messages in a conversation, ordered chronologically.

### DELETE /api/conversations/{id}

Delete a conversation and all its messages.

All endpoints require a `Bearer <session_token>` in the Authorization header. The Next.js frontend proxies these through its own API routes, extracting the session token from cookies.

## Data Model

Two new tables were added to the shared PostgreSQL database via Alembic migration:

### conversation

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK -> user.id) | Owner |
| title | VARCHAR(255), nullable | Auto-generated from first message |
| created_at | TIMESTAMP | Creation time |
| updated_at | TIMESTAMP | Last activity |

### message

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| conversation_id | UUID (FK -> conversation.id) | Parent conversation |
| role | VARCHAR(20) | "user" or "assistant" |
| content | TEXT | Message content |
| created_at | TIMESTAMP | When the message was sent |

Messages cascade-delete when their conversation is deleted.

## Frontend

### Chat Page (`/chat`)

A full-page chat interface with:

- **Conversation sidebar** — lists past conversations, create new, delete existing
- **Message area** — scrollable list of user and assistant messages with markdown rendering
- **Input bar** — text input with send button, disabled while the assistant is responding

### Chat Widget

A floating bubble button (visible on all dashboard pages) that opens a slide-out chat panel. Uses the same components as the full chat page but in a compact overlay. Conversation state persists as users navigate between pages.

### Components

| Component | Purpose |
|-----------|---------|
| `ChatPanel` | Main chat container with conversation list, message area, and input |
| `ChatMessageList` | Renders messages with markdown, handles auto-scroll |
| `ChatInput` | Text input with send action |
| `ChatWidget` | Floating button + slide-out panel wrapper |
| `CustomAudioPlayer` | Audio playback UI for media attachments |
| `MarkdownComponents` | Custom renderers for markdown elements in chat |

### API Proxy Routes

The frontend proxies all chat requests through Next.js API routes to inject the session token:

| Frontend route | Proxies to |
|----------------|-----------|
| `POST /api/chat` | `MCP_URL/api/chat` |
| `GET /api/conversations` | `MCP_URL/api/conversations` |
| `GET /api/conversations/[id]/messages` | `MCP_URL/api/conversations/{id}/messages` |
| `DELETE /api/conversations/[id]` | `MCP_URL/api/conversations/{id}` |

## Infrastructure

### Docker Compose

The MCP service runs as a third container alongside the backend and frontend:

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: ./backend/.env

  mcp:
    build: ./mcp
    ports: ["8080:8080"]
    env_file: ./mcp/.env

  frontend:
    image: node:20-alpine
    ports: ["3000:3000"]
    environment:
      - BACKEND_URL=http://backend:8000
      - MCP_URL=http://mcp:8080
```

### CI/CD

A GitHub Actions workflow (`deploy-mcp.yml`) deploys the MCP service to Hugging Face Spaces on pushes to `main` that touch the `mcp/` directory.

### Environment Variables

The MCP service requires:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `BETTER_AUTH_SECRET` | Shared secret for session validation |
| `MCP_HOST` | Bind host (default `0.0.0.0`) |
| `MCP_PORT` | Bind port (default `8080`) |

## Project Layout

```
mcp/
+-- src/mcp_service/
|   +-- main.py            # FastAPI app + MCP server + chat/conversation endpoints
|   +-- agent.py           # Gemini agent setup and streaming runner
|   +-- auth.py            # Session token validation
|   +-- config.py          # Settings from environment
|   +-- database.py        # Async SQLAlchemy session factory
|   +-- models/
|   |   +-- conversation.py  # Conversation + Message ORM models
|   |   +-- project.py       # Project + Task models (read-only for tools)
|   |   +-- note.py          # Note model
|   |   +-- category.py      # Category model
|   |   +-- user.py          # User model
|   |   +-- session.py       # Session model (for auth)
|   +-- tools/
|       +-- tasks.py        # list/create/update/delete task tools
|       +-- notes.py        # list/create/update/delete note tools
|       +-- projects.py     # list/create/update project tools
|       +-- categories.py   # list/create/delete category tools
|       +-- dashboard.py    # get_dashboard_summary tool
+-- Dockerfile
+-- pyproject.toml
+-- uv.lock
```
