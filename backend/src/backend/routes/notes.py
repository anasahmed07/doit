from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlmodel import Session
from typing import List, Optional
from backend.core.database import get_session
from backend.core.security import get_current_user
from backend.models.user import User
from backend.models.note import Note
from backend.services.note_service import NoteService
import uuid
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# Pydantic models
class NoteCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[uuid.UUID] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category_id: Optional[uuid.UUID] = None
    order_index: Optional[float] = None

class MediaAssetRead(BaseModel):
    id: uuid.UUID
    mime_type: str
    url: str  # Constructed URL to fetch blob

class NoteRead(BaseModel):
    id: uuid.UUID
    title: Optional[str] = None
    content: Optional[str]
    category_id: Optional[uuid.UUID]
    order_index: float
    created_at: datetime
    updated_at: datetime
    media_assets: List[MediaAssetRead] = []

@router.get("/", response_model=List[NoteRead])
def read_notes(
    category_id: Optional[uuid.UUID] = None,
    uncategorized: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    notes = service.get_notes(current_user.id, category_id, uncategorized_only=uncategorized or False)
    
    # Transform to Read model with media URLs
    result = []
    for note in notes:
        assets = []
        for asset in note.media_assets:
            assets.append(MediaAssetRead(
                id=asset.id,
                mime_type=asset.mime_type,
                url=f"/api/v1/notes/media/{asset.id}"
            ))
        
        result.append(NoteRead(
            id=note.id,
            title=note.title,
            content=note.content,
            category_id=note.category_id,
            order_index=note.order_index,
            created_at=note.created_at,
            updated_at=note.updated_at,
            media_assets=assets
        ))
    return result

@router.post("/", response_model=NoteRead)
def create_note(
    note_in: NoteCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    note = Note(
        user_id=current_user.id,
        title=note_in.title,
        content=note_in.content,
        category_id=note_in.category_id
    )
    created_note = service.create_note(note)
    return NoteRead(
        id=created_note.id,
        title=created_note.title,
        content=created_note.content,
        category_id=created_note.category_id,
        order_index=created_note.order_index,
        created_at=created_note.created_at,
        updated_at=created_note.updated_at,
        media_assets=[]
    )

class NoteReorder(BaseModel):
    note_ids: List[uuid.UUID]

@router.post("/reorder")
def reorder_notes(
    reorder_in: NoteReorder,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    # Verify and update order for each note
    for index, note_id in enumerate(reorder_in.note_ids):
        note = service.get_note_by_id(note_id)
        if note and note.user_id == current_user.id:
            note.order_index = float(index)
            session.add(note)
    
    session.commit()
    return {"ok": True}

@router.patch("/{note_id}", response_model=NoteRead)
def update_note(
    note_id: uuid.UUID,
    note_in: NoteUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    # Verification of ownership is implicitly handled by service or we should check it here
    # Service get_note_by_id doesn't check user_id, so we must check it
    existing_note = service.get_note_by_id(note_id)
    if not existing_note or existing_note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")

    if note_in.order_index is not None:
        service.update_note_order(note_id, note_in.order_index)
    
    updated_note = service.update_note(note_id, title=note_in.title, content=note_in.content, category_id=note_in.category_id)
    
    # Refetch relationships
    session.refresh(updated_note)
    
    assets = []
    for asset in updated_note.media_assets:
        assets.append(MediaAssetRead(
            id=asset.id,
            mime_type=asset.mime_type,
            url=f"/api/v1/notes/media/{asset.id}"
        ))

    return NoteRead(
        id=updated_note.id,
        title=updated_note.title,
        content=updated_note.content,
        category_id=updated_note.category_id,
        order_index=updated_note.order_index,
        created_at=updated_note.created_at,
        updated_at=updated_note.updated_at,
        media_assets=assets
    )

@router.delete("/{note_id}")
def delete_note(
    note_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    existing_note = service.get_note_by_id(note_id)
    if not existing_note or existing_note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
        
    service.delete_note(note_id)
    return {"ok": True}

@router.post("/{note_id}/media", response_model=MediaAssetRead)
async def upload_media(
    note_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    existing_note = service.get_note_by_id(note_id)
    if not existing_note or existing_note.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Note not found")
    
    content = await file.read()
    asset = service.create_media_asset(note_id, file.content_type, content)
    
    return MediaAssetRead(
        id=asset.id,
        mime_type=asset.mime_type,
        url=f"/api/v1/notes/media/{asset.id}"
    )

@router.get("/media/{asset_id}")
def get_media(
    asset_id: uuid.UUID,
    session: Session = Depends(get_session)
    # Media is generally accessible if you have the ID, or we can add auth check.
    # For simplicity/performance of <img> tags, often left open or cookie-based.
    # Since we use Better Auth cookie, we can add current_user dependency if strict privacy needed.
    # For now, let's assume if they have the link they can see it, but technically we could check ownership via Note.
):
    service = NoteService(session)
    asset = service.get_media_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    return Response(content=asset.data, media_type=asset.mime_type)

@router.delete("/media/{asset_id}")
def delete_media(
    asset_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    service = NoteService(session)
    asset = service.get_media_asset(asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Check ownership via the associated note
    note = service.get_note_by_id(asset.note_id)
    if not note or note.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this asset")
    
    service.delete_media_asset(asset_id)
    return {"ok": True}
