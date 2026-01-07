"""CLI command implementations."""

from typing import Annotated

import typer
from rich.console import Console
from rich.table import Table

from doit.models.exceptions import DoitError, TaskNotFoundError, ValidationError
from doit.services.task_service import TaskService
from doit.storage.memory import MemoryStorage

# Global storage and service instances (in-memory for session)
_storage = MemoryStorage()
_service = TaskService(_storage)

console = Console(legacy_windows=True, force_terminal=True)
err_console = Console(stderr=True, legacy_windows=True, force_terminal=True)

# Use ASCII symbols for Windows compatibility
CHECK = "[x]"
PENDING = "[ ]"


def add_task(
    title: Annotated[str, typer.Argument(help="Task title")],
    description: Annotated[
        str | None, typer.Option("--description", "-d", help="Task description")
    ] = None,
) -> None:
    """Create a new task with a title and optional description."""
    try:
        task = _service.create_task(title, description or "")
        console.print("\n[green][OK][/green] Task created successfully\n")
        console.print(f"  ID: {task.id}")
        console.print(f"  Title: {task.title}")
        if task.description:
            console.print(f"  Description: {task.description}")
        console.print(f"  Status: [yellow]{PENDING} Pending[/yellow]\n")
    except ValidationError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        err_console.print("[dim]Try providing a descriptive title like:[/dim]")
        err_console.print('[dim]  doit add "Buy groceries"[/dim]\n')
        raise typer.Exit(1) from e
    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e


def list_tasks(
    all_tasks: Annotated[bool, typer.Option("--all", "-a", help="Show all tasks")] = True,
    pending: Annotated[
        bool, typer.Option("--pending", "-p", help="Show only pending tasks")
    ] = False,
    completed: Annotated[
        bool, typer.Option("--completed", "-c", help="Show only completed tasks")
    ] = False,
) -> None:
    """Display all tasks in a formatted table."""
    try:
        tasks = _service.get_all_tasks()

        # Filter by status if requested
        if pending:
            tasks = [t for t in tasks if not t.completed]
        elif completed:
            tasks = [t for t in tasks if t.completed]

        if not tasks:
            console.print("\n[dim]Your todo list is empty![/dim]\n")
            console.print("[dim]Add your first task:[/dim]")
            console.print('[dim]  doit add "Your task here"[/dim]\n')
            return

        # Determine title based on filter
        if pending:
            title = f"Pending Tasks ({len(tasks)} tasks)"
        elif completed:
            title = f"Completed Tasks ({len(tasks)} tasks)"
        else:
            title = f"Todo List ({len(tasks)} tasks)"

        console.print(f"\n{title}\n")

        # Create Rich table with safe box style for Windows
        table = Table(show_header=True, header_style="bold cyan", box=None, show_lines=False)
        table.add_column("ID", style="dim")
        table.add_column("Title")
        table.add_column("Description", style="dim")
        table.add_column("Status")

        for task in tasks:
            status = (
                f"[green]{CHECK} Done[/green]"
                if task.completed
                else f"[yellow]{PENDING} Pending[/yellow]"
            )
            table.add_row(
                str(task.id),
                task.title,
                task.description or "",
                status,
            )

        console.print(table)
        console.print()

    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e


def complete_task(
    task_id: Annotated[int, typer.Argument(help="ID of the task to complete")],
) -> None:
    """Mark a task as complete."""
    try:
        task = _service.complete_task(task_id)
        console.print(f"\n[green][OK][/green] Task {task_id} marked as complete\n")
        console.print(f"  Title: {task.title}")
        console.print(f"  Status: [green]{CHECK} Done[/green]\n")
    except TaskNotFoundError:
        err_console.print(f"\n[red]Error:[/red] Task {task_id} not found\n", style="bold")
        err_console.print("[dim]Use 'doit list' to see all tasks and their IDs.[/dim]\n")
        raise typer.Exit(1) from None
    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e


def uncomplete_task(
    task_id: Annotated[int, typer.Argument(help="ID of the task to mark as incomplete")],
) -> None:
    """Mark a completed task as incomplete (reopen)."""
    try:
        task = _service.uncomplete_task(task_id)
        console.print(f"\n[green][OK][/green] Task {task_id} marked as incomplete\n")
        console.print(f"  Title: {task.title}")
        console.print(f"  Status: [yellow]{PENDING} Pending[/yellow]\n")
    except TaskNotFoundError:
        err_console.print(f"\n[red]Error:[/red] Task {task_id} not found\n", style="bold")
        err_console.print("[dim]Use 'doit list' to see all tasks and their IDs.[/dim]\n")
        raise typer.Exit(1) from None
    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e


def update_task(
    task_id: Annotated[int, typer.Argument(help="ID of the task to update")],
    title: Annotated[str | None, typer.Option("--title", "-t", help="New task title")] = None,
    description: Annotated[
        str | None, typer.Option("--description", "-d", help="New task description")
    ] = None,
) -> None:
    """Modify the title and/or description of an existing task."""
    if title is None and description is None:
        err_console.print("\n[red]Error:[/red] No changes specified\n", style="bold")
        err_console.print("[dim]Provide at least one of:[/dim]")
        err_console.print('[dim]  --title "New title"[/dim]')
        err_console.print('[dim]  --description "New description"[/dim]\n')
        raise typer.Exit(1)

    try:
        task = _service.update_task(task_id, title=title, description=description)
        console.print("\n[green][OK][/green] Task updated successfully\n")
        console.print(f"  ID: {task.id}")
        console.print(f"  Title: {task.title}")
        console.print(f"  Description: {task.description}")
        status = (
            f"[green]{CHECK} Done[/green]"
            if task.completed
            else f"[yellow]{PENDING} Pending[/yellow]"
        )
        console.print(f"  Status: {status}\n")
    except TaskNotFoundError:
        err_console.print(f"\n[red]Error:[/red] Task {task_id} not found\n", style="bold")
        err_console.print("[dim]Use 'doit list' to see all tasks and their IDs.[/dim]\n")
        raise typer.Exit(1) from None
    except ValidationError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        err_console.print("[dim]Provide a non-empty title:[/dim]")
        err_console.print(f'[dim]  doit update {task_id} --title "Buy groceries"[/dim]\n')
        raise typer.Exit(1) from e
    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e


def delete_task(task_id: Annotated[int, typer.Argument(help="ID of the task to delete")]) -> None:
    """Remove a task from the list."""
    try:
        task = _service.get_task(task_id)
        _service.delete_task(task_id)
        console.print(f"\n[green][OK][/green] Task {task_id} deleted successfully\n")
        console.print(f"  Title: {task.title}\n")
    except TaskNotFoundError:
        err_console.print(f"\n[red]Error:[/red] Task {task_id} not found\n", style="bold")
        err_console.print("[dim]Use 'doit list' to see all tasks and their IDs.[/dim]\n")
        raise typer.Exit(1) from None
    except DoitError as e:
        err_console.print(f"\n[red]Error:[/red] {e}\n", style="bold")
        raise typer.Exit(1) from e
