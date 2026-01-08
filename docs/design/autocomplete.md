# Autocomplete Improvements

## Changes Made

### 1. Improved Command Completer

**Previous Behavior:**
- Autocomplete list would disappear as you typed
- Commands would execute immediately on Enter
- No template insertion

**New Behavior:**
- Autocomplete list **filters as you type**
  - Type `/` → Shows all 10 commands
  - Type `/a` → Shows only `/add`
  - Type `/co` → Shows only `/complete`
- When you select a command (Enter or Tab), it inserts the **command template** with a space
- Your cursor is positioned **after the space**, ready to type arguments
- The command only executes when you press Enter **after** typing arguments

### 2. Smart Filtering

The completer now:
- Only shows completions when typing the command (before any space)
- Hides completions once you start typing arguments (after the first space)
- Filters based on what you've typed so far

### 3. Command Templates with Flags

Each command now has a detailed template with placeholders and flags:
- `/add "<title>" -d "<description>"` - Full task creation template with optional description flag
- `/list [all|pending|completed]` - List with filter options shown
- `/complete <id>` - Shows ID placeholder
- `/uncomplete <id>` - Shows ID placeholder
- `/delete <id>` - Shows ID placeholder
- `/update <id> -t "<new title>" -d "<new description>"` - Full update template with optional flags
- `/help` - No arguments needed
- `/clear` - No arguments needed
- `/quit` - No arguments needed
- `/exit` - No arguments needed

**Flags are optional** - you can use:
- `/add "Task title"` (without `-d`)
- `/update 1 -t "New title"` (only title)
- `/update 1 -d "New description"` (only description)

## How It Works

### Example Flow:

1. **User types:** `/`
   ```
   doit> /
         ↓ Shows dropdown
         /add          Add a new task
         /list         List all tasks
         /complete     Mark a task as complete
         ...
   ```

2. **User types:** `/a`
   ```
   doit> /a
         ↓ Filtered dropdown
         /add          Add a new task
   ```

3. **User presses:** Enter or Tab
   ```
   doit> /add "<title>" -d "<description>"
         ↑ Full template inserted with placeholders!
   ```

4. **User edits:** Replaces placeholders and presses Enter
   ```
   doit> /add "Buy milk" -d "2% organic"
         ↓ Executes the command with parsed flags
   ```

## Technical Implementation

### CommandCompleter Class

```python
class CommandCompleter(Completer):
    COMMANDS = {
        "/add": {"desc": "Add a new task", "template": "/add "},
        # ... other commands
    }

    def get_completions(self, document, complete_event):
        # 1. Check if text starts with /
        # 2. Check if we're still typing the command (no space yet)
        # 3. Filter commands that match what's typed
        # 4. Return completions with templates
```

### Key Features:

- **Filters based on prefix matching:** `command.startswith(current_text)`
- **Template insertion:** Returns `info["template"]` instead of just the command
- **Smart positioning:** Uses `start_position=-len(current_text)` to replace what's typed
- **Context-aware:** Only completes before the first space

## Benefits

1. **Better UX:** Autocomplete behaves like modern IDEs
2. **Faster typing:** Reduces keystrokes with Tab/Enter selection
3. **Clearer intent:** Shows command descriptions in dropdown
4. **Less errors:** Template ensures correct format

## Testing

Run the test script to see autocomplete in action:

```bash
uv run python test_autocomplete.py
```

Or test directly in the app:

```bash
uv run doit
```

Try these sequences:
- Type `/` then wait - see all commands
- Type `/a` - see only `/add`
- Press Tab - cycles through matches
- Press Enter - inserts template
- Type arguments and press Enter - executes command
