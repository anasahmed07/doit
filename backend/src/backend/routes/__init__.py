from fastapi import FastAPI, APIRouter
from backend.core.config import settings

main_router = APIRouter()

@main_router.get("/health")
def health_check():
    return {"status": "ok", "service": "DoIt Backend"}

@main_router.get(settings.API_PREFIX)
def root():
    return {"message": f"Welcome to DoIt API v{settings.VERSION}"}

def include_routes(app: FastAPI):
    app.include_router(main_router)
