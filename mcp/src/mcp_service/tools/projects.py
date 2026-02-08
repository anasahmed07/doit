import uuid
from typing import Optional

from fastmcp import Context
from sqlalchemy import select, func

from mcp_service.database import async_session_factory
from mcp_service.models.project import Project, ProjectTask, ProjectMember


async def _get_user_id(ctx: Context) -> uuid.UUID:
    """Extract user_id from FastMCP context state."""
    user_id = ctx.get_state("user_id")
    if not user_id:
        raise ValueError("Not authenticated")
    return uuid.UUID(user_id) if isinstance(user_id, str) else user_id


async def list_projects(
    ctx: Context = None,
) -> str:
    """List all projects the user owns or is a member of, with task count breakdown."""
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        # Get owned projects
        result = await db.execute(
            select(Project).where(Project.user_id == user_id)
        )
        owned = list(result.scalars().all())

        # Get projects user is a member of (but doesn't own)
        result = await db.execute(
            select(Project)
            .join(ProjectMember)
            .where(
                ProjectMember.user_id == user_id,
                Project.user_id != user_id,
            )
        )
        member_of = list(result.scalars().all())

        all_projects = owned + member_of
        if not all_projects:
            return "No projects found. Use create_project to create one."

        lines = [f"**Your Projects** ({len(all_projects)} total):\n"]

        for p in all_projects:
            # Get task counts per status
            result = await db.execute(
                select(ProjectTask.status, func.count(ProjectTask.id))
                .where(ProjectTask.project_id == p.id)
                .group_by(ProjectTask.status)
            )
            status_counts = dict(result.all())
            todo = status_counts.get("TODO", 0)
            in_progress = status_counts.get("IN_PROGRESS", 0)
            done = status_counts.get("DONE", 0)
            total = todo + in_progress + done

            owner_tag = "" if p.user_id == user_id else " (member)"
            lines.append(
                f"- 📂 **{p.name}**{owner_tag} — {total} tasks "
                f"(⬜ {todo} | 🔄 {in_progress} | ✅ {done})"
            )

    return "\n".join(lines)


async def create_project(
    name: str,
    ctx: Context = None,
) -> str:
    """Create a new project.

    Args:
        name: Project name
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        # Check if name already exists
        result = await db.execute(
            select(Project).where(
                Project.user_id == user_id,
                Project.name == name,
            )
        )
        if result.scalar_one_or_none():
            return f"A project named '{name}' already exists."

        project = Project(user_id=user_id, name=name)
        db.add(project)
        await db.flush()

        member = ProjectMember(
            project_id=project.id, user_id=user_id, role="owner"
        )
        db.add(member)
        await db.commit()
        await db.refresh(project)

    return f"✅ Project created:\n- 📂 **{name}**"


async def update_project(
    project_name: str,
    new_name: str,
    ctx: Context = None,
) -> str:
    """Rename an existing project.

    Args:
        project_name: Current project name
        new_name: New name for the project
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        result = await db.execute(
            select(Project).where(
                Project.user_id == user_id,
                Project.name.ilike(f"%{project_name}%"),
            )
        )
        projects = result.scalars().all()

        if not projects:
            return f"❌ No project found matching '{project_name}'."
        if len(projects) > 1:
            matches = "\n".join(f"- {p.name}" for p in projects)
            return f"Multiple projects match '{project_name}':\n{matches}\nPlease be more specific."

        project = projects[0]
        old_name = project.name
        project.name = new_name
        db.add(project)
        await db.commit()

    return f"✅ Project renamed:\n- 📂 ~~{old_name}~~ → **{new_name}**"
