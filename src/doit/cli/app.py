"""Main DoIt terminal application with Rich UI and prompt-toolkit input."""

import os
import sys
from datetime import datetime
from typing import Any

from prompt_toolkit import PromptSession
from prompt_toolkit.application import Application
from prompt_toolkit.completion import Completer, Completion
from prompt_toolkit.formatted_text import HTML, FormattedText
from prompt_toolkit.history import InMemoryHistory
from prompt_toolkit.key_binding import KeyBindings
from prompt_toolkit.layout import Layout as PTLayout
from prompt_toolkit.layout.containers import HSplit, Window
from prompt_toolkit.layout.controls import FormattedTextControl
from prompt_toolkit.styles import Style
from rich.align import Align
from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.spinner import Spinner
from rich.table import Table
from rich.text import Text

from doit.cli.models.exceptions import TaskNotFoundError, ValidationError
from doit.cli.services.task_service import TaskService
from doit.cli.storage.memory import MemoryStorage


class CommandCompleter(Completer):
    """Autocompleter for slash commands."""

    COMMANDS = {
        "/add": {
            "desc": 'Add task(s) - /add "<title>" -d "<desc>" OR /add --multi for multiple',
        },
        "/list": {
            "desc": "List all tasks - /list [all|pending|completed]",
        },
        "/complete": {
            "desc": "Toggle task status - /complete [id] (no id = toggle all)",
        },
        "/uncomplete": {
            "desc": "Mark a task as incomplete - /uncomplete <id>",
        },
        "/delete": {
            "desc": "Delete a task - /delete <id>",
        },
        "/update": {
            "desc": 'Update a task - /update <id> -t "<new title>" -d "<new description>"',
        },
        "/help": {
            "desc": "Show help",
        },
        "/clear": {
            "desc": "Clear screen",
        },
        "/quit": {
            "desc": "Exit application",
        },
        "/exit": {
            "desc": "Exit application",
        },
    }

    def get_completions(self, document: Any, complete_event: Any) -> Any:
        """Get command completions that filter as you type."""
        text = document.text
        cursor_pos = document.cursor_position

        # Only show completions if we're typing a command (starts with /)
        if not text.startswith("/"):
            return

        # Only complete if we haven't moved past the command (no space after command yet)
        # or if we're still at the beginning
        text_before_cursor = text[:cursor_pos]

        # If there's a space before cursor, we're in arguments - don't complete
        if " " in text_before_cursor and not text_before_cursor.endswith("/"):
            return

        # Get what the user has typed so far (from start to cursor, or until first space)
        if " " in text:
            current_text = text.split(" ")[0]
        else:
            current_text = text_before_cursor

        # Filter commands that start with what user has typed and sort them
        matching_commands = sorted([
            (command, info) for command, info in self.COMMANDS.items()
            if command.startswith(current_text)
        ])

        for command, info in matching_commands:
            # Insert just the command, with a trailing space for convenience
            yield Completion(
                command + " ",
                start_position=-len(current_text),
                display=command,
                display_meta=info["desc"],
            )


