"""Manual CLI test script to verify Windows compatibility."""

from typer.testing import CliRunner

from doit.cli.commands import _service, _storage
from doit.cli.main import app

# Clear storage and add test tasks
_storage._tasks.clear()
_storage._next_id = 1

_service.create_task("Buy groceries", "Milk, bread, eggs")
_service.create_task("Complete project report", "")
task3 = _service.create_task("Call dentist", "Schedule appointment")

# Test list command
print("=" * 50)
print("Testing LIST command:")
print("=" * 50)
runner = CliRunner()
result = runner.invoke(app, ["list"])
print(result.stdout)

# Test complete command
print("\n" + "=" * 50)
print("Testing COMPLETE command:")
print("=" * 50)
result = runner.invoke(app, ["complete", "1"])
print(result.stdout)

# Test list again to see completed task
print("\n" + "=" * 50)
print("Testing LIST after completion:")
print("=" * 50)
result = runner.invoke(app, ["list"])
print(result.stdout)

# Test update command
print("\n" + "=" * 50)
print("Testing UPDATE command:")
print("=" * 50)
result = runner.invoke(
    app, ["update", "2", "--title", "Updated project report", "--description", "Final version"]
)
print(result.stdout)

# Test delete command
print("\n" + "=" * 50)
print("Testing DELETE command:")
print("=" * 50)
result = runner.invoke(app, ["delete", "3"])
print(result.stdout)

# Test final list
print("\n" + "=" * 50)
print("Final LIST:")
print("=" * 50)
result = runner.invoke(app, ["list"])
print(result.stdout)
