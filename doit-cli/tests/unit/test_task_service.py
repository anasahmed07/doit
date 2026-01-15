"""Tests for the TaskService class."""

import pytest

from doit.models.exceptions import TaskNotFoundError, ValidationError
from doit.services.task_service import TaskService
from doit.storage.memory import MemoryStorage


@pytest.fixture
def service() -> TaskService:
    """Create a fresh TaskService instance for each test."""
    storage = MemoryStorage()
    return TaskService(storage)


def test_task_service_create_task(service: TaskService) -> None:
    """Test creating a task through the service."""
    task = service.create_task(title="Test task", description="Test description")

    assert task.id == 1
    assert task.title == "Test task"
    assert task.description == "Test description"
    assert task.completed is False


def test_task_service_get_all_tasks(service: TaskService) -> None:
    """Test retrieving all tasks."""
    service.create_task("Task 1")
    service.create_task("Task 2")
    service.create_task("Task 3")

    tasks = service.get_all_tasks()

    assert len(tasks) == 3
    assert tasks[0].title == "Task 1"
    assert tasks[1].title == "Task 2"
    assert tasks[2].title == "Task 3"


def test_task_service_create_validates_title(service: TaskService) -> None:
    """Test that service validates title when creating task."""
    with pytest.raises(ValidationError, match="Task title cannot be empty"):
        service.create_task(title="")

    with pytest.raises(ValidationError, match="Task title cannot be empty"):
        service.create_task(title="   ")


def test_task_service_get_task(service: TaskService) -> None:
    """Test getting a specific task by ID."""
    created_task = service.create_task("Test task")
    retrieved_task = service.get_task(created_task.id)

    assert retrieved_task is not None
    assert retrieved_task.id == created_task.id
    assert retrieved_task.title == "Test task"


def test_task_service_get_nonexistent_task_raises_error(service: TaskService) -> None:
    """Test that getting a non-existent task raises TaskNotFoundError."""
    with pytest.raises(TaskNotFoundError, match="Task 999 not found"):
        service.get_task(999)


def test_task_service_complete_task(service: TaskService) -> None:
    """Test marking a task as complete."""
    task = service.create_task("Test task")
    completed_task = service.complete_task(task.id)

    assert completed_task.completed is True


def test_task_service_uncomplete_task(service: TaskService) -> None:
    """Test marking a task as incomplete."""
    task = service.create_task("Test task")
    service.complete_task(task.id)
    uncompleted_task = service.uncomplete_task(task.id)

    assert uncompleted_task.completed is False


def test_task_service_complete_nonexistent_raises_error(service: TaskService) -> None:
    """Test that completing a non-existent task raises error."""
    with pytest.raises(TaskNotFoundError, match="Task 999 not found"):
        service.complete_task(999)


def test_task_service_update_task(service: TaskService) -> None:
    """Test updating a task."""
    task = service.create_task("Old title", "Old description")
    updated_task = service.update_task(task.id, title="New title", description="New description")

    assert updated_task.title == "New title"
    assert updated_task.description == "New description"


def test_task_service_update_title_only(service: TaskService) -> None:
    """Test updating only the title."""
    task = service.create_task("Old title", "Description")
    updated_task = service.update_task(task.id, title="New title")

    assert updated_task.title == "New title"
    assert updated_task.description == "Description"


def test_task_service_update_description_only(service: TaskService) -> None:
    """Test updating only the description."""
    task = service.create_task("Title", "Old description")
    updated_task = service.update_task(task.id, description="New description")

    assert updated_task.title == "Title"
    assert updated_task.description == "New description"


def test_task_service_update_validates_title(service: TaskService) -> None:
    """Test that update validates the title."""
    task = service.create_task("Valid title")

    with pytest.raises(ValidationError, match="Task title cannot be empty"):
        service.update_task(task.id, title="")


def test_task_service_update_nonexistent_raises_error(service: TaskService) -> None:
    """Test that updating a non-existent task raises error."""
    with pytest.raises(TaskNotFoundError, match="Task 999 not found"):
        service.update_task(999, title="New title")


def test_task_service_delete_task(service: TaskService) -> None:
    """Test deleting a task."""
    task = service.create_task("Test task")
    service.delete_task(task.id)

    with pytest.raises(TaskNotFoundError):
        service.get_task(task.id)


def test_task_service_delete_nonexistent_raises_error(service: TaskService) -> None:
    """Test that deleting a non-existent task raises error."""
    with pytest.raises(TaskNotFoundError, match="Task 999 not found"):
        service.delete_task(999)
