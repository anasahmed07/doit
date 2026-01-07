"""Tests for the Task model."""

from datetime import UTC, datetime

import pytest

from doit.models.exceptions import ValidationError
from doit.models.task import Task


def test_task_creation_with_valid_data() -> None:
    """Test creating a task with valid data."""
    task = Task(
        id=1,
        title="Buy groceries",
        description="Milk, eggs, bread",
        completed=False,
        created_at=datetime.now(UTC),
    )
    assert task.id == 1
    assert task.title == "Buy groceries"
    assert task.description == "Milk, eggs, bread"
    assert task.completed is False
    assert isinstance(task.created_at, datetime)


def test_task_validation_empty_title_raises_error() -> None:
    """Test that empty title raises ValidationError."""
    with pytest.raises(ValidationError, match="Task title cannot be empty"):
        Task(
            id=1,
            title="",
            description="Description",
            completed=False,
            created_at=datetime.now(UTC),
        )


def test_task_validation_whitespace_title_raises_error() -> None:
    """Test that whitespace-only title raises ValidationError."""
    with pytest.raises(ValidationError, match="Task title cannot be empty"):
        Task(
            id=1,
            title="   ",
            description="Description",
            completed=False,
            created_at=datetime.now(UTC),
        )


def test_task_validation_title_too_long_raises_error() -> None:
    """Test that title exceeding 500 characters raises ValidationError."""
    long_title = "a" * 501
    with pytest.raises(ValidationError, match="Task title cannot exceed 500 characters"):
        Task(
            id=1,
            title=long_title,
            description="Description",
            completed=False,
            created_at=datetime.now(UTC),
        )


def test_task_validation_description_too_long_raises_error() -> None:
    """Test that description exceeding 2000 characters raises ValidationError."""
    long_description = "a" * 2001
    with pytest.raises(ValidationError, match="Task description cannot exceed 2000 characters"):
        Task(
            id=1,
            title="Title",
            description=long_description,
            completed=False,
            created_at=datetime.now(UTC),
        )


def test_task_unicode_support() -> None:
    """Test that task supports unicode characters."""
    task = Task(
        id=1,
        title="Review PR #123 ⭐",
        description="Check tests ✓ and code 👍",
        completed=False,
        created_at=datetime.now(UTC),
    )
    assert task.title == "Review PR #123 ⭐"
    assert task.description == "Check tests ✓ and code 👍"
