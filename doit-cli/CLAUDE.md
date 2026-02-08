# Claude Code Rules - CLI App

## Environment
- **Language**: Python 3.13+
- **UI**: Rich (console formatting), prompt-toolkit (interactive input)
- **Testing**: pytest + pytest-cov
- **Linting**: Ruff (format + lint)
- **Type Checking**: mypy (strict mode)
- **Package Manager**: uv
- **Build System**: Hatchling

## Commands
```bash
uv sync                  # Sync/install dependencies
uv tool install .        # Install CLI globally
doit                     # Run the CLI app
uv run pytest            # Run tests
uv run ruff format .     # Format code
uv run ruff check .      # Lint code
uv run mypy .            # Type checking
```

## Structure
- `src/doit/` - Main application package
  - `app.py` - CLI entry point (`main()`)
  - `models/` - Data models
    - `task.py` - Task model
    - `exceptions.py` - Custom exceptions
  - `services/` - Business logic
    - `task_service.py` - Task operations
  - `storage/` - Data persistence
    - `memory.py` - In-memory storage
    - `sqlite.py` - SQLite storage
- `tests/` - Test suite

## Code Standards
- Ruff line length: 100, target Python 3.13.
- Ruff lint rules: E, F, I, N, UP, S, B, A, C4, PT (S101 allowed in tests).
- mypy: strict mode with `disallow_untyped_defs`.
- Follow TDD: write tests before implementation.
- Place business logic in `services/`, models in `models/`, persistence in `storage/`.
- Entry point: `doit.app:main`.