class DoItApp:
    """Main DoIt terminal application."""

    def __init__(self) -> None:
        """Initialize the application."""
        self.console = Console()
        self.storage = MemoryStorage()
        self.service = TaskService(self.storage)
        self.running = True
        self.last_interrupt_time = 0.0  # Track last Ctrl+C time

        # Setup prompt session with history, completion, and bottom toolbar
        self.session: PromptSession[str] = PromptSession(
            history=InMemoryHistory(),
            completer=CommandCompleter(),
            complete_while_typing=True,
            complete_in_thread=True,
            bottom_toolbar=self.get_bottom_toolbar,
            style=Style.from_dict(
                {
                    "completion-menu.completion": "bg:#1e1e1e #cccccc",
                    "completion-menu.completion.current": "bg:#ff6b35 #000000",
                    "completion-menu.meta.completion": "bg:#1e1e1e #888888",
                    "completion-menu.meta.completion.current": "bg:#ff6b35 #000000",
                    "bottom-toolbar": "bg:#1e1e1e #888888",
                    "prompt": "bold cyan",
                }
            ),
        )

    def get_bottom_toolbar(self) -> FormattedText:
        """Generate bottom toolbar with task stats."""
        tasks = self.service.get_all_tasks()
        total = len(tasks)
        pending = len([t for t in tasks if not t.completed])
        completed = len([t for t in tasks if t.completed])

        return FormattedText([
            ("", " "),
            ("bold", "Tasks: "),
            ("", f"{total}"),
            ("", " | "),
            ("class:warning", "Pending: "),
            ("class:warning", f"{pending}"),
            ("", " | "),
            ("class:success", "Completed: "),
            ("class:success", f"{completed}"),
            ("", " | "),
            ("class:info", "Type /help for commands"),
        ])

    def clear_screen(self) -> None:
        """Clear the terminal screen."""
        os.system("cls" if os.name == "nt" else "clear")

    def show_hero(self) -> None:
        """Display the hero/welcome screen with beautiful gradient DoIt logo."""
        self.clear_screen()

        # Beautiful ASCII art banner with box-drawing characters
        BANNER = """
        ██████╗   ██████╗  ██╗ ████████╗
        ██╔══██╗ ██╔═══██╗ ██║ ╚══██╔══╝
        ██║  ██║ ██║   ██║ ██║    ██║   
        ██║  ██║ ██║   ██║ ██║    ██║   
        ██║  ██║ ██║   ██║ ██║    ██║   
        ██████╔╝ ╚██████╔╝ ██║    ██║   
        ╚═════╝   ╚═════╝  ╚═╝    ╚═╝   
        """


        # Split banner into lines and apply gradient colors
        lines = BANNER.strip("\n").split("\n")

        # Color gradient: cyan -> purple -> pink
        colors = [
            "#00BFFF",            # Bright cyan
            "#00BFFF",            # Cyan
            "#5F9FFF",            # Cyan-purple
            "#7F7FFF",            # Purple
            "#9F7FFF",            # Purple
            "#BF5FFF",            # Purple-pink
            "#DF5FFF",            # Pink
            "#FF5FCF",            # Bright pink
            "magenta",            # Bottom accent
        ]

        logo = Text()
        logo.append("\n")
        for i, line in enumerate(lines):
            if i < len(colors):
                logo.append(line + "\n", style=colors[i])
            else:
                logo.append(line + "\n", style="white")

        self.console.print(logo)
        self.console.print("[dim white]Your Terminal Task Manager[/dim white]")
        self.console.print()

        # Tips section (similar to Gemini)
        self.console.print("[bold white]Tips for getting started:[/bold white]")
        self.console.print("[dim white]1. Type [/dim white][bold orange1]/add[/bold orange1][dim white] to create a new task[/dim white]")
        self.console.print("[dim white]2. Use [/dim white][bold orange1]Tab[/bold orange1][dim white] for autocomplete and command suggestions[/dim white]")
        self.console.print("[dim white]3. Type [/dim white][bold orange1]/help[/bold orange1][dim white] for all available commands[/dim white]")
        self.console.print()

        # Get terminal width for full-width boxes
        terminal_width = self.console.width

        # Stats panel (full width)
        tasks = self.service.get_all_tasks()
        total = len(tasks)
        pending = len([t for t in tasks if not t.completed])
        completed = len([t for t in tasks if t.completed])

        stats_text = f" Tasks: {total} | Pending: {pending} | Completed: {completed}"
        stats_panel = Panel(
            stats_text,
            border_style="dim white",
            width=terminal_width,
            padding=(0, 1),
        )
        self.console.print(stats_panel)
        self.console.print()

    def show_stats(self) -> None:
        """Display task statistics."""
        tasks = self.service.get_all_tasks()
        total = len(tasks)
        pending = len([t for t in tasks if not t.completed])
        completed = len([t for t in tasks if t.completed])

        stats_text = Text()
        stats_text.append(f"Total: {total}", style="bold white")
        stats_text.append(" | ", style="dim white")
        stats_text.append(f"Pending: {pending}", style="bold yellow")
        stats_text.append(" | ", style="dim white")
        stats_text.append(f"Completed: {completed}", style="bold green")

        stats_panel = Panel(
            Align.center(stats_text),
            border_style="dim white",
            padding=(0, 2),
        )

        self.console.print(stats_panel)
        self.console.print()

    def display_tasks(self, tasks_filter: str = "all") -> None:
        """Display tasks in a table."""
        tasks = self.service.get_all_tasks()

        if tasks_filter == "pending":
            tasks = [t for t in tasks if not t.completed]
        elif tasks_filter == "completed":
            tasks = [t for t in tasks if t.completed]

        if not tasks:
            self.console.print(
                Panel(
                    "[dim]No tasks yet. Use [bold orange1]/add[/bold orange1] to create one![/dim]",
                    border_style="dim white",
                )
            )
            return

        table = Table(
            show_header=True,
            header_style="bold cyan",
            border_style="dim white",
            expand=True,
        )

        table.add_column("ID", style="cyan", width=6)
        table.add_column("Status", width=10)
        table.add_column("Title", style="white")
        table.add_column("Description", style="dim white")
        table.add_column("Created", style="dim cyan", width=19)

        for task in tasks:
            status = "[green]Done[/green]" if task.completed else "[yellow]Pending[/yellow]"
            created = task.created_at.strftime("%Y-%m-%d %H:%M:%S")
            description = task.description[:50] + "..." if len(task.description) > 50 else task.description

            table.add_row(
                str(task.id),
                status,
                task.title[:40],
                description,
                created,
            )

        self.console.print(table)
        self.console.print()

    def show_help(self) -> None:
        """Display help information."""
        help_table = Table(
            show_header=True,
            header_style="bold orange1",
            border_style="orange1",
            title="[bold white]Available Commands[/bold white]",
            title_style="bold white",
        )

        help_table.add_column("Command", style="bold orange1", width=20)
        help_table.add_column("Description", style="white")
        help_table.add_column("Example", style="dim cyan")

        commands = [
            ('/add "<title>" -d "<desc>"', "Add a new task", '/add "Buy milk" -d "Get 2%"'),
            ("/add --multi", "Add multiple tasks at once", "/add --multi"),
            ("/list [filter]", "List tasks (all/pending/completed)", "/list pending"),
            ("/complete [id]", "Toggle task status (interactive)", "/complete"),
            ("/uncomplete <id>", "Mark task as incomplete", "/uncomplete 1"),
            ('/update <id> -t "<title>"', "Update task title/description", '/update 1 -t "New title"'),
            ("/delete <id>", "Delete a task", "/delete 1"),
            ("/clear", "Clear the screen", "/clear"),
            ("/help", "Show this help", "/help"),
            ("/quit or /exit", "Exit the application", "/quit"),
        ]

        for cmd, desc, example in commands:
            help_table.add_row(cmd, desc, example)

        self.console.print()
        self.console.print(help_table)
        self.console.print()

        # Add autocomplete tips
        tips_panel = Panel(
            "[bold yellow]Autocomplete Tips[/bold yellow]\n\n"
            "[cyan]•[/cyan] Type [bold orange1]/[/bold orange1] to see all commands\n"
            "[cyan]•[/cyan] Type [bold orange1]/a[/bold orange1] to filter (shows /add)\n"
            "[cyan]•[/cyan] Press [bold yellow]Tab[/bold yellow] to cycle through suggestions\n"
            "[cyan]•[/cyan] Press [bold yellow]Enter[/bold yellow] to insert the command\n"
            "[cyan]•[/cyan] The autocomplete menu shows command usage in the description\n"
            "[cyan]•[/cyan] Example: [dim]/add \"Buy milk\" -d \"2% organic\"[/dim]",
            border_style="yellow",
            padding=(1, 2),
        )
        self.console.print(tips_panel)
        self.console.print()

    def handle_add_command(self, args: str) -> None:
        """Handle /add command with optional -d flag for description or --multi for multiple tasks."""
        import re
        import time

        # Check for --multi flag
        if args.strip() == "--multi" or args.strip().startswith("--multi "):
            self.handle_add_multiple_tasks()
            return

        if not args.strip():
            self.console.print("[red]Error:[/red] Please provide a task title")
            self.console.print('[dim]Usage: /add "<title>" -d "<description>"[/dim]')
            self.console.print('[dim]   or: /add <title>[/dim]')
            self.console.print('[dim]   or: /add --multi (for multiple tasks)[/dim]')
            return

        # Parse arguments - check for -d flag
        # Try to match: /add "title" -d "description" or /add title -d description
        match_quoted = re.match(r'^["\']([^"\']+)["\'](?:\s+-d\s+["\']([^"\']*)["\'])?', args)
        match_with_flag = re.match(r'^(.+?)\s+-d\s+(.+)$', args)

        if match_quoted:
            # Matched quoted format: "title" -d "description"
            title = match_quoted.group(1)
            description = match_quoted.group(2) if match_quoted.group(2) else ""
        elif match_with_flag:
            # Matched unquoted format with flag: title -d description
            title = match_with_flag.group(1).strip()
            description = match_with_flag.group(2).strip()
        else:
            # No flag, treat entire args as title
            title = args.strip().strip('"\'')

            # Ask for description interactively
            self.console.print()
            self.console.print("[dim]Enter description (optional, press Enter to skip):[/dim]")
            try:
                description = self.session.prompt(
                    HTML("<orange>Description:</orange> "),
                )
            except (KeyboardInterrupt, EOFError):
                self.console.print("[yellow]Cancelled[/yellow]")
                return

        try:
            # Show loading animation with minimum visible duration
            with self.console.status("[bold orange1]Creating task...", spinner="dots") as status:
                task = self.service.create_task(title, description.strip())
                time.sleep(0.5)  # Minimum visible duration for loading state

            # Show success with animation
            self.console.print()
            success_text = Text()
            success_text.append("[x] ", style="bold green")
            success_text.append(f"Task #{task.id} created: ", style="bold white")
            success_text.append(task.title, style="cyan")

            success_panel = Panel(
                success_text,
                border_style="green",
                width=self.console.width,
                padding=(0, 1),
            )
            self.console.print(success_panel)

        except ValidationError as e:
            self.console.print()
            self.console.print(f"[red]Error:[/red] {e}")

    def handle_add_multiple_tasks(self) -> None:
        """Handle adding multiple tasks in one session."""
        import time

        self.console.print()
        self.console.print("[bold cyan]Add Multiple Tasks[/bold cyan]")
        self.console.print("[dim]Enter tasks one at a time. Press Ctrl+D (or Ctrl+Z on Windows) when done.[/dim]")
        self.console.print()

        tasks_created = []

        while True:
            try:
                # Get task title
                self.console.print("[bold orange1]New Task[/bold orange1]")
                title = self.session.prompt(
                    HTML("<cyan>Title:</cyan> "),
                )

                if not title.strip():
                    self.console.print("[yellow]Skipping empty task[/yellow]")
                    self.console.print()
                    continue

                # Get task description
                description = self.session.prompt(
                    HTML("<cyan>Description (optional):</cyan> "),
                )

                # Create the task
                try:
                    task = self.service.create_task(title.strip(), description.strip())
                    tasks_created.append(task)
                    self.console.print(f"[green]✓[/green] [dim]Task #{task.id} added[/dim]")
                    self.console.print()
                except ValidationError as e:
                    self.console.print(f"[red]Error:[/red] {e}")
                    self.console.print()

            except (EOFError, KeyboardInterrupt):
                # User is done adding tasks
                break

        # Show summary
        if tasks_created:
            self.console.print()
            with self.console.status("[bold orange1]Saving tasks...", spinner="dots"):
                time.sleep(0.5)  # Visual feedback

            self.console.print()
            count = len(tasks_created)
            success_text = Text()
            success_text.append("[x] ", style="bold green")
            success_text.append(f"{count} task{'s' if count > 1 else ''} created successfully!", style="bold white")

            success_panel = Panel(
                success_text,
                border_style="green",
                width=self.console.width,
                padding=(0, 1),
            )
            self.console.print(success_panel)

            # Show the created tasks
            table = Table(
                show_header=True,
                header_style="bold cyan",
                border_style="dim white",
                title="[bold white]Created Tasks[/bold white]",
            )
            table.add_column("ID", style="cyan", width=6)
            table.add_column("Title", style="white")
            table.add_column("Description", style="dim white")

            for task in tasks_created:
                description = task.description[:40] + "..." if len(task.description) > 40 else task.description
                table.add_row(
                    str(task.id),
                    task.title[:40],
                    description,
                )

            self.console.print()
            self.console.print(table)
        else:
            self.console.print()
            self.console.print("[dim]No tasks created[/dim]")

    def handle_list_command(self, args: str) -> None:
        """Handle /list command."""
        filter_type = args.strip().lower() or "all"

        if filter_type not in ["all", "pending", "completed"]:
            self.console.print("[red]Error:[/red] Invalid filter. Use: all, pending, or completed")
            return

        self.console.print()
        self.show_stats()
        self.display_tasks(filter_type)

    def handle_complete_command(self, args: str) -> None:
        """Handle /complete command with arrow key navigation and space to toggle."""
        # If ID provided, mark that specific task
        if args.strip().isdigit():
            task_id = int(args.strip())
            try:
                import time
                with self.console.status("[bold orange1]Marking task as complete...", spinner="dots"):
                    task = self.service.complete_task(task_id)
                    time.sleep(0.5)  # Minimum visible duration for loading state

                self.console.print()
                success_text = Text()
                success_text.append("[x] ", style="bold green blink")
                success_text.append(f"Task #{task.id} marked as complete!", style="bold white")

                success_panel = Panel(
                    success_text,
                    border_style="green",
                    width=self.console.width,
                    padding=(0, 1),
                )
                self.console.print(success_panel)

            except TaskNotFoundError:
                self.console.print()
                self.console.print(f"[red]Error:[/red] Task {task_id} not found")
            return

        # No ID provided - show arrow key navigation interface
        tasks = self.service.get_all_tasks()

        if not tasks:
            self.console.print()
            self.console.print("[yellow]No tasks available![/yellow]")
            return

        # State management
        current_index = [0]  # Use list to allow modification in nested function
        task_states = {task.id: task.completed for task in tasks}
        should_exit = [False]
        should_save = [False]

        # Create key bindings
        kb = KeyBindings()

        @kb.add("up")
        def move_up(event):
            if current_index[0] > 0:
                current_index[0] -= 1

        @kb.add("down")
        def move_down(event):
            if current_index[0] < len(tasks) - 1:
                current_index[0] += 1

        @kb.add("space")
        def toggle_current(event):
            task = tasks[current_index[0]]
            task_states[task.id] = not task_states[task.id]

        @kb.add("enter")
        def save_changes(event):
            should_save[0] = True
            event.app.exit()

        @kb.add("c-c")
        @kb.add("escape")
        def cancel(event):
            should_exit[0] = True
            event.app.exit()

        # Function to generate the display text
        def get_formatted_text():
            lines = []
            lines.append(("class:header", "Toggle Task Status\n"))
            lines.append(("class:info", "↑↓: navigate | Space: toggle | Enter: save | Esc: cancel\n\n"))

            for i, task in enumerate(tasks):
                is_completed = task_states[task.id]
                is_current = i == current_index[0]

                # Build the line
                if is_current:
                    prefix = "> "
                    style = "class:selected"
                else:
                    prefix = "  "
                    style = "class:normal"

                checkbox = "[✓]" if is_completed else "[ ]"
                title = task.title[:40]
                desc = f" - {task.description[:30]}..." if task.description and len(task.description) > 30 else f" - {task.description}" if task.description else ""

                line = f"{prefix}{checkbox} #{task.id} {title}{desc}\n"
                lines.append((style, line))

            return lines

        # Create the application
        text_control = FormattedTextControl(
            text=get_formatted_text,
            focusable=True,
        )

        window = Window(content=text_control, always_hide_cursor=True)

        app_layout = PTLayout(HSplit([window]))

        style = Style.from_dict({
            "header": "bold cyan",
            "info": "dim",
            "selected": "bg:#ff6b35 #000000 bold",
            "normal": "",
        })

        app = Application(
            layout=app_layout,
            key_bindings=kb,
            style=style,
            full_screen=False,
            mouse_support=False,
        )

        # Run the application
        self.console.print()
        app.run()

        # Process results
        if should_save[0]:
            import time
            changes_made = []

            for task in tasks:
                original_status = task.completed
                new_status = task_states[task.id]

                if original_status != new_status:
                    if new_status:
                        self.service.complete_task(task.id)
                        changes_made.append(("completed", task.id))
                    else:
                        self.service.uncomplete_task(task.id)
                        changes_made.append(("uncompleted", task.id))

            if changes_made:
                with self.console.status("[bold orange1]Saving changes...", spinner="dots"):
                    time.sleep(0.5)

                self.console.print()
                completed_count = sum(1 for action, _ in changes_made if action == "completed")
                uncompleted_count = sum(1 for action, _ in changes_made if action == "uncompleted")

                success_text = Text()
                success_text.append("✓ ", style="bold green")

                status_parts = []
                if completed_count > 0:
                    status_parts.append(f"{completed_count} marked as done")
                if uncompleted_count > 0:
                    status_parts.append(f"{uncompleted_count} marked as pending")

                success_text.append(", ".join(status_parts), style="bold white")

                success_panel = Panel(
                    success_text,
                    border_style="green",
                    width=self.console.width,
                    padding=(0, 1),
                )
                self.console.print(success_panel)
            else:
                self.console.print("[dim]No changes made[/dim]")
        else:
            self.console.print()
            self.console.print("[dim]Cancelled[/dim]")

    def handle_uncomplete_command(self, args: str) -> None:
        """Handle /uncomplete command."""
        if not args.strip().isdigit():
            self.console.print("[red]Error:[/red] Please provide a valid task ID")
            self.console.print("[dim]Usage: /uncomplete <id>[/dim]")
            return

        task_id = int(args.strip())

        try:
            task = self.service.uncomplete_task(task_id)
            self.console.print()
            self.console.print(
                Panel(
                    f"[yellow][ ][/yellow] Task [bold cyan]#{task.id}[/bold cyan] marked as incomplete!",
                    border_style="yellow",
                )
            )
        except TaskNotFoundError:
            self.console.print()
            self.console.print(f"[red]Error:[/red] Task {task_id} not found")

    def handle_delete_command(self, args: str) -> None:
        """Handle /delete command."""
        if not args.strip().isdigit():
            self.console.print("[red]Error:[/red] Please provide a valid task ID")
            self.console.print("[dim]Usage: /delete <id>[/dim]")
            return

        task_id = int(args.strip())

        try:
            task = self.service.get_task(task_id)
            self.console.print()
            self.console.print(f"[yellow]Delete task #{task_id}:[/yellow] {task.title}")
            confirm = self.session.prompt(
                HTML("<red>Are you sure? (y/N):</red> "),
            )

            if confirm.lower() == "y":
                self.service.delete_task(task_id)
                self.console.print()
                self.console.print(
                    Panel(
                        f"[red][X][/red] Task [bold cyan]#{task_id}[/bold cyan] deleted",
                        border_style="red",
                    )
                )
            else:
                self.console.print()
                self.console.print("[dim]Cancelled[/dim]")

        except (TaskNotFoundError, KeyboardInterrupt, EOFError):
            self.console.print()
            self.console.print(f"[red]Error:[/red] Task {task_id} not found")

    def handle_update_command(self, args: str) -> None:
        """Handle /update command with optional -t and -d flags."""
        if not args.strip():
            self.console.print("[red]Error:[/red] Please provide a task ID")
            self.console.print('[dim]Usage: /update <id> -t "<new title>" -d "<new description>"[/dim]')
            self.console.print('[dim]   or: /update <id>[/dim]')
            return

        import re

        # Try to parse: /update <id> -t "title" -d "description"
        # Extract the task ID first
        parts = args.strip().split(maxsplit=1)
        if not parts[0].isdigit():
            self.console.print("[red]Error:[/red] First argument must be a task ID")
            self.console.print('[dim]Usage: /update <id> -t "<new title>" -d "<new description>"[/dim]')
            return

        task_id = int(parts[0])
        remaining_args = parts[1] if len(parts) > 1 else ""

        # Parse flags
        title = None
        description = None

        if remaining_args:
            # Match -t "title"
            title_match = re.search(r'-t\s+["\']([^"\']+)["\']', remaining_args)
            if title_match:
                title = title_match.group(1)

            # Match -d "description"
            desc_match = re.search(r'-d\s+["\']([^"\']*)["\']', remaining_args)
            if desc_match:
                description = desc_match.group(1)

        # If no flags provided, ask interactively
        if title is None and description is None:
            try:
                task = self.service.get_task(task_id)
                self.console.print()
                self.console.print(f"[cyan]Current title:[/cyan] {task.title}")
                self.console.print(f"[cyan]Current description:[/cyan] {task.description or '(none)'}")
                self.console.print()
                self.console.print("[dim]Enter new values (press Enter to keep current):[/dim]")

                new_title = self.session.prompt(
                    HTML("<orange>New title:</orange> "),
                )

                new_description = self.session.prompt(
                    HTML("<orange>New description:</orange> "),
                )

                title = new_title.strip() or None
                description = new_description.strip() or None

            except (KeyboardInterrupt, EOFError):
                self.console.print()
                self.console.print("[yellow]Cancelled[/yellow]")
                return

        try:
            if not title and not description:
                self.console.print()
                self.console.print("[yellow]No changes made[/yellow]")
                return

            self.service.update_task(task_id, title=title, description=description)
            self.console.print()
            self.console.print(
                Panel(
                    f"[green][x][/green] Task [bold cyan]#{task_id}[/bold cyan] updated!",
                    border_style="green",
                )
            )

        except TaskNotFoundError:
            self.console.print()
            self.console.print(f"[red]Error:[/red] Task {task_id} not found")
        except ValidationError as e:
            self.console.print()
            self.console.print(f"[red]Error:[/red] {e}")

    def process_command(self, command: str) -> None:
        """Process a user command."""
        command = command.strip()

        if not command:
            return

        # Handle non-slash commands
        if not command.startswith("/"):
            self.console.print("[yellow]Commands must start with /[/yellow]")
            self.console.print("[dim]Try /help for available commands[/dim]")
            return

        # Parse command and arguments
        parts = command.split(maxsplit=1)
        cmd = parts[0].lower()
        args = parts[1] if len(parts) > 1 else ""

        # Route to appropriate handler
        if cmd in ["/quit", "/exit"]:
            self.running = False
            self.console.print()
            self.console.print("[dim]Goodbye! 👋[/dim]")
            return

        if cmd == "/help":
            self.show_help()
        elif cmd == "/clear":
            self.show_hero()
        elif cmd == "/add":
            self.handle_add_command(args)
        elif cmd == "/list":
            self.handle_list_command(args)
        elif cmd == "/complete":
            self.handle_complete_command(args)
        elif cmd == "/uncomplete":
            self.handle_uncomplete_command(args)
        elif cmd == "/delete":
            self.handle_delete_command(args)
        elif cmd == "/update":
            self.handle_update_command(args)
        else:
            # Try to find matching commands
            matching_commands = sorted([
                command for command in CommandCompleter.COMMANDS.keys()
                if command.startswith(cmd)
            ])

            if matching_commands:
                # Execute the first matching command
                matched_cmd = matching_commands[0]
                self.console.print(f"[dim]Assuming command:[/dim] [cyan]{matched_cmd}[/cyan]")

                # Reconstruct the full command with the matched command and original args
                full_command = matched_cmd
                if args:
                    full_command += " " + args

                # Recursively process the matched command
                self.process_command(full_command)
            else:
                self.console.print(f"[red]Unknown command:[/red] {cmd}")
                self.console.print("[dim]Try /help for available commands[/dim]")

    def show_footer(self) -> None:
        """Show status bar footer like Gemini CLI."""
        tasks = self.service.get_all_tasks()
        total = len(tasks)
        pending = len([t for t in tasks if not t.completed])

        # Create footer with context information
        footer_text = f" Tasks: {total} | Pending: {pending} | Type /help for commands"

        footer_panel = Panel(
            footer_text,
            border_style="dim white",
            width=self.console.width,
            padding=(0, 1),
        )
        self.console.print(footer_panel)

    def run(self) -> None:
        """Run the main application loop."""
        import time

        # Show hero screen
        self.show_hero()

        # Main loop
        while self.running:
            try:
                # Show prompt with bottom toolbar (integrated by prompt_toolkit)
                command = self.session.prompt(
                    HTML("<ansibrightcyan><b>doit></b></ansibrightcyan> "),
                )

                # Reset interrupt time on successful input
                self.last_interrupt_time = 0.0

                # Process command
                if command.strip():  # Only process non-empty commands
                    self.console.print()  # Spacing before output
                    self.process_command(command)
                    self.console.print()  # Spacing after output

            except KeyboardInterrupt:
                current_time = time.time()

                # Check if Ctrl+C was pressed within 2 seconds of last press
                if self.last_interrupt_time > 0 and (current_time - self.last_interrupt_time) < 2.0:
                    # Double Ctrl+C detected - quit
                    self.console.print()
                    self.console.print("[bold yellow]Goodbye! 👋[/bold yellow]")
                    break
                else:
                    # First Ctrl+C - show message
                    self.last_interrupt_time = current_time
                    self.console.print()
                    self.console.print("[dim white]Press Ctrl+C again within 2 seconds to exit, or type /quit[/dim white]")
                    self.console.print()
                    continue

            except EOFError:
                break


def main() -> None:
    """Main entry point."""
    try:
        app = DoItApp()
        app.run()
    except Exception as e:
        console = Console()
        console.print(f"[red]Fatal error:[/red] {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
