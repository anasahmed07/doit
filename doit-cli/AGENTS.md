# AGENTS.md

This file provides guidance to AI agents (Claude, Gemini, etc.) when working with code in this repository.

## Commands

- **Install Dependencies**: `uv sync` (add `--extra dev` for development tools)
- **Run App**: `uv run doit` (entry point: `src/doit/app.py`)
- **Run Tests**: `uv run pytest`
  - Single file: `uv run pytest tests/unit/test_task_service.py`
  - With coverage: `uv run pytest --cov=src/doit`
- **Lint**: `uv run ruff check .`
- **Format**: `uv run ruff format .`
- **Type Check**: `uv run mypy src/doit`
- **All Checks**: `uv run ruff check . && uv run mypy src/doit && uv run pytest`

## Architecture

- **Type**: Interactive CLI (REPL) task manager.
- **Tech Stack**: Python 3.13+, `uv` (manager), `rich` (UI), `prompt-toolkit` (interactive input), SQLite.
- **Core Components**:
  - `src/doit/app.py`: Main entry point and REPL loop. Handles UI rendering and user input.
  - `src/doit/models/`: Data structures (e.g., `Task` class) and validation.
  - `src/doit/services/`: Business logic layer (`TaskService`) handling task operations.
  - `src/doit/storage/`: Persistence layer. Supports `memory` and `sqlite` (persisted to `~/.doit/tasks.db`).
- **Design Pattern**: Layered architecture (UI → Service → Storage).
- **Style**: Type-annotated Python code. Uses `ruff` for strict linting/formatting and `mypy` for static analysis.

## Key Files
- `src/doit/app.py`: Main entry point. Contains the `DoItApp` class and UI rendering logic.
- `src/doit/models/task.py`: `Task` dataclass definition and validation.
- `src/doit/storage/sqlite.py`: Database interaction logic.
- `pyproject.toml`: Configuration for build, dependencies, and tools.

## Coding Conventions
- **Type Hints**: All code must be fully typed. Use `mypy` strict mode.
- **Documentation**: Google-style docstrings for all modules, classes, and functions.
- **Formatting**: Adhere to `ruff` defaults (similar to Black). Line length 100.