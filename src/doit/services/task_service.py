"""Business logic for task operations."""

from doit.models.exceptions import TaskNotFoundError
from doit.models.task import Task
from doit.storage.memory import MemoryStorage


class TaskService:
    """Service layer for task operations.

    Handles business logic and orchestrates storage operations.
    """

    def __init__(self, storage: MemoryStorage) -> None:
        """Initialize TaskService with a storage backend.

        Args:
            storage: The storage implementation to use
        """
        self._storage = storage

    def create_task(self, title: str, description: str = "") -> Task:
        """Create a new task.

        Args:
            title: Task title (required, non-empty)
            description: Optional task description

        Returns:
            The created task with assigned ID

        Raises:
            ValidationError: If title is invalid
        """
        task = Task(id=0, title=title, description=description)
        return self._storage.add(task)

    def get_task(self, task_id: int) -> Task:
        """Get a task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self._storage.get(task_id)
        if task is None:
            raise TaskNotFoundError(task_id)
        return task

    def get_all_tasks(self) -> list[Task]:
        """Get all tasks, sorted by creation time.

        Returns:
            List of all tasks
        """
        return self._storage.get_all()

    def complete_task(self, task_id: int) -> Task:
        """Mark a task as complete.

        Args:
            task_id: The ID of the task to complete

        Returns:
            The updated task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self.get_task(task_id)
        task.completed = True
        self._storage.update(task)
        return task

    def uncomplete_task(self, task_id: int) -> Task:
        """Mark a task as incomplete.

        Args:
            task_id: The ID of the task to uncomplete

        Returns:
            The updated task

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        task = self.get_task(task_id)
        task.completed = False
        self._storage.update(task)
        return task

    def update_task(
        self, task_id: int, title: str | None = None, description: str | None = None
    ) -> Task:
        """Update a task's title and/or description.

        Args:
            task_id: The ID of the task to update
            title: New title (optional)
            description: New description (optional)

        Returns:
            The updated task

        Raises:
            TaskNotFoundError: If task doesn't exist
            ValidationError: If title is invalid
        """
        task = self.get_task(task_id)

        if title is not None:
            task.title = title
            # Re-validate after updating title
            task.__post_init__()

        if description is not None:
            task.description = description

        self._storage.update(task)
        return task

    def delete_task(self, task_id: int) -> None:
        """Delete a task.

        Args:
            task_id: The ID of the task to delete

        Raises:
            TaskNotFoundError: If task doesn't exist
        """
        # Verify task exists first
        self.get_task(task_id)
        self._storage.delete(task_id)
