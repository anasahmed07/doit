"""Task data model."""

from dataclasses import dataclass, field
from datetime import UTC, datetime

from doit.cli.models.exceptions import ValidationError


@dataclass
class Task:
    """A todo task with title, optional description, and completion status.

    Attributes:
        id: Unique identifier (auto-assigned by storage)
        title: Task title (required, non-empty, max 500 chars)
        description: Optional detailed description (max 2000 chars)
        completed: Completion status (default: False)
        created_at: Creation timestamp (default: now)
    """

    id: int
    title: str
    description: str = ""
    completed: bool = False
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def __post_init__(self) -> None:
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
