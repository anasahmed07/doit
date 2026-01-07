# Gemini-Style Interface

## Overview

DoIt now features a Gemini CLI-inspired interface with:
- Large ASCII art logo with gradient colors
- Numbered tips for getting started
- Full-width bordered panels
- Status bar with context information
- Loading animations for operations
- Success animations for completed tasks

## Interface Layout

```
   ███           ███████    ███████   ████████  ████████
     ███         ███   ███  ███  ███     ███        ███
       ███      ███     ███ ███  ███     ███        ███
 ███     ███    ███     ███ ███  ███     ███        ███
   ███ ███      ███     ███ ███ ███      ███        ███
     ███        ███     ███ ██████       ███        ███
   ███ ███      ███     ███ ███ ███      ███        ███
     ███        ███     ███ ███  ███     ███        ███
   ███           ███   ███  ███  ███  ████████     ███
 ███              ███████   ███   ███ ████████     ███

Tips for getting started:
1. Type /add to create a new task
2. Use Tab for autocomplete with command templates
3. Type /help for all available commands

╭────────────────────────────────────────────────────────────╮
│ Tasks: 5 | Pending: 3 | Completed: 2                       │
╰────────────────────────────────────────────────────────────╯

╭────────────────────────────────────────────────────────────╮
│ Tasks: 5 | Pending: 3 | Type /help for commands            │
╰────────────────────────────────────────────────────────────╯
╭────────────────────────────────────────────────────────────╮
│ >  Type your command or /help for assistance               │
╰────────────────────────────────────────────────────────────╯
 > /add "Buy milk" -d "2%"

Creating task... ⠋

╭────────────────────────────────────────────────────────────╮
│ [x] Task #1 created: Buy milk                              │
╰────────────────────────────────────────────────────────────╯
```

## Key Features

### 1. Large ASCII Art Logo
- Multi-line ASCII art with gradient colors (cyan → orange → yellow)
- Eye-catching hero section
- Similar to Gemini's mixed character logo style

### 2. Numbered Tips
Instead of paragraph text:
```
Tips for getting started:
1. Type /add to create a new task
2. Use Tab for autocomplete with command templates
3. Type /help for all available commands
```

### 3. Full-Width Panels
All panels now span the full terminal width:
- Stats panel at top
- Input box
- Status bar/footer
- Success/error messages

### 4. Status Bar Footer
Before each prompt, shows:
- Total tasks
- Pending tasks
- Helpful hint
```
╭────────────────────────────────────────────────────────────╮
│ Tasks: 5 | Pending: 3 | Type /help for commands            │
╰────────────────────────────────────────────────────────────╯
```

### 5. Loading Animations
Operations now show spinner animations:
- "Creating task..." with dots spinner
- "Marking task as complete..." with dots spinner
- Brief pause for visual feedback

### 6. Success Animations
Success messages feature:
- Full-width green-bordered panels
- Checkmark with blink effect: `[x]` ✨
- Clear, formatted success text

## Animation Examples

### Task Creation
```
 > /add "Buy groceries" -d "Milk, eggs, bread"

Creating task... ⠋

╭────────────────────────────────────────────────────────────╮
│ [x] Task #1 created: Buy groceries                         │
╰────────────────────────────────────────────────────────────╯
```

### Task Completion
```
 > /complete 1

Marking task as complete... ⠙

╭────────────────────────────────────────────────────────────╮
│ [x] Task #1 marked as complete!                            │
╰────────────────────────────────────────────────────────────╯
```

## Color Scheme

Inspired by Gemini's gradient colors:

- **Logo**: Cyan → Orange → Yellow gradient
- **Borders**: Orange for input, green for success, red for errors
- **Text**: White for main text, dim white for hints
- **Highlights**: Bold orange for commands and keywords

## Implementation Details

### ASCII Art Logo
```python
logo = Text()
logo.append("   ███...", style="bold bright_cyan")
logo.append("     ███...", style="bold cyan")
logo.append("       ███...", style="cyan")
logo.append(" ███     ███...", style="bold orange1")
# ... gradient from cyan to orange to yellow
```

### Loading Spinner
```python
with self.console.status("[bold orange1]Creating task...", spinner="dots"):
    task = self.service.create_task(title, description)
    time.sleep(0.3)  # Brief visual feedback
```

### Full-Width Panels
```python
terminal_width = self.console.width
panel = Panel(
    content,
    border_style="orange1",
    width=terminal_width,
    padding=(0, 1),
)
```

### Success Animation
```python
success_text = Text()
success_text.append("[x] ", style="bold green blink")
success_text.append(f"Task #{task.id} created: ", style="bold white")
success_text.append(task.title, style="cyan")
```

## Benefits

1. **More Polished**: Professional, modern appearance
2. **Better Feedback**: Loading spinners and animations
3. **Clearer Layout**: Full-width panels are easier to read
4. **Context Aware**: Status bar keeps you informed
5. **Gemini-Inspired**: Familiar to users of other modern CLIs

## Try It

```bash
uv run doit
```

You'll see:
1. Large colorful ASCII logo
2. Numbered tips
3. Stats panel
4. Footer with context
5. Bordered input box
6. Smooth animations for operations
