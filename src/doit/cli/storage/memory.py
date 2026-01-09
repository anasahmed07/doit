"""In-memory storage implementation for tasks."""

from doit.cli.models.exceptions import TaskNotFoundError
from doit.cli.models.task import Task


class MemoryStorage:
    """In-memory storage for tasks using a dictionary.

    This storage implementation keeps all tasks in memory during the session.
    Task IDs are auto-incremented starting from 1.
    """

    def __init__(self) -> None:
        """Initialize MemoryStorage with empty task dictionary."""
        self._tasks: dict[int, Task] = {}
        self._next_id: int = 1

    def add(self, task: Task) -> Task:
        """Add a task to storage and assign it a unique ID.

        Args:
            task: The task to add (ID will be overwritten)

        Returns:
            The task with assigned ID
        """
        task.id = self._next_id
        self._next_id += 1
        self._tasks[task.id] = task
        return task

    def get(self, task_id: int) -> Task | None:
        """Retrieve a task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The task if found, None otherwise
        """
        return self._tasks.get(task_id)

    def get_all(self) -> list[Task]:
        """Retrieve all tasks, sorted by creation time (oldest first).

        Returns:
            List of all tasks sorted by created_at
        """
        return sorted(self._tasks.values(), key=lambda t: t.created_at)

    def update(self, task: Task) -> None:
        """Update an existing task.

        Args:
            task: The task with updated fields

        Raises:
            TaskNotFoundError: If the task ID doesn't exist
        """
        if task.id not in self._tasks:
            raise TaskNotFoundError(task.id)
        self._tasks[task.id] = task

    def delete(self, task_id: int) -> bool:
        """Delete a task by ID.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if task was deleted, False if task didn't exist
        """
        if task_id in self._tasks:
            del self._tasks[task_id]
            return True
        return False
