import uuid

from fastmcp import Context
from sqlalchemy import select, func

from mcp_service.database import async_session_factory
from mcp_service.models.project import Project, ProjectTask, ProjectMember
from mcp_service.models.note import Note
from mcp_service.models.category import Category


async def _get_user_id(ctx: Context) -> uuid.UUID:
    """Extract user_id from FastMCP context state."""
    user_id = ctx.get_state("user_id")
    if not user_id:
        raise ValueError("Not authenticated")
    return uuid.UUID(user_id) if isinstance(user_id, str) else user_id


async def get_dashboard_summary(
    ctx: Context = None,
) -> str:
    """Get a productivity dashboard summary with counts of projects, tasks, notes, and categories."""
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        # Count projects (owned)
        result = await db.execute(
            select(func.count(Project.id)).where(Project.user_id == user_id)
        )
        project_count = result.scalar() or 0

        # Get all project IDs for the user (owned + member)
        result = await db.execute(
            select(Project.id).where(Project.user_id == user_id)
        )
        owned_ids = [r[0] for r in result.all()]

        result = await db.execute(
            select(ProjectMember.project_id).where(
                ProjectMember.user_id == user_id,
            )
        )
        member_ids = [r[0] for r in result.all()]
        all_project_ids = list(set(owned_ids + member_ids))

        # Task counts by status
        todo_count = 0
        in_progress_count = 0
        done_count = 0
        if all_project_ids:
            result = await db.execute(
                select(ProjectTask.status, func.count(ProjectTask.id))
                .where(ProjectTask.project_id.in_(all_project_ids))
                .group_by(ProjectTask.status)
            )
            for status, count in result.all():
                if status == "TODO":
                    todo_count = count
                elif status == "IN_PROGRESS":
                    in_progress_count = count
                elif status == "DONE":
                    done_count = count

        total_tasks = todo_count + in_progress_count + done_count

        # Count notes
        result = await db.execute(
            select(func.count(Note.id)).where(Note.user_id == user_id)
        )
        note_count = result.scalar() or 0

        # Count categories
        result = await db.execute(
            select(func.count(Category.id)).where(Category.user_id == user_id)
        )
        category_count = result.scalar() or 0

    lines = [
        "**📊 Dashboard Summary**\n",
        f"📂 **Projects**: {project_count}",
        f"📋 **Tasks**: {total_tasks} total",
        f"   ⬜ To Do: {todo_count}",
        f"   🔄 In Progress: {in_progress_count}",
        f"   ✅ Done: {done_count}",
        f"📝 **Notes**: {note_count}",
        f"🏷️ **Categories**: {category_count}",
    ]

    # Add completion rate if there are tasks
    if total_tasks > 0:
        completion_pct = round((done_count / total_tasks) * 100)
        lines.append(f"\n**Completion Rate**: {completion_pct}%")

    return "\n".join(lines)
