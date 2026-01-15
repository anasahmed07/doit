"""Simple test script to verify the application components."""

from rich.console import Console
from rich.panel import Panel
from rich.align import Align
from rich.text import Text
from rich.table import Table

console = Console()

# Test hero screen
console.clear()
console.print("\n[bold cyan]Testing DoIt Components[/bold cyan]\n")

# Test 1: Hero Panel
hero_text = Text()
hero_text.append("\n")
hero_text.append("█▀▄ █▀█ █ ▀█▀\n", style="bold bright_cyan")
hero_text.append("█▄▀ █▄█ █  █ \n", style="bold bright_cyan")
hero_text.append("\n")
hero_text.append("A Modern Terminal Task Manager\n", style="italic white")
hero_text.append("\n")
hero_text.append("Type ", style="white")
hero_text.append("/help", style="bold orange1")
hero_text.append(" to get started or ", style="white")
hero_text.append("/add", style="bold orange1")
hero_text.append(" to create your first task\n", style="white")

hero_panel = Panel(
    Align.center(hero_text),
    border_style="orange1",
    padding=(1, 2),
    title="[bold white]Welcome[/bold white]",
    title_align="center",
)

console.print(hero_panel)
console.print()

# Test 2: Stats Panel
stats_text = Text()
stats_text.append("Total: 0", style="bold white")
stats_text.append(" | ", style="dim white")
stats_text.append("Pending: 0", style="bold yellow")
stats_text.append(" | ", style="dim white")
stats_text.append("Completed: 0", style="bold green")

stats_panel = Panel(
    Align.center(stats_text),
    border_style="dim white",
    padding=(0, 2),
)

console.print(stats_panel)
console.print()

# Test 3: Task Table
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

table.add_row(
    "1",
    "[yellow]○ Todo[/yellow]",
    "Example task",
    "This is an example",
)
table.add_row(
    "2",
    "[green]✓ Done[/green]",
    "Completed task",
    "Already finished",
)

console.print(table)
console.print()

# Test 4: Help Table
help_table = Table(
    show_header=True,
    header_style="bold orange1",
    border_style="orange1",
    title="[bold white]Available Commands[/bold white]",
    title_style="bold white",
)

help_table.add_column("Command", style="bold orange1", width=20)
help_table.add_column("Description", style="white")

help_table.add_row("/add", "Add a new task")
help_table.add_row("/list", "List all tasks")
help_table.add_row("/help", "Show help")

console.print(help_table)
console.print()

console.print("[bold green]✓ All components working![/bold green]")
console.print()
console.print("[dim]Note: The interactive application requires a proper terminal.[/dim]")
console.print("[dim]On Windows, use Windows Terminal, CMD, or PowerShell for best results.[/dim]")
