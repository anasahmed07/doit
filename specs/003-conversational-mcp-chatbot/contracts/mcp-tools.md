# MCP Tools Contract

**Date**: 2026-02-08
**Feature**: 003-conversational-mcp-chatbot

All tools are exposed via FastMCP on the MCP server. Each tool receives the authenticated `user_id` via middleware context (not as a parameter visible to the LLM).

## Task Tools

### list_tasks
- **Description**: List all tasks in a project, optionally filtered by status
- **Parameters**:
  - `project_name` (str, optional): Project name. Defaults to the user's default project.
  - `status` (str, optional): Filter by status — "TODO", "IN_PROGRESS", "DONE"
- **Returns**: Formatted list of tasks with status, priority, content, and due date

### create_task
- **Description**: Create a new task in a project
- **Parameters**:
  - `content` (str, required): Task description
  - `project_name` (str, optional): Project name. Defaults to the user's default project.
  - `priority` (str, optional): "LOW", "MEDIUM", "HIGH". Default "MEDIUM".
  - `due_date` (str, optional): Due date in natural language or ISO format
- **Returns**: Confirmation with task details

### update_task
- **Description**: Update an existing task's status, content, priority, or due date
- **Parameters**:
  - `task_content` (str, required): Current task content to identify the task
  - `project_name` (str, optional): Project name to narrow search
  - `status` (str, optional): New status
  - `new_content` (str, optional): New task content
  - `priority` (str, optional): New priority
  - `due_date` (str, optional): New due date
- **Returns**: Confirmation with updated task details

### delete_task
- **Description**: Delete a task
- **Parameters**:
  - `task_content` (str, required): Task content to identify the task
  - `project_name` (str, optional): Project name to narrow search
- **Returns**: Confirmation of deletion

## Note Tools

### list_notes
- **Description**: List all notes, optionally filtered by category
- **Parameters**:
  - `category_name` (str, optional): Filter by category name
- **Returns**: Formatted list of notes with title, preview, and category

### create_note
- **Description**: Create a new note
- **Parameters**:
  - `title` (str, optional): Note title
  - `content` (str, optional): Note content (markdown)
  - `category_name` (str, optional): Category name to assign
- **Returns**: Confirmation with note details

### update_note
- **Description**: Update an existing note
- **Parameters**:
  - `note_title` (str, required): Note title to identify the note
  - `new_title` (str, optional): New title
  - `new_content` (str, optional): New content
  - `category_name` (str, optional): New category
- **Returns**: Confirmation with updated note details

### delete_note
- **Description**: Delete a note
- **Parameters**:
  - `note_title` (str, required): Note title to identify the note
- **Returns**: Confirmation of deletion

## Project Tools

### list_projects
- **Description**: List all projects with task counts
- **Parameters**: None
- **Returns**: Formatted list of projects with name and task count breakdown

### create_project
- **Description**: Create a new project
- **Parameters**:
  - `name` (str, required): Project name
- **Returns**: Confirmation with project details

### update_project
- **Description**: Update a project name
- **Parameters**:
  - `project_name` (str, required): Current project name
  - `new_name` (str, required): New project name
- **Returns**: Confirmation with updated project details

## Category Tools

### list_categories
- **Description**: List all note categories
- **Parameters**: None
- **Returns**: Formatted list of categories with name and color

### create_category
- **Description**: Create a new note category
- **Parameters**:
  - `name` (str, required): Category name
  - `color` (str, optional): Hex color code (e.g., "#FF0000"). Default "#000000".
- **Returns**: Confirmation with category details

### delete_category
- **Description**: Delete a note category
- **Parameters**:
  - `category_name` (str, required): Category name to delete
- **Returns**: Confirmation of deletion

## Dashboard Tools

### get_dashboard_summary
- **Description**: Get a summary of the user's productivity dashboard
- **Parameters**: None
- **Returns**: Total projects, active tasks, completed tasks, total notes
