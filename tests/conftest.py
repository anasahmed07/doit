"""Pytest configuration and shared fixtures."""

from datetime import UTC, datetime

import pytest


@pytest.fixture
def sample_task_data() -> dict[str, str | bool]:
    """Sample task data for testing."""
    return {
        "title": "Test task",
        "description": "Test description",
        "completed": False,
    }


@pytest.fixture
def current_timestamp() -> datetime:
    """Current timestamp for testing."""
    return datetime.now(UTC)
