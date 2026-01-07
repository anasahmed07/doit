# Data Model: Todo Console Application

**Feature**: 001-todo-cli-app | **Date**: 2026-01-02 | **Status**: Complete

## Overview

This document defines the data structures for the Todo Console Application. The model is intentionally simple, focusing on the core Task entity with validation rules derived from functional requirements in the specification.

## Core Entity: Task

### Description

A Task represents a single todo item that users create, update, complete, and delete through the CLI. Tasks are stored in-memory during a session and include all information needed to display, identify, and track completion status.

### Fields

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| `id` | `int` | Yes | Positive integer, unique | Auto-assigned | Unique identifier for task operations (update, delete, complete) |
| `title` | `str` | Yes | Non-empty, max 500 chars | - | Main task description, displayed prominently |
| `description` | `str` | No | Max 2000 chars | Empty string `""` | Optional detailed information about the task |
| `completed` | `bool` | Yes | - | `False` | Completion status (pending or complete) |
| `created_at` | `datetime` | Yes | - | `datetime.now(UTC)` | Timestamp when task was created (for ordering) |

### Validation Rules

**Derived from Functional Requirements**:

- **FR-001** (title required, description optional):
  - `title` must not be empty string
  - `title` must not be only whitespace
  - `description` can be empty string (default)

- **FR-002** (unique IDs):
  - `id` must be unique across all tasks
  - `id` must be positive integer (≥ 1)
  - `id` auto-assigned by storage layer (sequential)

- **FR-007** (validate non-empty title):
  - Raise `ValidationError` if title is empty or whitespace-only
  - Strip leading/trailing whitespace from title before storage

- **FR-013** (accept special characters and unicode):
  - `title` and `description` support full unicode (UTF-8)
  - No character restrictions (allow emoji, accents, etc.)

### Python Implementation

```python
from dataclasses import dataclass, field
from datetime import datetime, UTC

@dataclass
class Task:
    """
    A todo task with title, optional description, and completion status.

    Attributes:
        id: Unique identifier (auto-assigned by storage)
        title: Task title (required, non-empty)
        description: Optional detailed description
        completed: Completion status (default: False)
        created_at: Creation timestamp (default: now)
    """
    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def __post_init__(self):
        """Validate task fields after initialization."""
        # Normalize title (strip whitespace)
        self.title = self.title.strip()

        # Validate title is non-empty
        if not self.title:
            raise ValidationError("Task title cannot be empty")

        # Validate title length
        if len(self.title) > 500:
            raise ValidationError("Task title cannot exceed 500 characters")

        # Validate description length
        if len(self.description) > 2000:
            raise ValidationError("Task description cannot exceed 2000 characters")

        # Ensure ID is positive
        if self.id < 1:
            raise ValidationError("Task ID must be positive")
```

### State Transitions

Tasks have a simple two-state model:

```
┌─────────┐                    ┌───────────┐
│ Pending │ ──── complete ──→  │ Completed │
│         │ ←─── uncomplete ─  │           │
└─────────┘                    └───────────┘

Initial state: Pending (completed=False)
```

**Operations**:
- **Create**: Initialize with `completed=False`
- **Complete**: Set `completed=True`
- **Uncomplete**: Set `completed=False`
- **Update**: Modify `title` and/or `description` (preserves `completed` state)
- **Delete**: Remove from storage (no state change)

### Relationships

**None** - Tasks are independent entities with no relationships to other entities. Future enhancements might add:
- Categories/Tags (many-to-many)
- Projects (many-to-one)
- Subtasks (hierarchical)

Currently out of scope per spec requirement.

## Storage Schema

### In-Memory (Phase 1)

```python
# storage/memory.py
class MemoryStorage:
    def __init__(self):
        # Primary storage: task_id → Task
        self._tasks: dict[int, Task] = {}

        # ID generator: sequential, starting at 1
        self._next_id: int = 1

    def add(self, task: Task) -> Task:
        """Add task and assign ID."""
        task.id = self._next_id
        self._next_id += 1
        self._tasks[task.id] = task
        return task

    def get(self, task_id: int) -> Task | None:
        """Retrieve task by ID."""
        return self._tasks.get(task_id)

    def get_all(self) -> list[Task]:
        """Retrieve all tasks, sorted by creation time."""
        return sorted(self._tasks.values(), key=lambda t: t.created_at)

    def update(self, task: Task) -> None:
        """Update existing task (must exist)."""
        if task.id not in self._tasks:
            raise TaskNotFoundError(f"Task {task.id} not found")
        self._tasks[task.id] = task

    def delete(self, task_id: int) -> bool:
        """Delete task by ID. Returns True if deleted, False if not found."""
        return self._tasks.pop(task_id, None) is not None
```

