# CLI Commands Contract: Todo Console Application

**Feature**: 001-todo-cli-app | **Date**: 2026-01-02 | **Status**: Complete

## Overview

This document defines the command-line interface contract for the Todo Console Application. All commands follow standard CLI conventions and are implemented using Typer with Rich formatting.

## Application Entry Point

**Command**: `doit`

**Description**: Todo Console Application - manage your tasks from the command line

**Usage**: `doit [OPTIONS] COMMAND [ARGS]...`

**Global Options**:
- `--help`: Show help message and exit
- `--version`: Show application version and exit

**Commands**:
- `add`: Create a new task
- `list`: Display all tasks
- `update`: Modify an existing task
- `delete`: Remove a task
- `complete`: Mark a task as complete
- `uncomplete`: Mark a task as incomplete

## Commands

### 1. Add Task

**Command**: `doit add [OPTIONS] TITLE`

**Description**: Create a new task with a title and optional description

**Arguments**:
- `TITLE` (required, string): Task title (1-500 characters)

**Options**:
- `--description TEXT`, `-d TEXT`: Task description (max 2000 characters)
- `--help`: Show command help

**Functional Requirements**: FR-001, FR-002, FR-007, FR-010, FR-013

**Success Criteria**: SC-001 (add task in under 10 seconds), SC-005 (95% success rate)

**Behavior**:
1. Validate title is non-empty
2. Create Task with auto-assigned ID
3. Store in memory via TaskService
4. Display confirmation with task ID

**Output (Success)**:
```
✓ Task created successfully

  ID: 1
  Title: Buy groceries
  Description: Milk, eggs, bread
  Status: Pending
```

**Output (Error - Empty Title)**:
```
Error: Task title cannot be empty

Try providing a descriptive title like:
  doit add "Buy groceries"
```

**Output (Error - Title Too Long)**:
```
Error: Task title cannot exceed 500 characters (provided: 523)

Try shortening your title or moving details to the description:
  doit add "Buy groceries" --description "Full list of items..."
```

**Examples**:
```bash
# Simple task with title only
doit add "Buy groceries"

# Task with description
doit add "Buy groceries" --description "Milk, eggs, bread"
doit add "Buy groceries" -d "Milk, eggs, bread"

# Task with unicode/emoji
doit add "Review PR #123 ⭐"
```

**Exit Codes**:
- `0`: Task created successfully
- `1`: Validation error (empty title, title too long, description too long)

---

### 2. List Tasks

**Command**: `doit list [OPTIONS]`

**Description**: Display all tasks in a formatted table

**Arguments**: None

**Options**:
- `--all`, `-a`: Show all tasks (default)
- `--pending`, `-p`: Show only pending tasks
- `--completed`, `-c`: Show only completed tasks
- `--help`: Show command help

**Functional Requirements**: FR-003, FR-009, FR-012

**Success Criteria**: SC-002 (display list within 2 seconds), SC-004 (handle 1,000+ tasks)

**Behavior**:
1. Retrieve all tasks from storage
2. Filter by completion status if specified
3. Sort by creation time (oldest first)
4. Format as table with Rich
5. Display empty message if no tasks

**Output (Tasks Exist)**:
```
Todo List (3 tasks)

┌────┬─────────────────────────┬───────────────────┬──────────┐
│ ID │ Title                   │ Description       │ Status   │
├────┼─────────────────────────┼───────────────────┼──────────┤
│ 1  │ Buy groceries           │ Milk, eggs, bread │ ○ Pending│
│ 2  │ Write documentation     │                   │ ✓ Done   │
│ 3  │ Review PR #123          │ Check tests       │ ○ Pending│
└────┴─────────────────────────┴───────────────────┴──────────┘
```

**Output (No Tasks)**:
```
Your todo list is empty!

Add your first task:
  doit add "Your task here"
```

**Output (Filtered - Pending Only)**:
```
Pending Tasks (2 tasks)

┌────┬─────────────────────────┬───────────────────┬──────────┐
│ ID │ Title                   │ Description       │ Status   │
├────┼─────────────────────────┼───────────────────┼──────────┤
│ 1  │ Buy groceries           │ Milk, eggs, bread │ ○ Pending│
│ 3  │ Review PR #123          │ Check tests       │ ○ Pending│
└────┴─────────────────────────┴───────────────────┴──────────┘
```

**Examples**:
```bash
# Show all tasks
doit list
doit list --all
doit list -a

# Show only pending
doit list --pending
doit list -p

# Show only completed
doit list --completed
doit list -c
```

