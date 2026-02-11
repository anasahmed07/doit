# DoIt

![DoIt Banner](../frontend/public/images/doit%20frontend.png)

> From CLI to full-stack to fully agentic — a productivity platform where you can manage tasks, projects, and notes through a web UI or just by chatting with an AI assistant.

![Python](https://img.shields.io/badge/python-3.13+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-16-black.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-009688.svg)
![MCP](https://img.shields.io/badge/MCP-FastMCP-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## What is DoIt?

DoIt is a productivity application that combines a traditional web interface with a conversational AI assistant. You can organize your work the classic way — dashboards, Kanban boards, note editors — or skip the clicks entirely and just tell the chatbot what you need. Both interfaces share the same data, so everything stays in sync.

## Screenshots

| Dashboard | Kanban Board |
|:---------:|:------------:|
| ![Dashboard](../frontend/public/images/Doit%20Dashboard.png) | ![Kanban Board](../frontend/public/images/Doit%20Project%20Kanban%20view.png) |

| Notes Board | Chat Interface |
|:-----------:|:--------------:|
| ![Notes Board](../frontend/public/images/Doit%20Notes%20Board.png) | ![Chat Interface](../frontend/public/images/Doit%20Chat%20Interface.png) |

## Architecture

```
+---------------------------------------------------------+
|                   Frontend (Next.js 16)                  |
|   Dashboard  |  Projects  |  Notes  |  Chat UI/Widget   |
+------+-------------+-------------+----------------------+
       | REST         | REST         | SSE + REST
       v              v              v
+--------------+              +------------------+
|   Backend    |              |   MCP Service    |
|   FastAPI    |              | FastMCP + Gemini |
|              |              |  Agent + Tools   |
+------+-------+              +--------+---------+
       |                               |
       v                               v
+---------------------------------------------------------+
|              PostgreSQL (Neon Serverless)                |
|  users | projects | tasks | notes | categories | chat   |
+---------------------------------------------------------+
```

## Features

### Task Management
- Create, update, delete, and organize tasks across multiple projects
- Kanban board with drag-and-drop columns (TODO / In Progress / Done)
- Grid view alternative with priority levels (Low, Medium, High) and due dates

### Notes
- Rich markdown editor with formatting toolbar
- Image and audio media attachments
- Category-based organization and filtering

### Projects and Categories
- Multiple projects with Kanban or Grid framework selection
- Color-coded categories shared across notes and tasks
- Dashboard with stats overview

### Conversational AI Chat
- Full `/chat` page and a floating chat widget accessible from any screen
- Natural language management — "Add a task called Deploy v3", "Show my notes", "Create a project called Backend Rewrite"
- 15 MCP tools covering tasks, notes, projects, categories, and dashboard stats
- Google Gemini agent with per-user authenticated context
- Real-time SSE streaming with markdown rendering
- Persistent conversation history with create, switch, and delete support

### Auth and Infrastructure
- Better Auth with email/password, Google, and GitHub OAuth
- Docker Compose with three services (backend, mcp, frontend)
- GitHub Actions CI/CD deploying to Hugging Face Spaces
- Neon serverless PostgreSQL with Alembic migrations

## Project Structure

```
doit/
+-- frontend/          # Next.js 16, TypeScript, Tailwind, shadcn/ui
+-- backend/           # FastAPI, SQLAlchemy, Alembic, Better Auth
+-- mcp/               # FastMCP, Gemini agent, MCP tools (Python 3.13+)
+-- doit-cli/          # Original CLI app
+-- specs/             # Feature specs, plans, and task breakdowns
+-- docs/              # Documentation
+-- docker-compose.yml # Full local dev stack
+-- .github/workflows/ # CI/CD pipelines
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- Python 3.13+ with [uv](https://docs.astral.sh/uv/)
- A [Neon](https://neon.tech) PostgreSQL database

### Run with Docker Compose

```bash
# Copy env files
cp backend/.env.example backend/.env
cp mcp/.env.example mcp/.env
cp frontend/.env.example frontend/.env.local

# Fill in your database URL, auth secrets, and Gemini API key

# Start all services
docker compose up
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MCP Service**: http://localhost:8080

### Run services individually

```bash
# Backend
cd backend && uv sync && uv run dev

# MCP Service
cd mcp && uv sync && uv run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | FastAPI, SQLModel, Alembic, Pydantic |
| MCP Service | FastMCP,Openai agents sdk, Google Gemini, FastAPI (SSE) |
| Database | PostgreSQL (Neon Serverless) |
| Auth | Better Auth (email, Google, GitHub OAuth) |
| CLI | Python, Rich, prompt-toolkit |
| DevOps | Docker Compose, GitHub Actions, Hugging Face Spaces |

## Documentation

- [Phase 1 — CLI](phase%201%20-%20doit-cli/) — Terminal task manager with slash commands and smart autocomplete
- [Phase 2 — Full-Stack Web App](phase%202%20-%20fullstack%20web%20app/phase%202.md) — Next.js + FastAPI web platform with auth, projects, Kanban, and notes
- [Phase 3 — Conversational AI](phase%203%20-%20conversational%20mcp%20chatbot/phase%203.md) — MCP-powered chatbot with Gemini agent and 15 natural-language tools

## Releases

- [**v3.0.0**](https://github.com/anasahmed07/doit/releases/tag/v3.0.0) — Conversational MCP Chatbot
- [**v2.0.0**](https://github.com/anasahmed07/doit/releases/tag/v2.0.0) — Full-Stack Web App
- [**v1.0.0**](https://github.com/anasahmed07/doit/releases/tag/v1.0.0) — CLI Task Manager

## License

MIT
