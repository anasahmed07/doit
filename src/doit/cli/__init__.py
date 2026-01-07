"""CLI module - command line interfaces for DoIt.

This module provides three different command-line interfaces:
1. CLI Tool: Standard command-line interface with commands (doit)
2. Interactive Mode: Menu-driven interactive CLI (doit-interactive)
3. TUI: Full terminal user interface with keyboard navigation (doit-tui)
"""

from doit.cli.interactive import run_interactive
from doit.cli.main import main as cli_main
from doit.cli.tui import run_tui

__all__ = [
    "cli_main",
    "run_interactive",
    "run_tui",
]