**Index**: Single dict keyed by `task_id` for O(1) lookup

**Ordering**: Sort by `created_at` when retrieving all tasks (insertion order)

### File-Based (Future Phase)

```json
{
  "schema_version": "1.0.0",
  "next_id": 5,
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-02T10:30:00Z"
    },
    {
      "id": 2,
      "title": "Write documentation",
      "description": "",
      "completed": true,
      "created_at": "2026-01-02T11:45:00Z"
    }
  ]
}
```

**File Location**: `~/.doit/tasks.json` or `./tasks.json` (configurable)

**Write Strategy**: Atomic writes (write temp file, rename)

**Schema Versioning**: Enables future migrations

## Exceptions

### Domain Exceptions

```python
# models/exceptions.py

class DoitError(Exception):
    """Base exception for all doit application errors."""
    pass

class ValidationError(DoitError):
    """Task validation failed (empty title, length exceeded, etc.)."""
    pass

class TaskNotFoundError(DoitError):
    """Task ID does not exist in storage."""

    def __init__(self, task_id: int):
        self.task_id = task_id
        super().__init__(f"Task {task_id} not found")

class StorageError(DoitError):
    """Storage operation failed (future: file I/O errors)."""
    pass
```

### Exception Handling Flow

```
CLI Layer          Service Layer       Storage Layer       Model Layer
    │                   │                    │                   │
    │──update(id, title)─→                   │                   │
    │                   │──get(id)────────→  │                   │
    │                   │                    │                   │
    │                   │←──────────task──── │                   │
    │                   │                    │                   │
    │                   │──validate────────→ │                   │
    │                   │                    │─→ ValidationError │
    │                   │←─ValidationError── │                   │
    │←─ValidationError── │                    │                   │
    │                   │                    │                   │
    │──display error    │                    │                   │
    │──show suggestion  │                    │                   │
    │──exit(1)          │                    │                   │
```

Exceptions propagate up the stack; CLI layer catches and presents user-friendly messages.

## Type Definitions

### Type Aliases

```python
from typing import Protocol

TaskID = int  # Semantic type for task identifiers

class TaskStorage(Protocol):
    """Protocol defining storage interface (any backend)."""

    def add(self, task: Task) -> Task: ...
    def get(self, task_id: TaskID) -> Task | None: ...
    def get_all(self) -> list[Task]: ...
    def update(self, task: Task) -> None: ...
    def delete(self, task_id: TaskID) -> bool: ...
```

**Rationale**: Protocol allows duck-typing storage backends (memory, file, database) without inheritance.

## Testing Considerations

### Test Data

**Fixtures** (`tests/conftest.py`):

```python
import pytest
from doit.models.task import Task

@pytest.fixture
def sample_task() -> Task:
    """Single task for unit tests."""
    return Task(id=1, title="Test task", description="Test description")

@pytest.fixture
def sample_tasks() -> list[Task]:
    """Multiple tasks for list/filter tests."""
    return [
        Task(id=1, title="First task", completed=False),
        Task(id=2, title="Second task", completed=True),
        Task(id=3, title="Third task", completed=False),
    ]

@pytest.fixture
def memory_storage():
    """Fresh storage instance for each test."""
    from doit.storage.memory import MemoryStorage
    return MemoryStorage()
```

### Edge Cases

**Validation tests** (`tests/unit/test_task_model.py`):
- Empty title (should raise `ValidationError`)
- Whitespace-only title (should raise `ValidationError`)
- Title exactly 500 chars (should pass)
- Title 501 chars (should raise `ValidationError`)
- Description exactly 2000 chars (should pass)
- Description 2001 chars (should raise `ValidationError`)
- Unicode in title/description (should pass)
- Emoji in title/description (should pass)
- Negative ID (should raise `ValidationError`)
- Zero ID (should raise `ValidationError`)

**Storage tests** (`tests/unit/test_memory_storage.py`):
- Add task increments ID correctly
- Get non-existent ID returns None
- Update non-existent ID raises `TaskNotFoundError`
- Delete non-existent ID returns False
- Get all returns sorted by created_at

## Summary

**Data Model Status**: ✅ Complete

**Entities**: 1 (Task)

**Validation Rules**: 6 constraints from functional requirements

**Storage Interface**: Defined with Protocol for future backend swapping

**Ready for**: Contract definition (CLI commands) and task breakdown
