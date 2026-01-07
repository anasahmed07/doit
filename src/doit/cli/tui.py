"""Full interactive TUI with keyboard navigation using Textual."""

from textual import on
from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal
from textual.screen import Screen
from textual.widgets import Button, DataTable, Footer, Header, Input, Label, Static

from doit.models.exceptions import DoitError, TaskNotFoundError, ValidationError
from doit.services.task_service import TaskService
from doit.storage.memory import MemoryStorage


class AddTaskScreen(Screen):
    """Screen for adding a new task."""

    BINDINGS = [
        ("escape", "app.pop_screen", "Cancel"),
    ]

    def compose(self) -> ComposeResult:
        """Compose the add task screen."""
        yield Header()
        yield Container(
            Label("Add New Task", classes="screen-title"),
            Label("Title:", classes="input-label"),
            Input(placeholder="Enter task title...", id="title-input"),
            Label("Description (optional):", classes="input-label"),
            Input(placeholder="Enter task description...", id="description-input"),
            Horizontal(
                Button("Save", variant="success", id="save-btn"),
                Button("Cancel", variant="error", id="cancel-btn"),
                classes="button-row",
            ),
            Static(id="add-message"),
            classes="dialog",
        )
        yield Footer()

    @on(Button.Pressed, "#save-btn")
    def handle_save(self) -> None:
        """Handle save button press."""
        title_input = self.query_one("#title-input", Input)
        description_input = self.query_one("#description-input", Input)
        message = self.query_one("#add-message", Static)

        title = title_input.value.strip()
        description = description_input.value.strip()

        if not title:
            message.update("[red]Error: Title cannot be empty[/red]")
            return

        try:
            app = self.app
            assert isinstance(app, DoItApp)
            task = app.service.create_task(title, description)
            message.update(f"[green]✓ Task {task.id} created successfully![/green]")
            title_input.value = ""
            description_input.value = ""
            self.app.pop_screen()
        except (ValidationError, DoitError) as e:
            message.update(f"[red]Error: {e}[/red]")

    @on(Button.Pressed, "#cancel-btn")
    def handle_cancel(self) -> None:
        """Handle cancel button press."""
        self.app.pop_screen()


class UpdateTaskScreen(Screen):
    """Screen for updating a task."""

    BINDINGS = [
        ("escape", "app.pop_screen", "Cancel"),
    ]

    def __init__(self, task_id: int):
        """Initialize update task screen."""
        super().__init__()
        self.task_id = task_id

    def compose(self) -> ComposeResult:
        """Compose the update task screen."""
        yield Header()
        yield Container(
            Label(f"Update Task #{self.task_id}", classes="screen-title"),
            Label("New Title (leave empty to keep current):", classes="input-label"),
            Input(placeholder="Enter new title...", id="title-input"),
            Label("New Description (leave empty to keep current):", classes="input-label"),
            Input(placeholder="Enter new description...", id="description-input"),
            Horizontal(
                Button("Update", variant="success", id="update-btn"),
                Button("Cancel", variant="error", id="cancel-btn"),
                classes="button-row",
            ),
            Static(id="update-message"),
            classes="dialog",
        )
        yield Footer()

    @on(Button.Pressed, "#update-btn")
    def handle_update(self) -> None:
        """Handle update button press."""
        title_input = self.query_one("#title-input", Input)
        description_input = self.query_one("#description-input", Input)
        message = self.query_one("#update-message", Static)

        title = title_input.value.strip() or None
        description = description_input.value.strip() or None

        if not title and not description:
            message.update("[yellow]No changes made[/yellow]")
            return

        try:
            app = self.app
            assert isinstance(app, DoItApp)
            app.service.update_task(self.task_id, title=title, description=description)
            message.update(f"[green]✓ Task {self.task_id} updated successfully![/green]")
            self.app.pop_screen()
        except TaskNotFoundError:
            message.update(f"[red]Error: Task {self.task_id} not found[/red]")
        except (ValidationError, DoitError) as e:
            message.update(f"[red]Error: {e}[/red]")

    @on(Button.Pressed, "#cancel-btn")
    def handle_cancel(self) -> None:
        """Handle cancel button press."""
        self.app.pop_screen()


