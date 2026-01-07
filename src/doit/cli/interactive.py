"""Interactive TUI mode for DoIt task manager."""

import os
import sys

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

from doit.models.exceptions import DoitError, TaskNotFoundError, ValidationError
from doit.services.task_service import TaskService
from doit.storage.memory import MemoryStorage

console = Console()


def clear_screen() -> None:
    """Clear the terminal screen."""
    os.system("cls" if os.name == "nt" else "clear")


def display_header() -> None:
    """Display application header."""
    console.print(
        Panel.fit("[bold cyan]DoIt - Interactive Task Manager[/bold cyan]", border_style="cyan")
    )
    console.print()


def display_menu() -> None:
    """Display main menu options."""
    menu = """
    [bold cyan]Commands:[/bold cyan]
    [green]1[/green] - Add new task
    [green]2[/green] - List all tasks
    [green]3[/green] - Complete task
    [green]4[/green] - Uncomplete task
    [green]5[/green] - Update task
    [green]6[/green] - Delete task
    [yellow]h[/yellow] - Help
    [red]q[/red] - Quit
    """
    console.print(Panel(menu, border_style="blue"))


def display_tasks(service: TaskService, filter_type: str | None = None) -> None:
    """Display tasks in a table."""
    tasks = service.get_all_tasks()

    if filter_type == "pending":
        tasks = [t for t in tasks if not t.completed]
    elif filter_type == "completed":
        tasks = [t for t in tasks if t.completed]

    if not tasks:
        console.print("\n[dim]Your todo list is empty![/dim]\n")
        return

    title = "All Tasks" if not filter_type else f"{filter_type.title()} Tasks"
    console.print(f"\n[bold]{title}[/bold] ({len(tasks)} tasks)\n")

    table = Table(show_header=True, header_style="bold cyan", box=None)
    table.add_column("ID", style="dim")
    table.add_column("Title")
    table.add_column("Description", style="dim")
    table.add_column("Status")

    for task in tasks:
        status = "[green]Done[/green]" if task.completed else "[yellow]Pending[/yellow]"
        table.add_row(
            str(task.id),
            task.title,
            task.description or "",
            status,
        )

    console.print(table)
    console.print()


def add_task_interactive(service: TaskService) -> None:
    """Add a new task interactively."""
    console.print("\n[bold cyan]Add New Task[/bold cyan]\n")

    title = console.input("[green]Title:[/green] ")
    if not title.strip():
        console.print("[red]Error:[/red] Title cannot be empty\n")
        return

    description = console.input("[green]Description (optional):[/green] ")

    try:
        task = service.create_task(title, description)
        console.print(f"\n[green]✓[/green] Task created successfully (ID: {task.id})\n")
    except ValidationError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")
    except DoitError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")


def complete_task_interactive(service: TaskService) -> None:
    """Mark a task as complete interactively."""
    console.print("\n[bold cyan]Complete Task[/bold cyan]\n")

    task_id_str = console.input("[green]Task ID:[/green] ")
    try:
        task_id = int(task_id_str)
        service.complete_task(task_id)
        console.print(f"\n[green]✓[/green] Task {task_id} marked as complete\n")
    except ValueError:
        console.print("\n[red]Error:[/red] Invalid task ID\n")
    except TaskNotFoundError:
        console.print("\n[red]Error:[/red] Task not found\n")
    except DoitError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")


def uncomplete_task_interactive(service: TaskService) -> None:
    """Mark a task as incomplete interactively."""
    console.print("\n[bold cyan]Uncomplete Task[/bold cyan]\n")

    task_id_str = console.input("[green]Task ID:[/green] ")
    try:
        task_id = int(task_id_str)
        service.uncomplete_task(task_id)
        console.print(f"\n[green]✓[/green] Task {task_id} marked as incomplete\n")
    except ValueError:
        console.print("\n[red]Error:[/red] Invalid task ID\n")
    except TaskNotFoundError:
        console.print("\n[red]Error:[/red] Task not found\n")
    except DoitError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")