**Exit Codes**:
- `0`: Tasks displayed successfully (including empty list)

---

### 3. Update Task

**Command**: `doit update [OPTIONS] TASK_ID`

**Description**: Modify the title and/or description of an existing task

**Arguments**:
- `TASK_ID` (required, integer): ID of the task to update

**Options**:
- `--title TEXT`, `-t TEXT`: New task title (1-500 characters)
- `--description TEXT`, `-d TEXT`: New task description (max 2000 characters)
- `--help`: Show command help

**Note**: At least one of `--title` or `--description` must be provided

**Functional Requirements**: FR-005, FR-008, FR-010

**Success Criteria**: SC-003 (update in single command), SC-005 (95% success rate)

**Behavior**:
1. Validate TASK_ID is positive integer
2. Retrieve task from storage
3. Validate new title if provided (non-empty, length)
4. Update title and/or description
5. Persist changes
6. Display confirmation

**Output (Success)**:
```
✓ Task updated successfully

  ID: 1
  Title: Buy organic groceries
  Description: Milk, eggs, bread
  Status: Pending
```

**Output (Error - Task Not Found)**:
```
Error: Task 999 not found

Use 'doit list' to see all tasks and their IDs.
```

**Output (Error - No Changes Specified)**:
```
Error: No changes specified

Provide at least one of:
  --title "New title"
  --description "New description"
```

**Output (Error - Empty Title)**:
```
Error: Task title cannot be empty

Provide a non-empty title:
  doit update 1 --title "Buy groceries"
```

**Examples**:
```bash
# Update title only
doit update 1 --title "Buy organic groceries"
doit update 1 -t "Buy organic groceries"

# Update description only
doit update 1 --description "Milk, eggs, bread, cheese"
doit update 1 -d "Milk, eggs, bread, cheese"

# Update both
doit update 1 --title "Buy organic groceries" --description "Full list"
doit update 1 -t "Buy organic groceries" -d "Full list"
```

**Exit Codes**:
- `0`: Task updated successfully
- `1`: Task not found, validation error, or no changes specified

---

### 4. Delete Task

**Command**: `doit delete TASK_ID`

**Description**: Remove a task from the list

**Arguments**:
- `TASK_ID` (required, integer): ID of the task to delete

**Options**:
- `--help`: Show command help

**Functional Requirements**: FR-006, FR-008, FR-010

**Success Criteria**: SC-003 (delete in single command), SC-005 (95% success rate)

**Behavior**:
1. Validate TASK_ID is positive integer
2. Delete task from storage
3. Display confirmation or error

**Output (Success)**:
```
✓ Task 1 deleted successfully

  Title: Buy groceries
```

**Output (Error - Task Not Found)**:
```
Error: Task 999 not found

Use 'doit list' to see all tasks and their IDs.
```

**Examples**:
```bash
# Delete task by ID
doit delete 1
doit delete 42
```

**Exit Codes**:
- `0`: Task deleted successfully
- `1`: Task not found or validation error

---

### 5. Complete Task

**Command**: `doit complete TASK_ID`

**Description**: Mark a task as complete

**Arguments**:
- `TASK_ID` (required, integer): ID of the task to complete

**Options**:
- `--help`: Show command help

**Functional Requirements**: FR-004, FR-008, FR-010

**Success Criteria**: SC-003 (complete in single command), SC-005 (95% success rate)

**Behavior**:
1. Validate TASK_ID is positive integer
2. Retrieve task from storage
3. Set `completed = True`
4. Persist changes
5. Display confirmation

**Output (Success)**:
```
✓ Task 1 marked as complete

  Title: Buy groceries
  Status: ✓ Done
```

**Output (Already Complete)**:
```
✓ Task 1 is already complete

  Title: Buy groceries
  Status: ✓ Done
```

**Output (Error - Task Not Found)**:
```
Error: Task 999 not found

Use 'doit list' to see all tasks and their IDs.
```

**Examples**:
```bash
# Mark task as complete
doit complete 1
doit complete 42
```

**Exit Codes**:
- `0`: Task completed successfully (or already complete)
- `1`: Task not found or validation error

---

### 6. Uncomplete Task

**Command**: `doit uncomplete TASK_ID`

**Description**: Mark a completed task as incomplete (reopen)

**Arguments**:
- `TASK_ID` (required, integer): ID of the task to uncomplete

**Options**:
- `--help`: Show command help

**Functional Requirements**: FR-004, FR-008, FR-010

**Success Criteria**: SC-003 (uncomplete in single command), SC-005 (95% success rate)