class DeleteConfirmScreen(Screen):
    """Screen for confirming task deletion."""

    BINDINGS = [
        ("escape", "app.pop_screen", "Cancel"),
    ]

    def __init__(self, task_id: int, task_title: str):
        """Initialize delete confirm screen."""
        super().__init__()
        self.task_id = task_id
        self.task_title = task_title

    def compose(self) -> ComposeResult:
        """Compose the delete confirm screen."""
        yield Header()
        yield Container(
            Label("Delete Task", classes="screen-title"),
            Label(f"Are you sure you want to delete task #{self.task_id}?"),
            Label(f'"{self.task_title}"', classes="task-title-preview"),
            Horizontal(
                Button("Delete", variant="error", id="delete-btn"),
                Button("Cancel", variant="default", id="cancel-btn"),
                classes="button-row",
            ),
            Static(id="delete-message"),
            classes="dialog",
        )
        yield Footer()

    @on(Button.Pressed, "#delete-btn")
    def handle_delete(self) -> None:
        """Handle delete button press."""
        try:
            app = self.app
            assert isinstance(app, DoItApp)
            app.service.delete_task(self.task_id)
            self.app.pop_screen()
        except (TaskNotFoundError, DoitError) as e:
            message = self.query_one("#delete-message", Static)
            message.update(f"[red]Error: {e}[/red]")

    @on(Button.Pressed, "#cancel-btn")
    def handle_cancel(self) -> None:
        """Handle cancel button press."""
        self.app.pop_screen()


class HelpScreen(Screen):
    """Screen showing keyboard shortcuts and help."""

    BINDINGS = [
        ("escape", "app.pop_screen", "Close"),
    ]

    def compose(self) -> ComposeResult:
        """Compose the help screen."""
        yield Header()
        yield Container(
            Label("DoIt - Keyboard Shortcuts", classes="screen-title"),
            Static(
                """
[bold cyan]Navigation:[/bold cyan]
  [yellow]↑/↓[/yellow]        Navigate task list
  [yellow]Enter[/yellow]      Perform action on selected task

[bold cyan]Quick Actions:[/bold cyan]
  [yellow]a[/yellow] or [yellow]n[/yellow]    Add new task
  [yellow]d[/yellow]          Delete selected task
  [yellow]e[/yellow]          Edit/update selected task
  [yellow]Space[/yellow]      Toggle complete/incomplete

[bold cyan]Filters:[/bold cyan]
  [yellow]1[/yellow]          Show all tasks
  [yellow]2[/yellow]          Show pending tasks only
  [yellow]3[/yellow]          Show completed tasks only

[bold cyan]General:[/bold cyan]
  [yellow]Ctrl+H[/yellow]     Show this help
  [yellow]Ctrl+R[/yellow]     Refresh task list
  [yellow]Ctrl+X[/yellow]     Quit application
  [yellow]Esc[/yellow]        Close dialog/cancel

[bold cyan]Tips:[/bold cyan]
  • Use arrow keys to navigate tasks
  • Press Space to quickly toggle completion
  • Press Enter after selecting a task to see options
  • All actions can be done with keyboard only!
                """,
                classes="help-text",
            ),
            Button("Close", variant="primary", id="close-btn"),
            classes="dialog",
        )
        yield Footer()

    @on(Button.Pressed, "#close-btn")
    def handle_close(self) -> None:
        """Handle close button press."""
        self.app.pop_screen()


