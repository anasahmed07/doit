import asyncio
import logging
from typing import Optional

import socketio
from backend.core.config import settings

logger = logging.getLogger("uvicorn.error")

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.CORS_ORIGINS + ["*"],
    logger=True,
    engineio_logger=True,
)

# Reference to the main event loop, captured on first client connect
_event_loop: Optional[asyncio.AbstractEventLoop] = None


@sio.event
async def connect(sid, environ):
    global _event_loop
    if _event_loop is None:
        _event_loop = asyncio.get_running_loop()
        logger.info("Socket.IO: event loop captured")
    logger.info(f"Socket.IO: client connected ({sid})")


@sio.event
async def disconnect(sid):
    logger.info(f"Socket.IO: client disconnected ({sid})")


@sio.event
async def join_project(sid, data):
    """Client joins a project room to receive realtime updates."""
    project_id = data.get("project_id")
    if project_id:
        sio.enter_room(sid, f"project:{project_id}")
        logger.info(f"Socket.IO: {sid} joined room project:{project_id}")


@sio.event
async def leave_project(sid, data):
    """Client leaves a project room."""
    project_id = data.get("project_id")
    if project_id:
        sio.leave_room(sid, f"project:{project_id}")


def emit_task_event(project_id: str, event: str, data: dict):
    """
    Emit a task event to all clients in a project room.
    Uses run_coroutine_threadsafe to bridge sync route handlers
    to the async Socket.IO server.
    """

    async def _emit():
        room = f"project:{project_id}"
        # Debug: check who's in the room
        try:
            participants = list(sio.manager.get_participants("/", room))
            logger.info(f"Socket.IO: room {room} has {len(participants)} participant(s): {participants}")
        except Exception as e:
            logger.warning(f"Socket.IO: could not get participants: {e}")
        await sio.emit(event, data, room=room)
        logger.info(f"Socket.IO: emitted {event} to room {room}")

    if _event_loop is not None:
        asyncio.run_coroutine_threadsafe(_emit(), _event_loop)
    else:
        logger.warning(f"Socket.IO: cannot emit {event} — no event loop (no clients connected yet)")
