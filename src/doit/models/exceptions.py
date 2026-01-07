"""Domain exceptions for the doit application."""


class DoitError(Exception):
    """Base exception for all doit application errors."""

    pass


class ValidationError(DoitError):
    """Task validation failed (empty title, length exceeded, etc.)."""

    pass


class TaskNotFoundError(DoitError):
    """Task ID does not exist in storage."""

    def __init__(self, task_id: int) -> None:
        """Initialize TaskNotFoundError.

        Args:
            task_id: The ID of the task that was not found.
        """
        self.task_id = task_id
        super().__init__(f"Task {task_id} not found")


class StorageError(DoitError):
    """Storage operation failed (future: file I/O errors)."""

    pass
