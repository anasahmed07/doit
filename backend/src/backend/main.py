from fastapi import FastAPI
from backend.core.config import settings
from backend.routes import include_routes
from backend.middlewares import include_middlewares

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend for DoIt Full-Stack Productivity App",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Include Middlewares
include_middlewares(app)

# Include Routes
include_routes(app)
