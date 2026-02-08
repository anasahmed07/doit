# Chat API Contract

**Date**: 2026-02-08
**Feature**: 003-conversational-mcp-chatbot

## MCP Service Endpoints (FastAPI — mcp/ project)

Base URL: `http://localhost:8080` (dev) / Hugging Face Space URL (prod)

### POST /api/chat

Send a message and receive a streamed response from the LLM agent.

**Request**:
```json
{
  "conversation_id": "uuid-string | null",
  "message": "Add a task called 'Buy groceries'"
}
```

**Headers**:
- `Authorization: Bearer <session_token>` (required)

**Response**: Server-Sent Events (SSE) stream
```
Content-Type: text/event-stream

data: {"type": "text_delta", "content": "I'll create"}
data: {"type": "text_delta", "content": " that task for you."}
data: {"type": "tool_call", "tool": "create_task", "args": {"content": "Buy groceries"}}
data: {"type": "tool_result", "tool": "create_task", "result": "Task created..."}
data: {"type": "text_delta", "content": " Done! I've created..."}
data: {"type": "done", "conversation_id": "uuid", "message_id": "uuid"}
```

**Error responses**:
- `401`: Invalid or expired session token
- `500`: Internal server error (LLM or MCP failure)

### GET /api/conversations

List all conversations for the authenticated user.

**Headers**:
- `Authorization: Bearer <session_token>` (required)

**Response**:
```json
[
  {
    "id": "uuid",
    "title": "Task management",
    "created_at": "2026-02-08T10:00:00Z",
    "updated_at": "2026-02-08T10:05:00Z"
  }
]
```

### GET /api/conversations/{conversation_id}/messages

Get all messages in a conversation.

**Headers**:
- `Authorization: Bearer <session_token>` (required)

**Response**:
```json
[
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "user",
    "content": "Add a task called 'Buy groceries'",
    "created_at": "2026-02-08T10:00:00Z"
  },
  {
    "id": "uuid",
    "conversation_id": "uuid",
    "role": "assistant",
    "content": "Done! I've created the task 'Buy groceries'...",
    "created_at": "2026-02-08T10:00:01Z"
  }
]
```

### DELETE /api/conversations/{conversation_id}

Delete a conversation and all its messages.

**Headers**:
- `Authorization: Bearer <session_token>` (required)

**Response**:
```json
{"ok": true}
```

## Frontend API Routes (Next.js proxy)

### POST /api/chat
Proxies to MCP service `POST /api/chat`. Extracts session token from cookies and forwards as Bearer token. Streams SSE response back to client.

### GET /api/conversations
Proxies to MCP service `GET /api/conversations`.

### GET /api/conversations/[id]/messages
Proxies to MCP service `GET /api/conversations/{id}/messages`.

### DELETE /api/conversations/[id]
Proxies to MCP service `DELETE /api/conversations/{id}`.