**Behavior**:
1. Validate TASK_ID is positive integer
2. Retrieve task from storage
3. Set `completed = False`
4. Persist changes
5. Display confirmation

**Output (Success)**:
```
✓ Task 1 marked as incomplete

  Title: Buy groceries
  Status: ○ Pending
```

**Output (Already Incomplete)**:
```
✓ Task 1 is already incomplete

  Title: Buy groceries
  Status: ○ Pending
```

**Output (Error - Task Not Found)**:
```
Error: Task 999 not found

Use 'doit list' to see all tasks and their IDs.
```

**Examples**:
```bash
# Mark task as incomplete
doit uncomplete 1
doit uncomplete 42
```

**Exit Codes**:
- `0`: Task marked as incomplete successfully (or already incomplete)
- `1`: Task not found or validation error

---

## Error Message Guidelines

All error messages follow this format (per FR-008, SC-006):

```
Error: [Specific problem]

[Actionable suggestion or hint]
```

**Examples**:
- ✅ **Good**: "Error: Task 5 not found\n\nUse 'doit list' to see all tasks."
- ❌ **Bad**: "Error: Invalid task ID"
- ❌ **Bad**: "Task not found" (no suggestion)

**Requirements**:
- Start with "Error: " prefix in red
- One-line problem description
- Blank line separator
- Suggestion in dim text (how to fix or what to try)
- Exit with code 1

## Output Formatting Standards

### Colors (Rich Markup)

- **Success**: `[green]✓[/green]` or `[green]text[/green]`
- **Error**: `[red]Error:[/red]`
- **Pending status**: `[yellow]○ Pending[/yellow]`
- **Complete status**: `[green]✓ Done[/green]`
- **Hints**: `[dim]suggestion text[/dim]`

### Symbols

- **Complete**: `✓` (U+2713)
- **Pending**: `○` (U+25CB)
- **Error**: `×` (U+00D7)

**Fallback**: If terminal doesn't support Unicode, use ASCII:
- Complete: `[x]`
- Pending: `[ ]`
- Error: `X`

### Table Format

Use Rich `Table` with:
- Box style: `box.ROUNDED`
- Header style: `bold cyan`
- Row colors: Alternating for readability
- Column alignment: Left for text, right for IDs

## Help Text

### Application Help

```
$ doit --help

Usage: doit [OPTIONS] COMMAND [ARGS]...

  Todo Console Application - manage your tasks from the command line

Options:
  --version   Show the version and exit.
  --help      Show this message and exit.

Commands:
  add         Create a new task
  list        Display all tasks
  update      Modify an existing task
  delete      Remove a task
  complete    Mark a task as complete
  uncomplete  Mark a task as incomplete
```

### Command Help Example

```
$ doit add --help

Usage: doit add [OPTIONS] TITLE

  Create a new task with a title and optional description

Arguments:
  TITLE  Task title (1-500 characters)  [required]

Options:
  -d, --description TEXT  Task description (max 2000 characters)
  --help                  Show this message and exit.

Examples:
  doit add "Buy groceries"
  doit add "Buy groceries" --description "Milk, eggs, bread"
```

## Accessibility

- **Screen readers**: Use plain text fallbacks for symbols
- **Color blindness**: Don't rely solely on color (use symbols + color)
- **Low vision**: Ensure contrast ratios meet WCAG AA standards

## Testing Contract

### CLI Integration Tests

Each command requires integration tests covering:

1. **Success path**: Valid input → expected output
2. **Validation errors**: Invalid input → error message
3. **Not found errors**: Non-existent ID → error message
4. **Edge cases**: Boundary values (empty, max length, unicode)

**Test framework**: Typer's `CliRunner` with captured stdout/stderr

**Example test structure**:
```python
def test_add_task_success(cli_runner):
    result = cli_runner.invoke(app, ["add", "Test task"])
    assert result.exit_code == 0
    assert "✓ Task created successfully" in result.stdout
    assert "ID: 1" in result.stdout

def test_add_task_empty_title(cli_runner):
    result = cli_runner.invoke(app, ["add", ""])
    assert result.exit_code == 1
    assert "Error: Task title cannot be empty" in result.stderr
```

## Summary

**Commands Defined**: 6 (add, list, update, delete, complete, uncomplete)

**Functional Requirements Covered**: FR-001 through FR-014

**Success Criteria Addressed**: SC-001, SC-002, SC-003, SC-005, SC-006, SC-007, SC-008

**Error Handling**: Comprehensive with actionable suggestions

**Ready for**: Task breakdown and TDD implementation
