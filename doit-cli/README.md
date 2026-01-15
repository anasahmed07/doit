# DoIt - CLI

> A modern, beautiful command-line task manager built with Python 3.13+

DoIt is a lightweight, in-memory task management application featuring an elegant terminal interface with smart autocomplete, slash commands, and a polished user experience inspired by modern CLI tools.

![Python](https://img.shields.io/badge/python-3.13+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🎨 **Beautiful Terminal UI** - Rich colors, panels, and formatted output
- ⚡ **Smart Autocomplete** - Tab completion with command templates and placeholders
- 💬 **Slash Commands** - Intuitive `/command` syntax for all operations
- 🚀 **Lightning Fast** - In-memory storage for instant responses
- 🎯 **Interactive Mode** - Arrow key navigation and visual task selection
- 🌈 **Gradient Logo** - Eye-catching ASCII art with color gradients
- 📊 **Real-time Stats** - Live task counts in the bottom toolbar
- ✅ **Full CRUD** - Create, read, update, delete, and toggle tasks

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd doit

# Install dependencies with uv (recommended)
uv sync

# Or with pip
pip install -e .
```

### Run the Application

```bash
doit
```

You'll see a beautiful hero screen with the DoIt logo, tips, and stats. Start typing commands!

## 📖 Usage

### Command Autocomplete

DoIt features intelligent autocomplete that makes task management effortless:

**1. Type `/` to see all commands:**
```
doit> /
      ↓ Dropdown shows:
      /add          Add task(s) - /add "<title>" -d "<desc>" OR /add --multi
      /list         List all tasks - /list [all|pending|completed]
      /complete     Toggle task status - /complete [id]
      ...
```

**2. Filter as you type:**
```
doit> /a
      ↓ Only shows:
      /add          Add task(s)
```

**3. Press Enter/Tab to insert template:**
```
doit> /add "<title>" -d "<description>"
      ↑ Full template with placeholders!
```

**4. Replace placeholders and execute:**
```
doit> /add "Buy groceries" -d "Milk, eggs, bread"

Creating task... ⠋

╭────────────────────────────────────────────────╮
│ [x] Task #1 created: Buy groceries            │
╰────────────────────────────────────────────────╯
```

### Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/add "<title>" -d "<desc>"` | Add a new task | `/add "Buy milk" -d "2% organic"` |
| `/add --multi` | Add multiple tasks in one session | `/add --multi` |
| `/list [filter]` | List tasks (all/pending/completed) | `/list pending` |
| `/complete [id]` | Toggle task completion (interactive if no ID) | `/complete` or `/complete 1` |
| `/uncomplete <id>` | Mark task as incomplete | `/uncomplete 1` |
| `/update <id> -t "<title>" -d "<desc>"` | Update task (interactive if no flags) | `/update 1 -t "New title"` |
| `/delete <id>` | Delete a task with confirmation | `/delete 1` |
| `/clear` | Clear screen and show hero | `/clear` |
| `/help` | Show help with all commands | `/help` |
| `/quit` or `/exit` | Exit application | `/quit` |

### Advanced Features

#### Interactive Task Completion
Run `/complete` without an ID to get an arrow-key navigation interface:
```
Toggle Task Status
↑↓: navigate | Space: toggle | Enter: save | Esc: cancel

> [✓] #1 Buy groceries - Milk, eggs, bread
  [ ] #2 Write documentation - README updates
  [ ] #3 Fix bug - Login issue
```

#### Multi-Task Creation
Add several tasks at once:
```
doit> /add --multi

Add Multiple Tasks
Enter tasks one at a time. Press Ctrl+D (or Ctrl+Z on Windows) when done.

New Task
Title: Buy groceries
Description (optional): Milk, eggs, bread
✓ Task #1 added

New Task
Title: Write documentation
Description (optional): Update README
✓ Task #2 added
```

#### Flexible Command Syntax
Commands support multiple formats:

```bash
# Full format with both flags
/add "Task title" -d "Description"

# Title only (will prompt for description)
/add "Task title"

# Update title only
/update 1 -t "New title"

# Update description only
/update 1 -d "New description"

# Interactive mode (prompts for everything)
/update 1
```

## 🎨 Interface Showcase

### Hero Screen
```
██████╗   ██████╗  ██╗ ████████╗
██╔══██╗ ██╔═══██╗ ██║ ╚══██╔══╝
██║  ██║ ██║   ██║ ██║    ██║
██║  ██║ ██║   ██║ ██║    ██║
██████╔╝ ╚██████╔╝ ██║    ██║
╚═════╝   ╚═════╝  ╚═╝    ╚═╝

Your Terminal Task Manager

Tips for getting started:
1. Type /add to create a new task
2. Use Tab for autocomplete and command suggestions
3. Type /help for all available commands

╭──────────────────────────────────────────────────╮
│ Tasks: 0 | Pending: 0 | Completed: 0             │
╰──────────────────────────────────────────────────╯
```

### Task List
```
┌────┬──────────┬──────────────────┬──────────────────┬─────────────────────┐
│ ID │ Status   │ Title            │ Description      │ Created             │
├────┼──────────┼──────────────────┼──────────────────┼─────────────────────┤
│ 1  │ Done     │ Buy groceries    │ Milk, eggs...    │ 2026-01-08 10:30:00 │
│ 2  │ Pending  │ Write docs       │                  │ 2026-01-08 10:31:00 │
│ 3  │ Pending  │ Fix bug          │ Login issue      │ 2026-01-08 10:32:00 │
└────┴──────────┴──────────────────┴──────────────────┴─────────────────────┘

╭──────────────────────────────────────────────────╮
│ Tasks: 3 | Pending: 2 | Type /help for commands  │
╰──────────────────────────────────────────────────╯
```

## 🏗️ Project Structure

```
doit/
├── src/doit/
│   ├── cli/
│   │   ├── __init__.py
│   │   └── app.py              # Main application with Rich UI
│   ├── models/
│   │   ├── task.py             # Task data model with validation
│   │   └── exceptions.py       # Custom exception classes
│   ├── services/
│   │   └── task_service.py     # Business logic layer
│   └── storage/
│       └── memory.py           # In-memory storage implementation
├── tests/
│   └── unit/                   # Unit test suite
│       ├── test_task_model.py
│       ├── test_task_service.py
│       ├── test_memory_storage.py
│       ├── test_app.py
│       └── test_autocomplete.py
├── docs/
│   ├── README.md               # Documentation index
│   ├── design/                 # Design documentation
│   │   ├── autocomplete.md     # Autocomplete system
│   │   ├── command-templates.md # Command templates
│   │   └── interface.md         # Interface design
│   └── development/            # Development guides
│       ├── CLAUDE.md           # Claude Code rules
│       └── GEMINI.md           # Gemini CLI rules
├── pyproject.toml              # Project configuration
└── README.md                   # This file
```

## 🛠️ Development

### Prerequisites

- Python 3.13 or higher
- uv (recommended) or pip

### Setup Development Environment

```bash
# Clone the repository
git clone <repository-url>
cd doit

# Install with dev dependencies
uv sync --extra dev
```

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src/doit --cov-report=html

# Run specific test file
uv run pytest tests/unit/test_task_service.py -v
```

**Test Coverage:** 30/30 tests passing ✅

### Code Quality

```bash
# Lint with ruff
uv run ruff check .

# Format with ruff
uv run ruff format .

# Type check with mypy
uv run mypy src/doit

# Run all checks
uv run ruff check . && uv run mypy src/doit && uv run pytest
```

### Dependencies

**Runtime:**
- `rich>=13.7.0` - Terminal formatting and colors
- `prompt-toolkit>=3.0.43` - Interactive prompts and autocomplete

**Development:**
- `pytest>=8.0.0` - Testing framework
- `pytest-cov>=4.1.0` - Coverage reporting
- `mypy>=1.8.0` - Static type checking
- `ruff>=0.2.0` - Fast linting and formatting

## 🎯 Design Philosophy

DoIt is built with these principles:

- **Simplicity First** - Clean, focused interface without bloat
- **Keyboard-Driven** - Everything accessible via keyboard
- **Beautiful Output** - Modern terminal aesthetics with Rich
- **Fast & Lightweight** - In-memory storage for instant responses
- **Developer-Friendly** - Clean architecture, typed Python, 100% test coverage
- **Zero Configuration** - Works out of the box, no setup required

## 🌐 Platform Support

DoIt works on all major platforms:

- ✅ **Windows** - Windows Terminal, PowerShell, CMD
- ✅ **macOS** - Terminal.app, iTerm2, Alacritty
- ✅ **Linux** - Any terminal with 256-color support

**Recommended:**
- Windows: Windows Terminal
- macOS: iTerm2 or default Terminal
- Linux: Alacritty, Kitty, or GNOME Terminal

## 📚 Documentation

- [User Guide](docs/design/interface.md) - Interface features and design
- [Command Templates](docs/design/command-templates.md) - Template system guide
- [Autocomplete](docs/design/autocomplete.md) - How autocomplete works
- [Development Guide](docs/development/CLAUDE.md) - Contributing guidelines

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`uv run pytest`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Claude Code](https://www.anthropic.com/claude/code) CLI interface
- Built with [Rich](https://github.com/Textualize/rich) by Textualize
- Powered by [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit)

---

**Made with ❤️ and Python 3.13+**
