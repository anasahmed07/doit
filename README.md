# DoIt - A Modern Terminal Task Manager

A beautiful, interactive command-line task management application built with Python 3.13+, featuring slash commands and a Rich terminal interface inspired by Claude Code.

## Features

- **Interactive Terminal UI**: Beautiful terminal interface with colored panels and tables
- **Slash Commands**: Claude Code-inspired command interface with autocomplete
- **Task Management**: Create, update, complete, and delete tasks
- **In-Memory Storage**: Fast, lightweight storage during your session
- **Smart Autocomplete**: Tab completion for all commands
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd doit

# Install with uv (recommended)
uv sync

# Or install with pip
pip install -e .
```

## Usage

Simply run:

```bash
doit
```

You'll be greeted with a beautiful hero screen. Start typing commands prefixed with `/` to interact with the application.

### Using Autocomplete with Templates

The application features intelligent autocomplete with command templates:

1. **Type `/`** - Shows all available commands with descriptions
2. **Type `/a`** - Filters to show only `/add`
3. **Type `/co`** - Filters to show `/complete`
4. **Press Tab** - Cycles through available completions
5. **Press Enter** - Inserts the full command template with placeholders

**Command Templates include:**
- `/add "<title>" -d "<description>"` - Complete task creation with optional description flag
- `/update <id> -t "<new title>" -d "<new description>"` - Update with optional title/description flags
- `/complete <id>` - Mark task complete
- `/list [all|pending|completed]` - List with filter options

When you select a command, the template is inserted with placeholders (e.g., `<title>`, `<id>`). Simply replace the placeholders with your actual values.

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/add "<title>" -d "<desc>"` | Add a new task with optional description | `/add "Buy milk" -d "Get 2% organic"` |
| `/list [filter]` | List tasks (all/pending/completed) | `/list pending` |
| `/complete <id>` | Mark a task as complete | `/complete 1` |
| `/uncomplete <id>` | Mark a task as incomplete | `/uncomplete 1` |
| `/update <id> -t "<title>" -d "<desc>"` | Update task with optional flags | `/update 1 -t "New title"` |
| `/delete <id>` | Delete a task | `/delete 1` |
| `/clear` | Clear the screen and show hero | `/clear` |
| `/help` | Show help information | `/help` |
| `/quit` or `/exit` | Exit the application | `/quit` |

### Example Workflow

#### Autocomplete with Templates in Action

```
doit> /                          # Shows all commands in dropdown
      ├─ /add                   Add a new task
      ├─ /list                  List all tasks
      ├─ /complete              Mark a task as complete
      └─ ...

doit> /a                         # Filters to /add
      └─ /add                   Add a new task

doit> /add                       # Press Enter/Tab - inserts template:
      /add "<title>" -d "<description>"
                                 # Full template with placeholders!

doit> /add "Buy milk" -d "2%"   # Replace placeholders, press Enter
[x] Task #1 created: Buy milk
```

**Template Features:**
- Flags are optional: `/add "Buy milk"` works without `-d`
- Interactive fallback: `/add` alone will prompt for description
- Mix and match: `/update 1 -t "New title"` (only update title)

#### Full Session Example

```
doit> /add "Buy groceries" -d "Milk, bread, eggs"
[x] Task #1 created: Buy groceries

doit> /add "Write documentation"
[x] Task #2 created: Write documentation

doit> /list

Total: 2 | Pending: 2 | Completed: 0

┌──────┬──────────┬──────────────────┬─────────────────┬─────────────────────┐
│ ID   │ Status   │ Title            │ Description     │ Created             │
├──────┼──────────┼──────────────────┼─────────────────┼─────────────────────┤
│ 1    │ [ ] Todo │ Buy groceries    │ Milk, bread...  │ 2026-01-07 10:30:00 │
│ 2    │ [ ] Todo │ Write documen... │                 │ 2026-01-07 10:31:00 │
└──────┴──────────┴──────────────────┴─────────────────┴─────────────────────┘

doit> /complete 1

[x] Task #1 marked as complete!

doit> /list pending

┌──────┬──────────┬──────────────────┬─────────────────┬─────────────────────┐
│ ID   │ Status   │ Title            │ Description     │ Created             │
├──────┼──────────┼──────────────────┼─────────────────┼─────────────────────┤
│ 2    │ [ ] Todo │ Write documen... │                 │ 2026-01-07 10:31:00 │
└──────┴──────────┴──────────────────┴─────────────────┴─────────────────────┘

doit> /quit
Goodbye! 👋
```

## Requirements

- Python 3.13+
- rich >= 13.7.0
- prompt-toolkit >= 3.0.43

## Development

### Running Tests

```bash
uv run pytest
```

### Code Quality

```bash
# Run linter
uv run ruff check .

# Run type checker
uv run mypy .
```

## Project Structure

```
doit/
├── src/doit/
│   ├── app.py              # Main interactive application
│   ├── models/
│   │   ├── task.py         # Task data model
│   │   └── exceptions.py   # Custom exceptions
│   ├── services/
│   │   └── task_service.py # Business logic
│   └── storage/
│       └── memory.py       # In-memory storage
├── tests/                  # Test suite
├── pyproject.toml          # Project configuration
└── README.md               # This file
```

## Design Philosophy

DoIt is built with simplicity and user experience in mind:

- **Terminal-Native**: Feels like a real terminal application with no TUI frameworks
- **Keyboard-First**: Everything accessible via keyboard shortcuts
- **Beautiful Output**: Rich formatting with colors, borders, and tables
- **Fast**: In-memory storage for instant responses
- **Clean Code**: Modern Python with type hints and clean architecture
- **Claude Code Inspired**: Command-line interface inspired by the best tools

## Windows Users

For the best experience on Windows, use:
- Windows Terminal (recommended)
- PowerShell
- Command Prompt

The application uses ASCII-safe characters to ensure compatibility across all platforms.

## License

MIT License - see LICENSE file for details
