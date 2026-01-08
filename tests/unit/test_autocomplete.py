"""Test script to verify autocomplete behavior."""

from prompt_toolkit import PromptSession
from prompt_toolkit.completion import Completer, Completion
from prompt_toolkit.history import InMemoryHistory
from prompt_toolkit.styles import Style
from typing import Any


class CommandCompleter(Completer):
    """Autocompleter for slash commands."""

    COMMANDS = {
        "/add": {"desc": "Add a new task", "template": "/add "},
        "/list": {"desc": "List all tasks", "template": "/list "},
        "/complete": {"desc": "Mark a task as complete", "template": "/complete "},
        "/uncomplete": {"desc": "Mark a task as incomplete", "template": "/uncomplete "},
        "/delete": {"desc": "Delete a task", "template": "/delete "},
        "/update": {"desc": "Update a task", "template": "/update "},
        "/help": {"desc": "Show help", "template": "/help"},
        "/clear": {"desc": "Clear screen", "template": "/clear"},
        "/quit": {"desc": "Exit application", "template": "/quit"},
        "/exit": {"desc": "Exit application", "template": "/exit"},
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

        # Filter commands that start with what user has typed
        for command, info in self.COMMANDS.items():
            if command.startswith(current_text):
                # Calculate how much to replace
                yield Completion(
                    info["template"],
                    start_position=-len(current_text),
                    display=command,
                    display_meta=info["desc"],
                )


def main():
    """Test the autocomplete."""
    print("Testing autocomplete behavior...")
    print("Type a command starting with / (e.g., /add, /list)")
    print("Press Tab or start typing to see autocomplete")
    print("Press Ctrl+C to exit\n")

    session = PromptSession(
        history=InMemoryHistory(),
        completer=CommandCompleter(),
        complete_while_typing=True,
        complete_in_thread=True,
        style=Style.from_dict(
            {
                "completion-menu.completion": "bg:#1e1e1e #cccccc",
                "completion-menu.completion.current": "bg:#ff6b35 #000000",
                "completion-menu.meta.completion": "bg:#1e1e1e #888888",
                "completion-menu.meta.completion.current": "bg:#ff6b35 #000000",
            }
        ),
    )

    try:
        while True:
            result = session.prompt("test> ")
            print(f"You entered: {result}")
            if result in ["/quit", "/exit"]:
                break
    except KeyboardInterrupt:
        print("\nExiting...")


if __name__ == "__main__":
    main()
