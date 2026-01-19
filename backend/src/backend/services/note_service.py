from sqlmodel import Session, select
from typing import List, Optional
import uuid
from backend.models.note import Note, MediaAsset
from datetime import datetime

class NoteService:
    def __init__(self, session: Session):
        self.session = session

    def get_notes(self, user_id: uuid.UUID, category_id: Optional[uuid.UUID] = None) -> List[Note]:
        statement = select(Note).where(Note.user_id == user_id)
        if category_id:
            statement = statement.where(Note.category_id == category_id)
        # Order by index, then created_at
        statement = statement.order_by(Note.order_index, Note.created_at.desc())
        results = self.session.exec(statement)
        return results.all()

    def create_note(self, note: Note) -> Note:
        # Auto-calculate order_index if not provided (add to top or bottom)
        # For now, let's just add it. Reordering logic will handle indexes.
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return note

    def get_note_by_id(self, note_id: uuid.UUID) -> Optional[Note]:
        return self.session.get(Note, note_id)

    def update_note(self, note_id: uuid.UUID, content: Optional[str] = None, category_id: Optional[uuid.UUID] = None) -> Optional[Note]:
        note = self.session.get(Note, note_id)
        if not note:
            return None
        
        if content is not None:
            note.content = content
        if category_id is not None:
            note.category_id = category_id
            
        note.updated_at = datetime.utcnow()
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return note

    def delete_note(self, note_id: uuid.UUID) -> bool:
        note = self.session.get(Note, note_id)
        if not note:
            return False
        self.session.delete(note)
        self.session.commit()
        return True

    def create_media_asset(self, note_id: uuid.UUID, mime_type: str, data: bytes) -> MediaAsset:
        asset = MediaAsset(note_id=note_id, mime_type=mime_type, data=data)
        self.session.add(asset)
        self.session.commit()
        self.session.refresh(asset)
        return asset

    def get_media_asset(self, asset_id: uuid.UUID) -> Optional[MediaAsset]:
        return self.session.get(MediaAsset, asset_id)
    
    def update_note_order(self, note_id: uuid.UUID, new_index: float) -> Optional[Note]:
        note = self.session.get(Note, note_id)
        if not note:
            return None
        note.order_index = new_index
        self.session.add(note)
        self.session.commit()
        self.session.refresh(note)
        return note