class DoItApp(App):
    """Main DoIt TUI application."""

    CSS = """
    Screen {
        background: $surface;
    }

    .screen-title {
        text-align: center;
        text-style: bold;
        color: $accent;
        padding: 1;
    }

    .dialog {
        width: 80;
        height: auto;
        border: solid $primary;
        background: $panel;
        padding: 2;
        margin: 2;
    }

    .input-label {
        margin-top: 1;
        color: $text;
    }

    Input {
        margin-bottom: 1;
    }

    .button-row {
        height: auto;
        align: center middle;
        margin-top: 1;
    }

    .button-row Button {
        margin: 0 1;
    }

    DataTable {
        height: 1fr;
        margin: 1;
    }

    #add-message, #update-message, #delete-message {
        height: auto;
        margin-top: 1;
        text-align: center;
    }

    .task-title-preview {
        text-align: center;
        text-style: italic;
        color: $warning;
        margin: 1 0;
    }

    .help-text {
        background: $panel;
        border: solid $primary;
        padding: 2;
        margin: 1 0;
    }

    #stats {
        dock: top;
        height: 3;
        background: $panel;
        border: solid $primary;
        padding: 0 2;
    }

    #action-bar {
        dock: bottom;
        height: 3;
        background: $panel;
        border: solid $primary;
    }
    """

    BINDINGS = [
        ("ctrl+h", "show_help", "Help"),
        ("ctrl+x", "quit", "Quit"),
        ("ctrl+r", "refresh", "Refresh"),
        ("a", "add_task", "Add Task"),
        ("n", "add_task", "New Task"),
        ("d", "delete_task", "Delete"),
        ("e", "edit_task", "Edit"),
        ("space", "toggle_complete", "Toggle"),
        ("1", "filter_all", "All"),
        ("2", "filter_pending", "Pending"),
        ("3", "filter_completed", "Completed"),
    ]

    def __init__(self):
        """Initialize the DoIt app."""
        super().__init__()
        self.storage = MemoryStorage()
        self.service = TaskService(self.storage)
        self.current_filter = "all"

    def compose(self) -> ComposeResult:
        """Compose the main screen."""
        yield Header()
        yield Container(
            Static(id="stats"),
            DataTable(id="tasks-table", cursor_type="row"),
            id="main-container",
        )
        yield Footer()

    def on_mount(self) -> None:
        """Set up the application on mount."""
        table = self.query_one("#tasks-table", DataTable)
        table.add_columns("ID", "Status", "Title", "Description")
        table.cursor_type = "row"
        table.zebra_stripes = True
        self.refresh_tasks()

    def refresh_tasks(self) -> None:
        """Refresh the task list."""
        table = self.query_one("#tasks-table", DataTable)
        table.clear()

        tasks = self.service.get_all_tasks()

        # Apply filter
        if self.current_filter == "pending":
            tasks = [t for t in tasks if not t.completed]
        elif self.current_filter == "completed":
            tasks = [t for t in tasks if t.completed]

        # Update stats
        all_tasks = self.service.get_all_tasks()
        pending_count = len([t for t in all_tasks if not t.completed])
        completed_count = len([t for t in all_tasks if t.completed])

        filter_text = {
            "all": "All Tasks",
            "pending": "Pending Tasks",
            "completed": "Completed Tasks",
        }[self.current_filter]

        stats = self.query_one("#stats", Static)
        stats.update(
            f"[bold cyan]{filter_text}[/bold cyan] | "
            f"Total: {len(all_tasks)} | "
            f"[yellow]Pending: {pending_count}[/yellow] | "
            f"[green]Completed: {completed_count}[/green]"
        )

        # Populate table
        for task in tasks:
            status = "[green]✓[/green]" if task.completed else "[yellow]○[/yellow]"
            table.add_row(
                str(task.id),
                status,
                task.title[:40],
                task.description[:50] if task.description else "",
                key=str(task.id),
            )

    def action_show_help(self) -> None:
        """Show help screen."""
        self.push_screen(HelpScreen())

    def action_refresh(self) -> None:
        """Refresh the task list."""
        self.refresh_tasks()

    def action_add_task(self) -> None:
        """Show add task screen."""
        self.push_screen(AddTaskScreen())

    def action_delete_task(self) -> None:
        """Delete the selected task."""
        table = self.query_one("#tasks-table", DataTable)
        if table.row_count == 0:
            self.notify("No tasks to delete", severity="warning")
            return

        row_key = table.cursor_row
        if row_key is not None and table.row_count > 0:
            task_id_str = table.get_cell_at((row_key, 0))
            task_id = int(task_id_str)

            try:
                task = self.service.get_task(task_id)
                self.push_screen(DeleteConfirmScreen(task_id, task.title))
            except TaskNotFoundError:
                self.notify(f"Task {task_id} not found", severity="error")

    def action_edit_task(self) -> None:
        """Edit the selected task."""
        table = self.query_one("#tasks-table", DataTable)
        if table.row_count == 0:
            self.notify("No tasks to edit", severity="warning")
            return

        row_key = table.cursor_row
        if row_key is not None and table.row_count > 0:
            task_id_str = table.get_cell_at((row_key, 0))
            task_id = int(task_id_str)
            self.push_screen(UpdateTaskScreen(task_id))

    def action_toggle_complete(self) -> None:
        """Toggle completion status of selected task."""
        table = self.query_one("#tasks-table", DataTable)
        if table.row_count == 0:
            self.notify("No tasks available", severity="warning")
            return

        row_key = table.cursor_row
        if row_key is not None and table.row_count > 0:
            task_id_str = table.get_cell_at((row_key, 0))
            task_id = int(task_id_str)

            try:
                task = self.service.get_task(task_id)
                if task.completed:
                    self.service.uncomplete_task(task_id)
                    self.notify(f"Task {task_id} marked as incomplete", severity="information")
                else:
                    self.service.complete_task(task_id)
                    self.notify(f"Task {task_id} marked as complete", severity="information")
                self.refresh_tasks()
            except TaskNotFoundError:
                self.notify(f"Task {task_id} not found", severity="error")

    def action_filter_all(self) -> None:
        """Show all tasks."""
        self.current_filter = "all"
        self.refresh_tasks()

    def action_filter_pending(self) -> None:
        """Show only pending tasks."""
        self.current_filter = "pending"
        self.refresh_tasks()

    def action_filter_completed(self) -> None:
        """Show only completed tasks."""
        self.current_filter = "completed"
        self.refresh_tasks()

    def on_screen_resume(self) -> None:
        """Refresh tasks when returning to main screen."""
        self.refresh_tasks()


def run_tui() -> None:
    """Run the Textual TUI application."""
    app = DoItApp()
    app.run()


if __name__ == "__main__":
    run_tui()
