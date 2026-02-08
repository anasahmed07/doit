import uuid
from datetime import datetime
from typing import Optional

from fastmcp import Context
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from mcp_service.database import async_session_factory
from mcp_service.models.project import Project, ProjectTask, ProjectMember


async def _get_user_id(ctx: Context) -> uuid.UUID:
    """Extract user_id from FastMCP context state."""
    user_id = ctx.get_state("user_id")
    if not user_id:
        raise ValueError("Not authenticated")
    return uuid.UUID(user_id) if isinstance(user_id, str) else user_id


async def _find_project(
    db, user_id: uuid.UUID, project_name: Optional[str] = None
) -> Project:
    """Find a project by name, or return the user's default (first) project.
    Creates a default project if user has none.
    """
    if project_name:
        # Search by name among owned projects
        result = await db.execute(
            select(Project).where(
                Project.user_id == user_id,
                Project.name == project_name,
            )
        )
        project = result.scalar_one_or_none()
        if not project:
            # Also check projects the user is a member of
            result = await db.execute(
                select(Project)
                .join(ProjectMember)
                .where(
                    ProjectMember.user_id == user_id,
                    Project.name == project_name,
                )
            )
            project = result.scalar_one_or_none()
        if not project:
            raise ValueError(f"Project '{project_name}' not found. Use list_projects to see available projects.")
        return project

    # Default project: first owned project
    result = await db.execute(
        select(Project)
        .where(Project.user_id == user_id)
        .order_by(Project.created_at)
        .limit(1)
    )
    project = result.scalar_one_or_none()

    if not project:
        # Create default project
        project = Project(user_id=user_id, name="My Tasks")
        db.add(project)
        # Also add user as owner member
        member = ProjectMember(
            project_id=project.id, user_id=user_id, role="owner"
        )
        db.add(member)
        await db.commit()
        await db.refresh(project)

    return project


async def list_tasks(
    project_name: Optional[str] = None,
    status: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """List all tasks in a project, optionally filtered by status.

    Args:
        project_name: Project name. Defaults to the user's default project.
        status: Filter by status - "TODO", "IN_PROGRESS", "DONE"
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        project = await _find_project(db, user_id, project_name)

        query = select(ProjectTask).where(ProjectTask.project_id == project.id)
        if status:
            query = query.where(ProjectTask.status == status.upper())
        query = query.order_by(ProjectTask.order_index)

        result = await db.execute(query)
        tasks = result.scalars().all()

    if not tasks:
        filter_msg = f" with status {status.upper()}" if status else ""
        return f"No tasks found in project '{project.name}'{filter_msg}."

    lines = [f"**Tasks in '{project.name}'** ({len(tasks)} total):\n"]
    for t in tasks:
        priority_icon = {"HIGH": "🔴", "MEDIUM": "🟡", "LOW": "🟢"}.get(t.priority, "⚪")
        status_icon = {"TODO": "⬜", "IN_PROGRESS": "🔄", "DONE": "✅"}.get(t.status, "⬜")
        due = f" | Due: {t.due_date.strftime('%Y-%m-%d')}" if t.due_date else ""
        lines.append(f"- {status_icon} {priority_icon} **{t.content}** [{t.status}]{due}")

    return "\n".join(lines)


async def create_task(
    content: str,
    project_name: Optional[str] = None,
    priority: str = "MEDIUM",
    due_date: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Create a new task in a project.

    Args:
        content: Task description
        project_name: Project name. Defaults to the user's default project.
        priority: "LOW", "MEDIUM", or "HIGH". Default "MEDIUM".
        due_date: Due date in ISO format (YYYY-MM-DD)
    """
    user_id = await _get_user_id(ctx)
    priority = priority.upper()
    if priority not in ("LOW", "MEDIUM", "HIGH"):
        priority = "MEDIUM"

    parsed_due_date = None
    if due_date:
        try:
            parsed_due_date = datetime.fromisoformat(due_date)
        except ValueError:
            pass  # Let the LLM handle date parsing

    async with async_session_factory() as db:
        project = await _find_project(db, user_id, project_name)

        # Get max order_index for the project
        result = await db.execute(
            select(ProjectTask.order_index)
            .where(ProjectTask.project_id == project.id)
            .order_by(ProjectTask.order_index.desc())
            .limit(1)
        )
        max_order = result.scalar_one_or_none() or 0.0

        task = ProjectTask(
            project_id=project.id,
            content=content,
            priority=priority,
            due_date=parsed_due_date,
            order_index=max_order + 1.0,
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

    due_msg = f" | Due: {parsed_due_date.strftime('%Y-%m-%d')}" if parsed_due_date else ""
    return f"✅ Task created in '{project.name}':\n- **{content}** [{priority} priority]{due_msg}"


async def update_task(
    task_content: str,
    project_name: Optional[str] = None,
    status: Optional[str] = None,
    new_content: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Update an existing task's status, content, priority, or due date.

    Args:
        task_content: Current task content to identify the task
        project_name: Project name to narrow search
        status: New status - "TODO", "IN_PROGRESS", "DONE"
        new_content: New task content/description
        priority: New priority - "LOW", "MEDIUM", "HIGH"
        due_date: New due date in ISO format (YYYY-MM-DD)
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        project = await _find_project(db, user_id, project_name)

        # Find task by content (case-insensitive partial match)
        result = await db.execute(
            select(ProjectTask).where(
                ProjectTask.project_id == project.id,
                ProjectTask.content.ilike(f"%{task_content}%"),
            )
        )
        tasks = result.scalars().all()

        if not tasks:
            return f"❌ No task found matching '{task_content}' in project '{project.name}'."
        if len(tasks) > 1:
            matches = "\n".join(f"- {t.content}" for t in tasks)
            return f"Multiple tasks match '{task_content}':\n{matches}\nPlease be more specific."

        task = tasks[0]
        changes = []

        if status:
            task.status = status.upper()
            changes.append(f"status → {task.status}")
        if new_content:
            task.content = new_content
            changes.append(f"content → {new_content}")
        if priority:
            task.priority = priority.upper()
            changes.append(f"priority → {task.priority}")
        if due_date:
            try:
                task.due_date = datetime.fromisoformat(due_date)
                changes.append(f"due date → {due_date}")
            except ValueError:
                pass

        task.updated_at = datetime.utcnow()
        db.add(task)
        await db.commit()

    if not changes:
        return f"No changes made to '{task.content}'."

    return f"✅ Task updated in '{project.name}':\n- **{task.content}**: {', '.join(changes)}"


async def delete_task(
    task_content: str,
    project_name: Optional[str] = None,
    ctx: Context = None,
) -> str:
    """Delete a task.

    Args:
        task_content: Task content to identify the task
        project_name: Project name to narrow search
    """
    user_id = await _get_user_id(ctx)

    async with async_session_factory() as db:
        project = await _find_project(db, user_id, project_name)

        result = await db.execute(
            select(ProjectTask).where(
                ProjectTask.project_id == project.id,
                ProjectTask.content.ilike(f"%{task_content}%"),
            )
        )
        tasks = result.scalars().all()

        if not tasks:
            return f"❌ No task found matching '{task_content}' in project '{project.name}'."
        if len(tasks) > 1:
            matches = "\n".join(f"- {t.content}" for t in tasks)
            return f"Multiple tasks match '{task_content}':\n{matches}\nPlease be more specific."

        task = tasks[0]
        task_name = task.content
        await db.delete(task)
        await db.commit()

    return f"🗑️ Task deleted from '{project.name}':\n- ~~{task_name}~~"
