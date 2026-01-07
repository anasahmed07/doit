"""Integration tests for CLI commands."""

import pytest
from typer.testing import CliRunner

from doit.cli.commands import _service, _storage
from doit.cli.main import app


@pytest.fixture(autouse=True)
def reset_storage():
    """Reset storage before each test."""
    _storage._tasks.clear()
    _storage._next_id = 1
    yield
    _storage._tasks.clear()
    _storage._next_id = 1


@pytest.fixture
def runner():
    """Create a CLI runner."""
    return CliRunner()


def test_cli_add_task_with_description(runner: CliRunner) -> None:
    """Test adding a task with title and description."""
    result = runner.invoke(app, ["add", "Buy groceries", "-d", "Milk, eggs, bread"])

    assert result.exit_code == 0
    assert "Task created successfully" in result.stdout
    assert "Buy groceries" in result.stdout
    assert "Milk, eggs, bread" in result.stdout
    assert "Pending" in result.stdout


def test_cli_add_task_without_description(runner: CliRunner) -> None:
    """Test adding a task with only a title."""
    result = runner.invoke(app, ["add", "Complete project report"])

    assert result.exit_code == 0
    assert "Task created successfully" in result.stdout


def test_cli_list_all_tasks(runner: CliRunner) -> None:
    """Test listing all tasks."""
    _service.create_task("Task 1", "Description 1")
    _service.create_task("Task 2", "Description 2")

    result = runner.invoke(app, ["list"])

    assert result.exit_code == 0
    assert "Task 1" in result.stdout
    assert "Task 2" in result.stdout


def test_cli_list_empty(runner: CliRunner) -> None:
    """Test listing with no tasks."""
    result = runner.invoke(app, ["list"])

    assert result.exit_code == 0
    assert "todo list is empty" in result.stdout


def test_cli_list_pending_only(runner: CliRunner) -> None:
    """Test filtering for pending tasks only."""
    _service.create_task("Pending task", "")
    task2 = _service.create_task("Completed task", "")
    _service.complete_task(task2.id)

    result = runner.invoke(app, ["list", "--pending"])

    assert result.exit_code == 0
    assert "Pending task" in result.stdout
    assert "Completed task" not in result.stdout


def test_cli_list_completed_only(runner: CliRunner) -> None:
    """Test filtering for completed tasks only."""
    _service.create_task("Pending task", "")
    task2 = _service.create_task("Completed task", "")
    _service.complete_task(task2.id)

    result = runner.invoke(app, ["list", "--completed"])

    assert result.exit_code == 0
    assert "Completed task" in result.stdout
    assert "Pending task" not in result.stdout


def test_cli_complete_task(runner: CliRunner) -> None:
    """Test marking a task as complete."""
    task = _service.create_task("Test task", "")

    result = runner.invoke(app, ["complete", str(task.id)])

    assert result.exit_code == 0
    assert "marked as complete" in result.stdout
    assert "Done" in result.stdout


def test_cli_uncomplete_task(runner: CliRunner) -> None:
    """Test uncompleting a task."""
    task = _service.create_task("Test task", "")
    _service.complete_task(task.id)

    result = runner.invoke(app, ["uncomplete", str(task.id)])

    assert result.exit_code == 0
    assert "marked as incomplete" in result.stdout


def test_cli_update_task(runner: CliRunner) -> None:
    """Test updating a task."""
    task = _service.create_task("Old title", "Old description")

    result = runner.invoke(app, ["update", str(task.id), "-t", "New title"])

    assert result.exit_code == 0
    assert "Task updated successfully" in result.stdout
    assert "New title" in result.stdout


def test_cli_delete_task(runner: CliRunner) -> None:
    """Test deleting a task."""
    task = _service.create_task("Test task", "")

    result = runner.invoke(app, ["delete", str(task.id)])

    assert result.exit_code == 0
    assert "deleted successfully" in result.stdout
    assert "Test task" in result.stdout