def update_task_interactive(service: TaskService) -> None:
    """Update a task interactively."""
    console.print("\n[bold cyan]Update Task[/bold cyan]\n")

    task_id_str = console.input("[green]Task ID:[/green] ")
    try:
        task_id = int(task_id_str)
        task = service.get_task(task_id)

        console.print(f"\nCurrent title: {task.title}")
        new_title = console.input("[green]New title (press Enter to skip):[/green] ")

        console.print(f"Current description: {task.description}")
        new_description = console.input("[green]New description (press Enter to skip):[/green] ")

        if not new_title.strip() and not new_description.strip():
            console.print("\n[yellow]No changes made[/yellow]\n")
            return

        service.update_task(
            task_id,
            title=new_title if new_title.strip() else None,
            description=new_description if new_description.strip() else None,
        )
        console.print(f"\n[green]✓[/green] Task {task_id} updated successfully\n")
    except ValueError:
        console.print("\n[red]Error:[/red] Invalid task ID\n")
    except TaskNotFoundError:
        console.print("\n[red]Error:[/red] Task not found\n")
    except ValidationError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")
    except DoitError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")


def delete_task_interactive(service: TaskService) -> None:
    """Delete a task interactively."""
    console.print("\n[bold cyan]Delete Task[/bold cyan]\n")

    task_id_str = console.input("[green]Task ID:[/green] ")
    try:
        task_id = int(task_id_str)
        task = service.get_task(task_id)

        confirm = console.input(f'[yellow]Delete task "{task.title}"? (y/n):[/yellow] ')
        if confirm.lower() == "y":
            service.delete_task(task_id)
            console.print(f"\n[green]✓[/green] Task {task_id} deleted successfully\n")
        else:
            console.print("\n[yellow]Deletion cancelled[/yellow]\n")
    except ValueError:
        console.print("\n[red]Error:[/red] Invalid task ID\n")
    except TaskNotFoundError:
        console.print("\n[red]Error:[/red] Task not found\n")
    except DoitError as e:
        console.print(f"\n[red]Error:[/red] {e}\n")


def display_help() -> None:
    """Display help information."""
    help_text = """
    [bold cyan]DoIt Task Manager - Help[/bold cyan]

    This is an interactive task management application.
    Tasks are stored in memory and will be lost when you exit.

    [bold]Commands:[/bold]
    1. Add new task - Create a new task with title and optional description
    2. List all tasks - View all your tasks in a table
    3. Complete task - Mark a task as done
    4. Uncomplete task - Reopen a completed task
    5. Update task - Modify task title and/or description
    6. Delete task - Remove a task permanently
    h. Help - Show this help message
    q. Quit - Exit the application

    [bold]Tips:[/bold]
    - Task IDs are shown in the list view
    - Use the ID number to perform actions on specific tasks
    - Descriptions are optional when creating tasks
    """
    console.print(Panel(help_text, border_style="blue"))


def run_interactive() -> None:
    """Run the interactive task manager."""
    storage = MemoryStorage()
    service = TaskService(storage)

    clear_screen()
    display_header()
    console.print("[dim]Welcome! Type 'h' for help or 'q' to quit.[/dim]\n")

    while True:
        display_menu()
        choice = console.input("\n[bold cyan]Choose an option:[/bold cyan] ").strip().lower()

        if choice == "q":
            console.print("\n[yellow]Thank you for using DoIt! Goodbye![/yellow]\n")
            sys.exit(0)
        elif choice == "h":
            clear_screen()
            display_header()
            display_help()
        elif choice == "1":
            add_task_interactive(service)
        elif choice == "2":
            clear_screen()
            display_header()
            display_tasks(service)
        elif choice == "3":
            display_tasks(service, "pending")
            complete_task_interactive(service)
        elif choice == "4":
            display_tasks(service, "completed")
            uncomplete_task_interactive(service)
        elif choice == "5":
            display_tasks(service)
            update_task_interactive(service)
        elif choice == "6":
            display_tasks(service)
            delete_task_interactive(service)
        else:
            console.print("\n[red]Invalid option. Press 'h' for help.[/red]\n")

        console.input("\n[dim]Press Enter to continue...[/dim]")
        clear_screen()
        display_header()


if __name__ == "__main__":
    try:
        run_interactive()
    except KeyboardInterrupt:
        console.print("\n\n[yellow]Interrupted. Goodbye![/yellow]\n")
        sys.exit(0)
