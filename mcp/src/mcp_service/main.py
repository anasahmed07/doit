import json
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastmcp import FastMCP, Context
from pydantic import BaseModel
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload

from mcp_service.config import settings
from mcp_service.database import async_session_factory
from mcp_service.auth import validate_session_token
from mcp_service.models.conversation import Conversation, Message

# --- FastMCP Server ---
mcp = FastMCP("doit-mcp")

# --- Register MCP Tools ---
from mcp_service.tools.tasks import list_tasks, create_task, update_task, delete_task
from mcp_service.tools.notes import list_notes, create_note, update_note, delete_note
from mcp_service.tools.projects import list_projects, create_project, update_project
from mcp_service.tools.categories import list_categories, create_category, delete_category
from mcp_service.tools.dashboard import get_dashboard_summary

# Task tools
mcp.tool()(list_tasks)
mcp.tool()(create_task)
mcp.tool()(update_task)
mcp.tool()(delete_task)

# Note tools
mcp.tool()(list_notes)
mcp.tool()(create_note)
mcp.tool()(update_note)
mcp.tool()(delete_note)

# Project tools
mcp.tool()(list_projects)
mcp.tool()(create_project)
mcp.tool()(update_project)

# Category tools
mcp.tool()(list_categories)
mcp.tool()(create_category)
mcp.tool()(delete_category)

# Dashboard tools
mcp.tool()(get_dashboard_summary)

# --- FastAPI App ---
app = FastAPI(title="DoIt MCP Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount FastMCP on /mcp
mcp_app = mcp.http_app(transport="streamable-http")
app.mount("/mcp", mcp_app)


# --- Auth Helper ---
async def authenticate(request: Request) -> uuid.UUID:
    """Extract Bearer token and validate, returning user_id."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        # Also check X-User-ID header (used by internal MCP agent connections)
        user_id_header = request.headers.get("x-user-id")
        if user_id_header:
            return uuid.UUID(user_id_header)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    token = auth_header[7:]  # Strip "Bearer "
    async with async_session_factory() as db:
        return await validate_session_token(token, db)


# --- Request/Response Models ---
class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str


# --- Chat Endpoint ---
@app.post("/api/chat")
async def chat(request: Request, body: ChatRequest):
    """Send a message and receive a streamed SSE response."""
    user_id = await authenticate(request)

    # Lazy import to avoid circular issues at module load
    from mcp_service.agent import run_agent_stream

    async def event_stream():
        conversation_id = uuid.UUID(body.conversation_id) if body.conversation_id else None

        async with async_session_factory() as db:
            # Get or create conversation
            if conversation_id:
                result = await db.execute(
                    select(Conversation).where(
                        Conversation.id == conversation_id,
                        Conversation.user_id == user_id,
                    )
                )
                conversation = result.scalar_one_or_none()
                if not conversation:
                    yield f"data: {json.dumps({'type': 'error', 'content': 'Conversation not found'})}\n\n"
                    return
            else:
                conversation = Conversation(user_id=user_id)
                db.add(conversation)
                await db.commit()
                await db.refresh(conversation)
                conversation_id = conversation.id

            # Save user message
            user_msg = Message(
                conversation_id=conversation_id,
                role="user",
                content=body.message,
            )
            db.add(user_msg)
            await db.commit()

            # Load conversation history
            result = await db.execute(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at)
            )
            history_messages = result.scalars().all()
            conversation_history = [
                {"role": m.role, "content": m.content}
                for m in history_messages[:-1]  # Exclude the message we just added
            ]

        # Determine base URL for MCP server connection
        base_url = f"http://{settings.MCP_HOST}:{settings.MCP_PORT}"
        if settings.MCP_HOST == "0.0.0.0":
            base_url = f"http://127.0.0.1:{settings.MCP_PORT}"

        full_response = ""

        async for event in run_agent_stream(
            message=body.message,
            conversation_history=conversation_history,
            user_id=user_id,
            base_url=base_url,
        ):
            if event["type"] == "done":
                full_response = event.get("full_response", full_response)
            elif event["type"] == "text_delta":
                full_response += event.get("content", "")
                yield f"data: {json.dumps(event)}\n\n"
            else:
                yield f"data: {json.dumps(event)}\n\n"

        # Save assistant response and update conversation
        async with async_session_factory() as db:
            if full_response.strip():
                assistant_msg = Message(
                    conversation_id=conversation_id,
                    role="assistant",
                    content=full_response,
                )
                db.add(assistant_msg)

                # Auto-generate title on first exchange
                result = await db.execute(
                    select(Conversation).where(Conversation.id == conversation_id)
                )
                conversation = result.scalar_one()
                if not conversation.title:
                    # Use first 50 chars of user message as title
                    conversation.title = body.message[:50] + ("..." if len(body.message) > 50 else "")
                conversation.updated_at = datetime.utcnow()
                db.add(conversation)
                await db.commit()
                await db.refresh(assistant_msg)

                yield f"data: {json.dumps({'type': 'done', 'conversation_id': str(conversation_id), 'message_id': str(assistant_msg.id)})}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'done', 'conversation_id': str(conversation_id), 'message_id': ''})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# --- Conversation Endpoints ---
@app.get("/api/conversations")
async def list_conversations(request: Request):
    """List all conversations for the authenticated user."""
    user_id = await authenticate(request)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
        )
        conversations = result.scalars().all()

    return [
        {
            "id": str(c.id),
            "title": c.title,
            "created_at": c.created_at.isoformat(),
            "updated_at": c.updated_at.isoformat(),
        }
        for c in conversations
    ]


@app.get("/api/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, request: Request):
    """Get all messages in a conversation."""
    user_id = await authenticate(request)
    conv_id = uuid.UUID(conversation_id)

    async with async_session_factory() as db:
        # Verify ownership
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conv_id,
                Conversation.user_id == user_id,
            )
        )
        if not result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Conversation not found")

        result = await db.execute(
            select(Message)
            .where(Message.conversation_id == conv_id)
            .order_by(Message.created_at)
        )
        messages = result.scalars().all()

    return [
        {
            "id": str(m.id),
            "conversation_id": str(m.conversation_id),
            "role": m.role,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ]


@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, request: Request):
    """Delete a conversation and all its messages."""
    user_id = await authenticate(request)
    conv_id = uuid.UUID(conversation_id)

    async with async_session_factory() as db:
        # Verify ownership
        result = await db.execute(
            select(Conversation).where(
                Conversation.id == conv_id,
                Conversation.user_id == user_id,
            )
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

        # Delete messages first (cascade should handle this, but be explicit)
        await db.execute(
            delete(Message).where(Message.conversation_id == conv_id)
        )
        await db.delete(conversation)
        await db.commit()

    return {"ok": True}