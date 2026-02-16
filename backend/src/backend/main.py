import socketio
from fastapi import FastAPI
from backend.core.config import settings
from backend.routes import include_routes
from backend.middlewares import include_middlewares
from backend.core.socketio import sio

fastapi_app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for DoIt Full-Stack Productivity App",
)

# Include Middlewares
include_middlewares(fastapi_app)

# Include Routes
include_routes(fastapi_app)

# Wrap FastAPI with Socket.IO ASGI app
app = socketio.ASGIApp(sio, other_asgi_app=fastapi_app, socketio_path="/socket.io")
