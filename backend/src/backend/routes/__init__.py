from fastapi import FastAPI, APIRouter
from backend.core.config import settings
from .categories import router as categories_router
from .notes import router as notes_router
from .projects import router as projects_router

main_router = APIRouter()

@main_router.get("/health")
def health_check():
    return {"status": "ok", "service": "DoIt Backend"}

@main_router.get(settings.API_PREFIX)
def root():
    return {"message": f"Welcome to DoIt API v{settings.VERSION}"}

def include_routes(app: FastAPI):
    app.include_router(main_router)
    app.include_router(categories_router, prefix=f"{settings.API_PREFIX}/categories", tags=["categories"])
    app.include_router(notes_router, prefix=f"{settings.API_PREFIX}/notes", tags=["notes"])
    app.include_router(projects_router, prefix=f"{settings.API_PREFIX}/projects", tags=["projects"])