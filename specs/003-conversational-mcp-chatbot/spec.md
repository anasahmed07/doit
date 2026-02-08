# Feature Specification: Conversational MCP Chatbot

**Feature Branch**: `003-conversational-mcp-chatbot`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Add a chatbot to the frontend that uses a new doit-mcp server to provide a conversational interface for the whole doit application. Users will be able to manage tasks (by default in the default project), create new projects, take notes, manage categories, and more. The MCP should expose necessary tools to authenticated users so that task and note management becomes conversational."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manage Tasks via Chat (Priority: P1)

As a user, I want to create, view, update, and delete tasks by typing natural language commands in a chatbot panel so that I can manage my work without navigating through multiple screens.

**Why this priority**: Task management is the core function of the application. Enabling conversational task management delivers the highest immediate value and validates the end-to-end MCP integration.

**Independent Test**: Can be fully tested by opening the chatbot, typing "Add a task called 'Buy groceries'" and verifying the task appears in the default project. Also testable by asking "Show my tasks" and confirming the list is returned.

**Acceptance Scenarios**:

1. **Given** a logged-in user with a default project, **When** the user types "Add a task called 'Finish report'", **Then** the task is created in the default project with status TODO and confirmed in the chat response.
2. **Given** a logged-in user with existing tasks, **When** the user types "Show my tasks", **Then** the chatbot lists all tasks in the default project grouped by status.
3. **Given** a logged-in user with an existing task, **When** the user types "Mark 'Finish report' as done", **Then** the task status is updated to DONE and the chatbot confirms the change.
4. **Given** a logged-in user with an existing task, **When** the user types "Delete 'Finish report'", **Then** the task is removed and the chatbot confirms the deletion.
5. **Given** a logged-in user, **When** the user types "Add a high priority task 'Deploy v2' due tomorrow", **Then** the task is created with priority HIGH and the due date set to the next day.

---

### User Story 2 - Manage Notes via Chat (Priority: P1)

As a user, I want to create, view, update, and delete notes by chatting so that I can quickly capture ideas without switching to the notes page.

**Why this priority**: Notes are a core feature alongside tasks. Conversational note management is equally fundamental and validates a second MCP tool domain.

**Independent Test**: Can be tested by typing "Create a note titled 'Meeting notes' with content 'Discuss Q3 roadmap'" and verifying the note appears in the notes list.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** the user types "Create a note titled 'Ideas' with content 'Brainstorm session results'", **Then** a new note is created and the chatbot confirms with the note title.
2. **Given** a logged-in user with existing notes, **When** the user types "Show my notes", **Then** the chatbot lists all notes with their titles and categories.
3. **Given** a logged-in user with an existing note, **When** the user types "Update 'Ideas' note content to 'Updated brainstorm results'", **Then** the note content is updated and the chatbot confirms.
4. **Given** a logged-in user, **When** the user types "Create a note in the 'Work' category titled 'Sprint planning'", **Then** the note is created and assigned to the Work category.

---

### User Story 3 - Chatbot UI Panel (Priority: P1)

As a user, I want to access the chatbot through a persistent, accessible panel in the application so that I can converse with the assistant at any time without losing my current context.

**Why this priority**: Without a usable UI, no conversational features can be accessed. The chatbot panel is the delivery mechanism for all other stories.

**Independent Test**: Can be tested by clicking the chatbot toggle button, verifying the panel opens, typing a greeting, and receiving a response.

**Acceptance Scenarios**:

1. **Given** a logged-in user on any dashboard page, **When** the user clicks the chatbot toggle button, **Then** a chat panel slides open from the right side of the screen.
2. **Given** an open chatbot panel, **When** the user types a message and presses Enter or clicks Send, **Then** the message appears in the conversation and a response streams back.
3. **Given** an open chatbot panel, **When** the user clicks the close/toggle button, **Then** the panel closes and the underlying page remains unchanged.
4. **Given** a chatbot panel with conversation history, **When** the user navigates to a different page and reopens the chatbot, **Then** the conversation history is preserved (loaded from the database).
5. **Given** a logged-in user on a mobile device, **When** the user opens the chatbot, **Then** the panel takes the full screen width and remains usable.
6. **Given** a logged-in user with past conversations, **When** the user opens the chatbot panel, **Then** they see a list of past conversations and can select one to resume or start a new conversation.
7. **Given** a logged-in user in an active conversation, **When** the user clicks "New conversation", **Then** a fresh conversation is started and the previous one remains accessible in the conversation list.

