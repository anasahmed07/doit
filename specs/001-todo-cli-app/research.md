# Research: Todo Console Application

**Feature**: 001-todo-cli-app | **Date**: 2026-01-02 | **Status**: Complete

## Overview

This document captures technical decisions, best practices, and alternatives considered for implementing the Todo Console Application. All research aligns with the project constitution and supports the in-memory, CLI-first architecture.

## Technology Decisions

### 1. CLI Framework: Typer

**Decision**: Use Typer as the CLI framework

**Rationale**:
- **Type-based interface**: Leverages Python 3.13+ type hints for automatic argument parsing and validation
- **Automatic help generation**: Generates comprehensive --help text from function signatures and docstrings
- **Rich integration**: Native support for Rich library for beautiful console output
- **Testing support**: Provides CliRunner for easy CLI testing in pytest
- **Modern API**: Cleaner, more Pythonic than argparse or Click
- **Active development**: Well-maintained by the FastAPI creator, aligned with modern Python practices

**Alternatives Considered**:
- **argparse** (stdlib): Verbose, requires manual parsing, no type hints integration. Rejected for poor DX.
- **Click**: Mature and widely-used, but decorator-heavy and less type-safe than Typer. Rejected for inferior type system integration.
- **fire**: Minimal setup but less control over help text and validation. Rejected for insufficient CLI convention support.

**Best Practices**:
- One command per function with type-annotated parameters
- Use `typer.Option()` for flags with sensible defaults
- Use `typer.Argument()` for required positional parameters
- Group related commands using `typer.Typer()` instances
- Leverage Rich console for formatted output

**References**:
- Typer documentation: https://typer.tiangolo.com/
- Type hints in Python 3.13: https://docs.python.org/3.13/library/typing.html

---

### 2. Console Output: Rich

**Decision**: Use Rich for terminal formatting and visual output

**Rationale**:
- **Beautiful tables**: Built-in Table class for clean task list display
- **Color support**: Semantic colors (success=green, error=red) with automatic fallback
- **Status indicators**: Unicode symbols (✓, ○, ✗) with ASCII fallback for limited terminals
- **Console API**: Unified interface for print, errors, and formatting
- **Progress indicators**: Built-in spinners and progress bars for future enhancements
- **Typer integration**: Works seamlessly with Typer's echo system

**Alternatives Considered**:
- **colorama**: Only colors, no tables or advanced formatting. Rejected for limited capabilities.
- **termcolor**: Similar to colorama. Rejected for lack of table support.
- **prettytable**: Tables only, no color or modern formatting. Rejected for dated API.
- **ANSI codes directly**: Fragile, no fallback handling. Rejected for maintenance burden.

**Best Practices**:
- Use `Console()` instance for all output
- Define color theme constants (complete=green, pending=yellow, error=red)
- Implement ASCII fallback mode for terminals without Unicode
- Use `Table` for list views with consistent column widths
- Send errors to stderr via `console.print(..., err=True)`

**References**:
- Rich documentation: https://rich.readthedocs.io/
- Rich with Typer: https://typer.tiangolo.com/tutorial/printing/#rich

---

### 3. Data Storage: In-Memory

**Decision**: Use Python dict for in-memory task storage

**Rationale**:
- **Spec requirement**: Explicitly states "in-memory storage acceptable"
- **Simplicity**: No file I/O, JSON parsing, or error handling for Phase 1
- **Performance**: O(1) lookup by task ID, O(n) iteration for list views
- **Foundation**: Storage abstraction layer allows future file/DB backend swap
- **Testing**: Easy to mock and reset between tests

**Architecture**:
```python
# storage/memory.py
class MemoryStorage:
    def __init__(self):
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, task: Task) -> Task: ...
    def get(self, task_id: int) -> Task | None: ...
    def get_all(self) -> list[Task]: ...
    def update(self, task: Task) -> None: ...
    def delete(self, task_id: int) -> bool: ...
```

**Future Path to Persistence**:
1. Create `storage/file.py` implementing same interface
2. Use JSON for human-readable storage
3. Implement atomic writes (write temp file, rename)
4. Add schema versioning for migrations
5. No changes to services or CLI layers

**Best Practices**:
- Storage interface (Protocol/ABC) for easy backend swapping
- Use integer IDs (sequential, starting at 1)
- Return copies of tasks, not direct references
- Raise custom exceptions for not-found errors

