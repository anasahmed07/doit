from fastapi import FastAPI, APIRouter
from backend.core.config import settings
from backend.routes.notes import router as notes_router
from backend.routes.categories import router as categories_router
from backend.routes.projects import router as projects_router
from backend.routes.dashboard import router as dashboard_router
from backend.routes.notifications import router as notifications_router
from backend.routes.invitations import router as invitations_router

root_router = APIRouter()

@root_router.get("/health")
def health_check():
    return {"status": "ok", "service": "DoIt Backend"}

@root_router.get(settings.API_PREFIX)
def root():
    return {"message": f"Welcome to DoIt API v{settings.VERSION}"}

def include_routes(app: FastAPI):
    app.include_router(root_router)
    app.include_router(categories_router, prefix=f"{settings.API_PREFIX}/categories", tags=["categories"])
    app.include_router(notes_router, prefix=f"{settings.API_PREFIX}/notes", tags=["notes"])
    app.include_router(projects_router, prefix=f"{settings.API_PREFIX}/projects", tags=["projects"])
    app.include_router(dashboard_router, prefix=f"{settings.API_PREFIX}/dashboard", tags=["dashboard"])
    app.include_router(notifications_router, prefix=f"{settings.API_PREFIX}/notifications", tags=["notifications"])
    app.include_router(invitations_router, prefix=f"{settings.API_PREFIX}/invitations", tags=["invitations"])