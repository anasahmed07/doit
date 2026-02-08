import uuid
from typing import Optional

from fastmcp import Context
from sqlalchemy import select

from mcp_service.database import async_session_factory
from mcp_service.models.category import Category


async def _get_user_id(ctx: Context) -> uuid.UUID:
    """Extract user_id from FastMCP context state."""
    user_id = ctx.get_state("user_id")
    if not user_id:
        raise ValueError("Not authenticated")
    return uuid.UUID(user_id) if isinstance(user_id, str) else user_id


async def list_categories(
    ctx: Context = None,
) -> str:
    """List all note categories for the user."""
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Category)
            .where(Category.user_id == user_id)
            .order_by(Category.name)
        )
        categories = result.scalars().all()

    if not categories:
        return "No categories found. Use create_category to create one."

    lines = [f"**Your Categories** ({len(categories)} total):\n"]
    for c in categories:
        lines.append(f"- 🏷️ **{c.name}** ({c.color})")

    return "\n".join(lines)


async def create_category(
    name: str,
    color: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Create a new note category.

    Args:
        name: Category name
        color: Hex color code (e.g., "#4CAF50" for green). Defaults to "#000000".
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        # Check if name already exists
        result = await db.execute(
            select(Category).where(
                Category.user_id == user_id,
                Category.name.ilike(name),
            )
        )
        if result.scalar_one_or_none():
            return f"A category named '{name}' already exists."

        category = Category(
            user_id=user_id,
            name=name,
            color=color or "#000000",
        )
        db.add(category)
        await db.commit()
        await db.refresh(category)

    return f"✅ Category created:\n- 🏷️ **{name}** ({category.color})"


async def delete_category(
    category_name: str,
    ctx: Context = None,
) -> str:
    """Delete a note category. Notes in this category will become uncategorized.

    Args:
        category_name: Category name to delete
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Category).where(
                Category.user_id == user_id,
                Category.name.ilike(f"%{category_name}%"),
            )
        )
        categories = result.scalars().all()

        if not categories:
            return f"❌ No category found matching '{category_name}'."
        if len(categories) > 1:
            matches = "\n".join(f"- {c.name}" for c in categories)
            return f"Multiple categories match '{category_name}':\n{matches}\nPlease be more specific."

        category = categories[0]
        cat_name = category.name
        await db.delete(category)
        await db.commit()

    return f"🗑️ Category deleted:\n- ~~{cat_name}~~"
