"""Tests for the SqliteStorage class."""

from datetime import UTC, datetime
from pathlib import Path

import pytest

from doit.models.exceptions import TaskNotFoundError
from doit.models.task import Task
from doit.storage.sqlite import SqliteStorage


@pytest.fixture
def storage(tmp_path: Path) -> SqliteStorage:
    """Create a fresh SqliteStorage instance for each test using a temporary file."""
    db_path = tmp_path / "test_tasks.db"
    return SqliteStorage(db_path)


@pytest.fixture
def sample_task() -> Task:
    """Create a sample task for testing."""
    return Task(
        id=0,  # Will be assigned by storage
        title="Test task",
        description="Test description",
        completed=False,
        created_at=datetime.now(UTC),
    )


def test_sqlite_storage_add_task(storage: SqliteStorage, sample_task: Task) -> None:
    """Test adding a task to storage."""
    added_task = storage.add(sample_task)

    assert added_task.id == 1
    assert added_task.title == "Test task"
    assert added_task.description == "Test description"
    assert added_task.completed is False


def test_sqlite_storage_get_task_by_id(storage: SqliteStorage, sample_task: Task) -> None:
    """Test retrieving a task by ID."""
    added_task = storage.add(sample_task)
    retrieved_task = storage.get(added_task.id)

    assert retrieved_task is not None
    assert retrieved_task.id == added_task.id
    assert retrieved_task.title == added_task.title
    assert retrieved_task.created_at == added_task.created_at


def test_sqlite_storage_get_all_tasks_sorted(storage: SqliteStorage) -> None:
    """Test retrieving all tasks sorted by creation time."""
    task1 = Task(id=0, title="First task", created_at=datetime(2024, 1, 1, 10, 0, tzinfo=UTC))
    task2 = Task(id=0, title="Second task", created_at=datetime(2024, 1, 1, 11, 0, tzinfo=UTC))
    task3 = Task(id=0, title="Third task", created_at=datetime(2024, 1, 1, 9, 0, tzinfo=UTC))

    storage.add(task1)
    storage.add(task2)
    storage.add(task3)

    all_tasks = storage.get_all()

    assert len(all_tasks) == 3
    # Should be sorted by created_at (oldest first)
    assert all_tasks[0].title == "Third task"
    assert all_tasks[1].title == "First task"
    assert all_tasks[2].title == "Second task"


def test_sqlite_storage_auto_increment_ids(storage: SqliteStorage) -> None:
    """Test that IDs are auto-incremented sequentially."""
    task1 = Task(id=0, title="Task 1")
    task2 = Task(id=0, title="Task 2")
    task3 = Task(id=0, title="Task 3")

    added1 = storage.add(task1)
    added2 = storage.add(task2)
    added3 = storage.add(task3)

    assert added1.id == 1
    assert added2.id == 2
    assert added3.id == 3


def test_sqlite_storage_get_nonexistent_returns_none(storage: SqliteStorage) -> None:
    """Test that getting a non-existent task returns None."""
    result = storage.get(999)
    assert result is None


def test_sqlite_storage_update_task(storage: SqliteStorage, sample_task: Task) -> None:
    """Test updating an existing task."""
    added_task = storage.add(sample_task)
    added_task.title = "Updated title"
    added_task.completed = True

    storage.update(added_task)

    retrieved_task = storage.get(added_task.id)
    assert retrieved_task is not None
    assert retrieved_task.title == "Updated title"
    assert retrieved_task.completed is True


def test_sqlite_storage_update_nonexistent_raises_error(storage: SqliteStorage) -> None:
    """Test that updating a non-existent task raises TaskNotFoundError."""
    nonexistent_task = Task(id=999, title="Nonexistent")

    with pytest.raises(TaskNotFoundError, match="999"):
        storage.update(nonexistent_task)


def test_sqlite_storage_delete_task(storage: SqliteStorage, sample_task: Task) -> None:
    """Test deleting a task."""
    added_task = storage.add(sample_task)

    result = storage.delete(added_task.id)

    assert result is True
    assert storage.get(added_task.id) is None


def test_sqlite_storage_delete_nonexistent_returns_false(storage: SqliteStorage) -> None:
    """Test that deleting a non-existent task returns False."""
    result = storage.delete(999)
    assert result is False
