# Template-Based Command System

## Overview

DoIt now features a sophisticated template-based command system with autocomplete that inserts full command templates with placeholders and flags, similar to IDE code snippets.

## How It Works

### 1. Type and Filter
```
doit> /          # Shows all commands
doit> /a         # Filters to /add
```

### 2. Select Template
Press **Enter** or **Tab** to insert the full template:
```
doit> /add "<title>" -d "<description>"
      ↑ Complete template with flags inserted!
```

### 3. Replace Placeholders
Edit the template by replacing placeholders:
```
Before: /add "<title>" -d "<description>"
After:  /add "Buy groceries" -d "Milk, bread, eggs"
```

### 4. Execute
Press **Enter** to execute the command with the parsed flags.

## Command Templates

### /add - Add Task
**Template:** `/add "<title>" -d "<description>"`

**Usage:**
- Full: `/add "Buy milk" -d "2% organic"`
- Title only: `/add "Buy milk"`
- Interactive: `/add` (will prompt for description)

**Flags:**
- `-d "<description>"` - Optional description

### /update - Update Task
**Template:** `/update <id> -t "<new title>" -d "<new description>"`

**Usage:**
- Full: `/update 1 -t "New title" -d "New description"`
- Title only: `/update 1 -t "New title"`
- Description only: `/update 1 -d "New description"`
- Interactive: `/update 1` (will prompt for both)

**Flags:**
- `-t "<title>"` - Optional new title
- `-d "<description>"` - Optional new description

### /list - List Tasks
**Template:** `/list [all|pending|completed]`

**Usage:**
- All tasks: `/list` or `/list all`
- Pending only: `/list pending`
- Completed only: `/list completed`

### /complete - Mark Complete
**Template:** `/complete <id>`

**Usage:** `/complete 1`

### /uncomplete - Mark Incomplete
**Template:** `/uncomplete <id>`

**Usage:** `/uncomplete 1`

### /delete - Delete Task
**Template:** `/delete <id>`

**Usage:** `/delete 1`

### No-argument Commands
- `/help` - Show help
- `/clear` - Clear screen
- `/quit` / `/exit` - Exit application

## Flag Parsing

The application intelligently parses command flags:

### Quoted Values
```bash
/add "Task with spaces" -d "Description with spaces"
```

### Single Flags
```bash
/update 1 -t "Just update title"
/update 1 -d "Just update description"
```

### Mixed Formats
```bash
/add SimpleTask -d "Description"
/add "Quoted Task"
```

### Interactive Fallback
If flags are omitted, the app prompts interactively:
```
doit> /add "Task title"
Enter description (optional, press Enter to skip):
Description: My description
```

## Benefits

1. **Faster Input:** Complete templates reduce typing
2. **Discoverability:** Users see all available flags
3. **Flexibility:** Flags are optional, interactive fallback available
4. **IDE-like Experience:** Similar to code snippet expansion
5. **Less Errors:** Templates show correct syntax

## Implementation Details

### Command Structure
```python
COMMANDS = {
    "/add": {
        "desc": "Add a new task",
        "template": '/add "<title>" -d "<description>"',
        "cursor_offset": 6,  # For future cursor positioning
    },
}
```

### Flag Parsing (Regex)
```python
# Match quoted format: "title" -d "description"
match_quoted = re.match(r'^["\']([^"\']+)["\'](?:\s+-d\s+["\']([^"\']*)["\'])?', args)

# Match unquoted format with flag: title -d description
match_with_flag = re.match(r'^(.+?)\s+-d\s+(.+)$', args)
```

### Autocomplete Integration
Templates are automatically inserted by `prompt_toolkit` when user selects a completion with Enter or Tab.

## Tips for Users

1. **Use Tab to explore:** Press Tab after `/` to see all available commands
2. **Filter as you type:** Type `/up` to quickly find `/update`
3. **Templates are hints:** The placeholders show you what's expected
4. **Flags are optional:** Use what you need, skip the rest
5. **Interactive fallback:** If in doubt, just type the command and press Enter

## Future Enhancements

Potential improvements:
- Cursor positioning at first placeholder (requires custom input handling)
- Tab navigation between placeholders (snippet-style)
- Fuzzy matching for filters (e.g., `pend` matches `pending`)
- Command aliases (e.g., `a` for `add`)
- History-based autocomplete (suggest recent commands)