---

### User Story 4 - Manage Projects via Chat (Priority: P2)

As a user, I want to create and manage projects through the chatbot so that I can organize my tasks across multiple projects without leaving the conversation.

**Why this priority**: Project management extends the task management capability. Users need to organize tasks across multiple workstreams, but this builds upon the core task functionality (P1).

**Independent Test**: Can be tested by typing "Create a project called 'Website Redesign'" and verifying the project appears in the projects list.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** the user types "Create a project called 'Marketing Campaign'", **Then** a new project is created and the chatbot confirms with the project name.
2. **Given** a logged-in user with multiple projects, **When** the user types "List my projects", **Then** the chatbot lists all projects with their task counts.
3. **Given** a logged-in user with a specific project, **When** the user types "Add a task 'Design mockups' to the 'Website Redesign' project", **Then** the task is created in the specified project.
4. **Given** a logged-in user with a project, **When** the user types "Show tasks in 'Website Redesign'", **Then** the chatbot lists all tasks in that project grouped by status.

---

### User Story 5 - Manage Categories via Chat (Priority: P2)

As a user, I want to create, list, and manage note categories through the chatbot so that I can organize my notes without navigating to settings.

**Why this priority**: Categories provide organizational structure for notes. While important for usability, they support the core note management flow rather than being a standalone need.

**Independent Test**: Can be tested by typing "Create a category called 'Personal' with color blue" and verifying the category appears in the category list.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** the user types "Create a category called 'Research' with color green", **Then** a new category is created with the specified color and the chatbot confirms.
2. **Given** a logged-in user with existing categories, **When** the user types "List my categories", **Then** the chatbot lists all categories with their names and colors.
3. **Given** a logged-in user with a category, **When** the user types "Delete category 'Research'", **Then** the category is removed and the chatbot confirms.

---

### User Story 6 - Dashboard Summary via Chat (Priority: P3)

As a user, I want to ask the chatbot for a summary of my dashboard so that I can get a quick overview of my productivity without navigating to the dashboard page.

**Why this priority**: This is a convenience feature that adds value once core management capabilities are in place.

**Independent Test**: Can be tested by typing "Show my dashboard summary" and verifying counts match the actual dashboard page.

**Acceptance Scenarios**:

1. **Given** a logged-in user with projects, tasks, and notes, **When** the user types "Show my dashboard summary", **Then** the chatbot responds with total projects, active tasks, completed tasks, and total notes.

---

### Edge Cases

- What happens when the user references a task or project that does not exist? The chatbot should respond with a clear message indicating the item was not found and suggest listing available items.
- What happens when the user sends an ambiguous command (e.g., "delete it") without prior context? The chatbot should ask for clarification about which item to act on.
- What happens when the user is not authenticated and tries to use the chatbot? The chatbot panel should not be accessible to unauthenticated users; it should only appear on authenticated dashboard pages.
- What happens when the MCP server is unreachable? The chatbot should display a user-friendly error message indicating the service is temporarily unavailable.
- What happens when the user's session expires during a conversation? The chatbot should detect the authentication failure and prompt the user to log in again.
- What happens when the user tries to manage tasks in a project they don't own or aren't a member of? The chatbot should respect existing authorization rules and inform the user they lack access.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a chatbot panel accessible from all authenticated dashboard pages via a toggle button.
- **FR-002**: System MUST integrate with an MCP (Model Context Protocol) server that exposes tools for task, note, project, and category management.
- **FR-003**: System MUST authenticate MCP requests using the user's existing session, ensuring all operations are scoped to the authenticated user.
- **FR-004**: System MUST support creating, reading, updating, and deleting tasks through conversational commands.
- **FR-005**: System MUST default task operations to the user's default project when no project is explicitly specified.
- **FR-006**: System MUST support creating, reading, updating, and deleting notes through conversational commands.
- **FR-007**: System MUST support creating, listing, and deleting categories through conversational commands.
- **FR-008**: System MUST support creating, listing, and updating projects through conversational commands.
- **FR-009**: System MUST support adding tasks to specific projects when the user specifies a project name.
- **FR-010**: System MUST support setting task priority (low, medium, high) and due dates through natural language.
- **FR-011**: System MUST display chatbot responses in a conversational format with clear formatting for lists, confirmations, and errors.
- **FR-012**: System MUST stream responses to the user so they see incremental output rather than waiting for complete responses.
- **FR-013**: System MUST persist conversation history to the database, allowing users to access past conversations across sessions.
- **FR-014**: System MUST handle MCP server errors gracefully by displaying user-friendly error messages.
- **FR-015**: System MUST provide a dashboard summary tool that returns aggregate counts of projects, tasks, and notes.
- **FR-016**: System MUST ensure the chatbot panel is responsive and usable on both desktop and mobile devices.
- **FR-017**: System MUST respect existing authorization rules; users can only manage resources they own or have access to through project membership.
- **FR-018**: System MUST allow users to start new conversations, view a list of past conversations, and switch between them.
- **FR-019**: System MUST display a conversation list in the chatbot panel showing past conversations with titles, ordered by most recent.
- **FR-020**: System MUST auto-generate a conversation title from the first user message using the LLM.
- **FR-021**: System MUST allow users to delete individual conversations, permanently removing the conversation and all its messages from the database.

