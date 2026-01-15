"""SQLite storage implementation for tasks."""

import sqlite3
from datetime import datetime
from pathlib import Path

from doit.models.exceptions import TaskNotFoundError
from doit.models.task import Task


class SqliteStorage:
    """SQLite storage for tasks.

    Persists tasks to a SQLite database file.
    """

    def __init__(self, db_path: str | Path | None = None) -> None:
        """Initialize SqliteStorage.

        Args:
            db_path: Path to the SQLite database file.
                     If None, defaults to ~/.doit/tasks.db
        """
        if db_path is None:
            home = Path.home()
            self.db_dir = home / ".doit"
            self.db_path = self.db_dir / "tasks.db"

            # Ensure directory exists
            if not self.db_dir.exists():
                self.db_dir.mkdir(parents=True, exist_ok=True)
        else:
            self.db_path = Path(db_path)

        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        """Get a database connection with row factory set."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Initialize the database schema."""
        conn = self._get_connection()
        cursor = conn.cursor()

        # Create tasks table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
        """)

        conn.commit()
        conn.close()

    def _row_to_task(self, row: sqlite3.Row) -> Task:
        """Convert a database row to a Task object."""
        return Task(
            id=row["id"],
            title=row["title"],
            description=row["description"],
            completed=bool(row["completed"]),
            created_at=datetime.fromisoformat(row["created_at"]),
        )

    def add(self, task: Task) -> Task:
        """Add a task to storage.

        Args:
            task: The task to add (ID will be overwritten)

        Returns:
            The task with assigned ID
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Store datetime as ISO format string
        created_at_iso = task.created_at.isoformat()

        cursor.execute(
            """
            INSERT INTO tasks (title, description, completed, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (task.title, task.description, task.completed, created_at_iso),
        )

        task.id = cursor.lastrowid
        conn.commit()
        conn.close()

        return task

    def get(self, task_id: int) -> Task | None:
        """Retrieve a task by ID.

        Args:
            task_id: The ID of the task to retrieve

        Returns:
            The task if found, None otherwise
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        conn.close()

        if row:
            return self._row_to_task(row)
        return None

    def get_all(self) -> list[Task]:
        """Retrieve all tasks, sorted by creation time (oldest first).

        Returns:
            List of all tasks sorted by created_at
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # SQLite stores ISO strings which sort correctly chronologically
        cursor.execute("SELECT * FROM tasks ORDER BY created_at")
        rows = cursor.fetchall()
        conn.close()

        return [self._row_to_task(row) for row in rows]

    def update(self, task: Task) -> None:
        """Update an existing task.

        Args:
            task: The task with updated fields

        Raises:
            TaskNotFoundError: If the task ID doesn't exist
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Check if task exists first (to match MemoryStorage behavior of raising error)
        cursor.execute("SELECT 1 FROM tasks WHERE id = ?", (task.id,))
        if not cursor.fetchone():
            conn.close()
            raise TaskNotFoundError(task.id)

        cursor.execute(
            """
            UPDATE tasks
            SET title = ?, description = ?, completed = ?
            WHERE id = ?
            """,
            (task.title, task.description, task.completed, task.id),
        )

        conn.commit()
        conn.close()

    def delete(self, task_id: int) -> bool:
        """Delete a task by ID.

        Args:
            task_id: The ID of the task to delete

        Returns:
            True if task was deleted, False if task didn't exist
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        rows_affected = cursor.rowcount

        conn.commit()
        conn.close()

        return rows_affected > 0
