import uuid
from datetime import datetime
from typing import Optional

from fastmcp import Context
from sqlalchemy import select

from mcp_service.database import async_session_factory
from mcp_service.models.note import Note
from mcp_service.models.category import Category


async def _get_user_id(ctx: Context) -> uuid.UUID:
    """Extract user_id from FastMCP context state."""
    user_id = ctx.get_state("user_id")
    if not user_id:
        raise ValueError("Not authenticated")
    return uuid.UUID(user_id) if isinstance(user_id, str) else user_id


async def list_notes(
    category_name: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """List all notes, optionally filtered by category.

    Args:
        category_name: Filter by category name (case-insensitive)
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        query = select(Note).where(Note.user_id == user_id)

        if category_name:
            # Find category by name
            cat_result = await db.execute(
                select(Category).where(
                    Category.user_id == user_id,
                    Category.name.ilike(f"%{category_name}%"),
                )
            )
            category = cat_result.scalar_one_or_none()
            if not category:
                return f"No category found matching '{category_name}'. Use list_categories to see available categories."
            query = query.where(Note.category_id == category.id)

        query = query.order_by(Note.updated_at.desc())
        result = await db.execute(query)
        notes = result.scalars().all()

        # Load category names for display
        cat_ids = {n.category_id for n in notes if n.category_id}
        categories = {}
        if cat_ids:
            cat_result = await db.execute(
                select(Category).where(Category.id.in_(cat_ids))
            )
            categories = {c.id: c.name for c in cat_result.scalars().all()}

    if not notes:
        filter_msg = f" in category '{category_name}'" if category_name else ""
        return f"No notes found{filter_msg}."

    lines = [f"**Your Notes** ({len(notes)} total):\n"]
    for n in notes:
        title = n.title or "Untitled"
        preview = (n.content or "")[:80]
        if len(n.content or "") > 80:
            preview += "..."
        cat_label = f" | 📁 {categories[n.category_id]}" if n.category_id and n.category_id in categories else ""
        lines.append(f"- 📝 **{title}**{cat_label}\n  {preview}")

    return "\n".join(lines)


async def create_note(
    title: Optional[str] = None,
    content: Optional[str] = None,
    category_name: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Create a new note with optional title, content, and category.

    Args:
        title: Note title
        content: Note content/body text
        category_name: Category name to assign (case-insensitive)
    """
    user_id = await _get_user_id(ctx)

    if not title and not content:
        return "Please provide at least a title or content for the note."

    category_id = None
    cat_display = ""

    async with async_session_factory() as db:
        if category_name:
            cat_result = await db.execute(
                select(Category).where(
                    Category.user_id == user_id,
                    Category.name.ilike(f"%{category_name}%"),
                )
            )
            category = cat_result.scalar_one_or_none()
            if category:
                category_id = category.id
                cat_display = f" | 📁 {category.name}"
            else:
                cat_display = f" (category '{category_name}' not found, created without category)"

        note = Note(
            user_id=user_id,
            title=title,
            content=content,
            category_id=category_id,
        )
        db.add(note)
        await db.commit()
        await db.refresh(note)

    title_display = title or "Untitled"
    return f"✅ Note created:\n- 📝 **{title_display}**{cat_display}"


async def update_note(
    note_title: str,
    new_title: Optional[str] = None,
    new_content: Optional[str] = None,
    category_name: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Update an existing note's title, content, or category.

    Args:
        note_title: Current note title to identify the note
        new_title: New title for the note
        new_content: New content/body text
        category_name: New category name (case-insensitive)
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Note).where(
                Note.user_id == user_id,
                Note.title.ilike(f"%{note_title}%"),
            )
        )
        notes = result.scalars().all()

        if not notes:
            return f"❌ No note found matching '{note_title}'."
        if len(notes) > 1:
            matches = "\n".join(f"- {n.title or 'Untitled'}" for n in notes)
            return f"Multiple notes match '{note_title}':\n{matches}\nPlease be more specific."

        note = notes[0]
        changes = []

        if new_title:
            note.title = new_title
            changes.append(f"title → {new_title}")
        if new_content:
            note.content = new_content
            changes.append("content updated")
        if category_name:
            cat_result = await db.execute(
                select(Category).where(
                    Category.user_id == user_id,
                    Category.name.ilike(f"%{category_name}%"),
                )
            )
            category = cat_result.scalar_one_or_none()
            if category:
                note.category_id = category.id
                changes.append(f"category → {category.name}")
            else:
                changes.append(f"category '{category_name}' not found")

        note.updated_at = datetime.utcnow()
        db.add(note)
        await db.commit()

    if not changes:
        return f"No changes made to '{note.title or 'Untitled'}'."

    return f"✅ Note updated:\n- 📝 **{note.title or 'Untitled'}**: {', '.join(changes)}"


async def delete_note(
    note_title: str,
    ctx: Context = None,
) -> str:
    """Delete a note by title.

    Args:
        note_title: Note title to identify the note
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Note).where(
                Note.user_id == user_id,
                Note.title.ilike(f"%{note_title}%"),
            )
        )
        notes = result.scalars().all()

        if not notes:
            return f"❌ No note found matching '{note_title}'."
        if len(notes) > 1:
            matches = "\n".join(f"- {n.title or 'Untitled'}" for n in notes)
            return f"Multiple notes match '{note_title}':\n{matches}\nPlease be more specific."

        note = notes[0]
        title = note.title or "Untitled"
        await db.delete(note)
        await db.commit()

    return f"🗑️ Note deleted:\n- ~~{title}~~"
