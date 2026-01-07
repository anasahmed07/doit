"""Main CLI application entry point."""

import sys

import typer

from doit.cli import commands
from doit.cli.tui import run_tui
from doit.cli.interactive import run_interactive

app = typer.Typer(
    name="doit",
    help="Todo Console Application - manage your tasks from the command line",
    add_completion=False,
)


def terminal_appliation_mode() -> None:
    """Launch interactive terminal UI mode with full keyboard navigation."""
    run_tui()

def interactive_mode() -> None:
    """Launch menu-driven interactive CLI mode."""
    run_interactive()


# Register commands
app.command(name="add")(commands.add_task)
app.command(name="list")(commands.list_tasks)
app.command(name="complete")(commands.complete_task)
app.command(name="uncomplete")(commands.uncomplete_task)
app.command(name="update")(commands.update_task)
app.command(name="delete")(commands.delete_task)
app.command(name="tui")(terminal_appliation_mode)
app.command(name="interactive")(interactive_mode)


def main() -> None:
    """Main entry point - runs TUI mode by default if no command given."""
    if len(sys.argv) == 1:
        # No arguments provided, run TUI mode
        run_tui()
    else:
        # Run as CLI command
        app()


if __name__ == "__main__":
    main()