### Key Entities

- **Conversation**: Represents a chat session between the user and the assistant, containing a sequence of messages. Persisted in the database and associated with the user. Users can have multiple conversations, start new ones, and switch between them. Each conversation has an auto-generated title derived from the first user message.
- **Message**: A single exchange unit within a conversation, with a role (user or assistant), content text, and timestamp.
- **MCP Tool**: A callable function exposed by the MCP server, representing a specific action (e.g., create_task, list_notes, delete_category). Each tool has a name, description, and parameter schema.
- **Default Project**: The user's first or primary project where tasks are created when no project is explicitly specified. If the user has no projects, one is automatically created.

## Clarifications

### Session 2026-02-08

- Q: Should conversations be persisted in the database or kept in-memory (session-scoped)? → A: Conversations will be persisted in the database.
- Q: How should users interact with multiple conversations? → A: Multiple conversations supported — users can start new conversations, see a list of past ones, and switch between them.
- Q: How should conversation titles be determined? → A: Auto-generated by the LLM based on the first user message.
- Q: Should users be able to delete past conversations? → A: Yes, users can delete individual conversations.
- Q: Which LLM provider should power the chatbot? → A: Google Gemini 3.5.
- Q: Where should the MCP server run? → A: Standalone service with direct database access (same DB as backend), deployed on Hugging Face.
- Q: What package manager for the MCP project? → A: uv (same as backend).

## Assumptions

- The application uses Google Gemini 3.5 as the LLM provider to power the chatbot's natural language understanding and tool calling.
- The MCP server will be a standalone service with direct access to the same database as the backend (not calling the backend API over HTTP). It will be deployed on Hugging Face.
- The "default project" for a user is their first created project. If a user has no projects, one named "My Tasks" will be automatically created when they first use the chatbot.
- Conversation history is persisted in the database, enabling users to access past conversations across browser sessions and devices.
- Media asset management (uploading images to notes) is excluded from conversational scope in this phase due to the complexity of file handling in a chat interface.
- Collaboration features (inviting members, managing roles) are excluded from conversational scope in this phase. Users can manage these through the existing UI.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete a task creation through the chatbot in under 15 seconds (from typing the command to seeing confirmation), compared to the multi-click GUI workflow.
- **SC-002**: The chatbot correctly interprets and executes at least 90% of well-formed natural language commands for task, note, project, and category operations.
- **SC-003**: Users can access all core CRUD operations (tasks, notes, projects, categories) through the chatbot without needing to navigate to individual pages.
- **SC-004**: The chatbot panel loads and becomes interactive within 2 seconds of being toggled open.
- **SC-005**: 100% of chatbot operations respect the user's authentication and authorization boundaries, preventing any cross-user data access.
- **SC-006**: The chatbot provides a helpful response (action confirmation, clarification request, or error explanation) for every user message, with no silent failures.