**References**:
- Python dict performance: https://wiki.python.org/moin/TimeComplexity
- Structural subtyping (Protocol): https://docs.python.org/3.13/library/typing.html#typing.Protocol

---

### 4. Testing Strategy: pytest + Typer Testing

**Decision**: Use pytest with Typer's CliRunner for comprehensive testing

**Rationale**:
- **Constitution requirement**: TDD mandatory, need robust test framework
- **pytest**: Industry standard, excellent fixture system, comprehensive assertions
- **CliRunner**: Typer's built-in test utility for simulating CLI invocations
- **Coverage**: pytest-cov integration for enforcing 90% coverage threshold
- **Fixtures**: Reusable test data and storage instances

**Test Structure**:
```python
# Unit tests (isolated components)
tests/unit/
  test_task_model.py       # Task validation, field constraints
  test_memory_storage.py   # CRUD operations, ID generation
  test_task_service.py     # Business logic, error handling

# Integration tests (CLI + services)
tests/integration/
  test_cli_commands.py     # End-to-end command execution
```

**Key Testing Patterns**:
- **Fixtures**: `memory_storage`, `sample_tasks`, `cli_runner`
- **Parametrize**: Test multiple inputs with `@pytest.mark.parametrize`
- **Mocking**: Mock Rich console for output verification
- **CliRunner**: Test full CLI flows with input/output capture

**Best Practices**:
- Test files mirror source structure (`test_task.py` for `task.py`)
- One test class per source class
- Descriptive test names: `test_add_task_with_empty_title_raises_error`
- Arrange-Act-Assert pattern in all tests
- Test edge cases explicitly (empty strings, unicode, large IDs)

**References**:
- pytest documentation: https://docs.pytest.org/
- Typer testing: https://typer.tiangolo.com/tutorial/testing/

---

### 5. Code Quality Tools

**Decision**: Use Ruff (linting + formatting) and Mypy (type checking)

**Rationale**:
- **Ruff**: Fast (written in Rust), combines linting and formatting in one tool
  - Replaces: flake8, black, isort, pylint
  - 10-100x faster than alternatives
  - Comprehensive rule set (pycodestyle, pyflakes, isort, etc.)
- **Mypy**: Strict static type checking for Python
  - Catches type errors before runtime
  - Enforces type hint usage (required by constitution)
  - Integrates with editors for real-time feedback

**Configuration** (`pyproject.toml`):
```toml
[tool.ruff]
line-length = 100
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "UP", "S", "B", "A", "C4", "PT"]
ignore = []

[tool.mypy]
python_version = "3.13"
strict = true
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

**Best Practices**:
- Run `ruff check .` before commit (catches errors)
- Run `ruff format .` before commit (consistent style)
- Run `mypy src/` before commit (type safety)
- Configure pre-commit hooks to automate
- Use `# type: ignore` sparingly with justification comments

**Alternatives Considered**:
- **Black + flake8 + isort**: Separate tools, slower, more config. Rejected for Ruff's unified approach.
- **Pylint**: Slower, more opinionated. Rejected for performance and Ruff's modern rule set.

**References**:
- Ruff documentation: https://docs.astral.sh/ruff/
- Mypy documentation: https://mypy.readthedocs.io/

---

### 6. Dependency Management: UV

**Decision**: Use UV for package management and virtual environments

**Rationale**:
- **Speed**: 10-100x faster than pip for dependency resolution and installation
- **Modern**: Supports latest pyproject.toml standards
- **Reliability**: Better dependency resolver than pip (fewer conflicts)
- **Developer experience**: Single tool for venvs, installs, and lock files
- **Constitution alignment**: Specified in technology stack standards

**Project Setup**:
```bash
# Initialize project
uv init --name doit --python 3.13

# Add dependencies
uv add typer rich
uv add --dev pytest pytest-cov mypy ruff

# Activate environment
uv venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows

# Install and run
uv sync
uv run pytest
```

**Best Practices**:
- Commit `pyproject.toml` and `uv.lock` to version control
- Use `uv add` instead of manual pyproject.toml edits
- Separate dev dependencies with `--dev` flag
- Pin Python version: `requires-python = ">=3.13"`

**References**:
- UV documentation: https://docs.astral.sh/uv/

---

### 7. Task ID Strategy

**Decision**: Sequential integer IDs starting at 1, auto-incremented

**Rationale**:
- **User-friendly**: Easy to type and remember (1, 2, 3 vs. UUIDs)
- **Short**: Fits in terminal width without truncation
- **Predictable**: Users can anticipate next ID
- **Sufficient scope**: Integer range exceeds any reasonable single-session task count
- **In-memory only**: No need for globally unique IDs (no persistence)

