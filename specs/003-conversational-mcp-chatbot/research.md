# Research: Conversational MCP Chatbot

**Date**: 2026-02-08
**Feature**: 003-conversational-mcp-chatbot

## R1: MCP Server Framework — FastMCP

**Decision**: Use FastMCP (Python) with Streamable HTTP transport.

**Rationale**: FastMCP is the official high-level Python SDK for building MCP servers. It provides decorator-based tool registration, built-in Streamable HTTP transport, middleware support for authentication, and context dependency injection. It powers 70% of MCP servers and is the most mature Python MCP framework.

**Key API patterns**:
```python
from fastmcp import FastMCP
from fastmcp.server.context import Context

mcp = FastMCP("doit-mcp")

@mcp.tool
async def create_task(content: str, priority: str = "MEDIUM", ctx: Context = CurrentContext()) -> str:
    # ctx provides request context, user_id via middleware
    ...

mcp.run(transport="http", host="0.0.0.0", port=8001)
# Exposes endpoint at /mcp
```

**Authentication**: FastMCP middleware intercepts requests to validate session tokens and inject user_id into context. Tools access user_id via `ctx` without exposing it to the LLM.

**Alternatives considered**:
- Raw `mcp` SDK: Lower level, more boilerplate. FastMCP wraps it.
- Custom REST API: Doesn't follow MCP protocol, can't leverage agent SDKs.

## R2: LLM Agent Framework — OpenAI Agents SDK with Custom Gemini Provider

**Decision**: Use `openai-agents` SDK with a custom Gemini model provider that calls the Gemini API directly via its OpenAI-compatible endpoint.

**Rationale**: The OpenAI Agents SDK has first-class MCP integration via `MCPServerStreamableHttp`. It supports streaming via `Runner.run_streamed()`. Google Gemini exposes an OpenAI-compatible REST endpoint at `https://generativelanguage.googleapis.com/v1beta/openai/`, allowing us to create a custom provider using `AsyncOpenAI` pointed at this base URL — no LiteLLM dependency needed.

**Key API patterns**:
```python
from openai import AsyncOpenAI
from agents import Agent, Runner, set_default_openai_client, set_default_openai_api
from agents.mcp import MCPServerStreamableHttp

# Custom Gemini provider via OpenAI-compatible endpoint
gemini_client = AsyncOpenAI(
    api_key=GEMINI_API_KEY,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
)
set_default_openai_client(gemini_client)
set_default_openai_api("chat_completions")  # Gemini doesn't support Responses API

agent = Agent(
    name="DoIt Assistant",
    model="gemini-3.5-flash",  # Gemini model name directly
    instructions="You are a productivity assistant...",
    mcp_servers=[mcp_server],
)

# Streaming
result = Runner.run_streamed(agent, "Add a task called 'Buy groceries'")
async for event in result.stream_events():
    # Stream to frontend
```

**Important**: Must call `set_default_openai_api("chat_completions")` since Gemini doesn't support the OpenAI Responses API. The Gemini OpenAI-compatible endpoint supports function/tool calling natively.

**Alternatives considered**:
- LiteLLM: Adds an unnecessary dependency; Gemini's own OpenAI-compatible endpoint is sufficient.
- Direct Gemini SDK (google-genai): No MCP integration, manual tool calling.
- LangChain: Heavier, unnecessary abstraction layer.
- Anthropic SDK: User chose Gemini 3.5.

## R3: MCP Server Architecture — Standalone with Direct DB Access

**Decision**: Standalone Python service sharing the same PostgreSQL database as the backend. Deployed on Hugging Face.

**Rationale**: User specified standalone deployment on Hugging Face. Direct DB access avoids HTTP round-trips to the backend API. The MCP server reuses the same SQLModel models and database connection patterns.

**Key considerations**:
- Shares `DATABASE_URL` environment variable with the backend.
- Reuses SQLModel models (can import or duplicate the model files).
- Must handle its own session management (same pattern as backend).
- Session token validation follows the same logic as `backend/core/security.py`.

**Alternatives considered**:
- Embedded in backend: Simpler but not deployable separately on HF.
- Calling backend API over HTTP: Adds latency, extra auth complexity.

## R4: Conversation Persistence — New DB Tables

**Decision**: Add `conversation` and `message` tables to the shared PostgreSQL database, managed via Alembic migration in the backend.

**Rationale**: Conversations must persist across sessions (spec clarification). Using the same database keeps data co-located. The backend manages migrations (Alembic), so new tables are added there. The MCP server reads/writes these tables directly.

**Schema design**:
- `conversation`: id (UUID), user_id (UUID, indexed), title (nullable str), created_at, updated_at
- `message`: id (UUID), conversation_id (UUID, FK), role (str: user/assistant), content (text), created_at

## R5: Frontend Chat Architecture

**Decision**: Chat widget (floating panel) on all dashboard pages + dedicated `/chat` page. Use Vercel AI SDK or raw `fetch` with streaming for the chat API route.

**Rationale**: The user specified both a chat widget and a chat page. The widget provides quick access; the full page provides the complete conversation management experience (list, switch, delete). Streaming is achieved via a Next.js API route that proxies to the agent endpoint and streams SSE back to the client.

**Key patterns**:
- Chat API route: `frontend/src/app/api/chat/route.ts` — accepts messages, forwards to agent, streams response.
- Chat page: `frontend/src/app/(dashboard)/chat/page.tsx` — full conversation UI with sidebar.
- Chat widget: `frontend/src/components/ChatWidget.tsx` — floating panel, toggle button.
- Markdown rendering: Already have `react-markdown` with `remark-gfm` and `@tailwindcss/typography`.

## R6: Agent Orchestration Endpoint

**Decision**: Create a FastAPI endpoint in the MCP server project that orchestrates the OpenAI Agents SDK. This endpoint receives user messages, runs the agent with MCP tools, and streams responses back.

**Rationale**: The frontend needs an HTTP endpoint to send messages to. The MCP server itself speaks MCP protocol (tools), but the agent orchestration (LLM + tools) needs a separate HTTP API. This lives in the same `mcp/` project as a FastAPI app alongside the MCP server.

**Architecture**:
```
Frontend (Next.js) → /api/chat (proxy) → MCP Service (FastAPI + Agent) → MCP Server (FastMCP tools) → DB
```

The MCP service runs two things:
1. FastMCP server on `/mcp` (Streamable HTTP) — exposes tools
2. FastAPI app on `/api/chat` — orchestrates the agent, connects to MCP server internally