**Implementation**:
- Storage layer maintains `_next_id` counter
- Increment on each task creation
- IDs never reused within a session (even after deletion)
- Reset to 1 when application restarts

**Future Consideration**:
When adding file persistence, evaluate:
- Persist highest ID to maintain sequence across sessions
- Or switch to timestamp-based IDs for chronological sorting
- Or use UUIDs if multi-device sync is planned

**Best Practices**:
- Validate ID is positive integer in CLI layer
- Return specific error for non-existent IDs
- Don't expose internal storage details to users

---

### 8. Error Handling Strategy

**Decision**: Custom exceptions with user-friendly CLI error messages

**Rationale**:
- **FR-008 requirement**: Clear, user-friendly error messages
- **SC-006 target**: 90% of errors self-correctable without documentation
- **Layered approach**: Technical exceptions at storage/service layers, friendly messages at CLI layer

**Exception Hierarchy**:
```python
# models/exceptions.py
class DoitError(Exception):
    """Base exception for all doit errors"""

class ValidationError(DoitError):
    """Task validation failed (empty title, etc.)"""

class TaskNotFoundError(DoitError):
    """Task ID does not exist"""

class StorageError(DoitError):
    """Storage operation failed (future: file I/O)"""
```

**CLI Error Handling Pattern**:
```python
try:
    task = task_service.get(task_id)
except TaskNotFoundError:
    console.print(f"[red]Error:[/red] Task {task_id} not found.", err=True)
    console.print("[dim]Use 'doit list' to see all tasks.[/dim]", err=True)
    raise typer.Exit(1)
```

**Best Practices**:
- Always include actionable suggestion in error message
- Use Rich markup for visual hierarchy (red for error, dim for hint)
- Exit with non-zero code (1) for errors
- Log exceptions at service layer for debugging
- Test error paths explicitly in integration tests

---

## Architecture Decisions

### Layered Architecture

**Decision**: Four-layer architecture (Models → Storage → Services → CLI)

**Layer Responsibilities**:

1. **Models** (`models/task.py`):
   - Data structures and validation
   - No business logic or I/O
   - Immutable where possible (dataclasses with frozen=True)

2. **Storage** (`storage/memory.py`):
   - CRUD operations on data store
   - ID generation and uniqueness
   - Low-level data access only

3. **Services** (`services/task_service.py`):
   - Business logic and validation
   - Orchestrates storage operations
   - Raises domain exceptions

4. **CLI** (`cli/main.py`, `cli/commands.py`):
   - User interaction and formatting
   - Error message presentation
   - Translates between CLI args and service calls

**Benefits**:
- **Testability**: Each layer tested independently
- **Separation of concerns**: Changes isolated to appropriate layer
- **Extensibility**: Swap storage backend without touching CLI
- **Type safety**: Well-defined interfaces between layers

**Trade-offs**:
- More files and indirection than "flat" structure
- Justified by: Constitution Principle V (maintainability) and future file persistence

---

## Performance Considerations

### In-Memory Performance

**Expected scale**: 1,000 tasks (per SC-004)

**Operations & Complexity**:
- Add task: O(1) - dict insert
- Get by ID: O(1) - dict lookup
- List all: O(n) - iterate all tasks, sort by creation time
- Update: O(1) - dict lookup + update
- Delete: O(1) - dict pop

**Bottlenecks**:
- Rich Table rendering: O(n) for 1,000 rows (negligible ~10ms)
- Terminal output: Actual bottleneck at large counts (> 10,000 rows)

**Optimizations**:
- Not needed for 1,000 tasks
- If needed later: pagination, filtering, indexing

**Constitution alignment**: Performance goals easily met (<2s for any operation)

---

## Summary

All technical decisions align with constitution principles and spec requirements:

✅ **TDD**: pytest + coverage tools support test-first development
✅ **CLI-First**: Typer + Rich provide professional CLI experience
✅ **Data Integrity**: Validated models + storage abstraction (in-memory Phase 1)
✅ **UX Excellence**: Rich formatting + helpful errors
✅ **Code Quality**: Ruff + Mypy + type hints + modular architecture
✅ **Simplicity**: In-memory storage, no premature persistence/auth/multi-user

**Phase 1 Implementation Ready**: All unknowns resolved, best practices documented, architecture defined. Proceed to Phase 1 (data model & contracts).
