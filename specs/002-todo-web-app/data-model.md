# Data Model: Phase II - Todo Web Application

## Entities

### User
Represents a registered user of the application. Managed largely by Better Auth, but referenced in our domain.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | `UUID` | Yes | Primary Key | Unique identifier for the user. |
| `email` | `String` | Yes | Unique, Email Format | User's email address (login identifier). |
| `name` | `String` | No | Max 100 chars | User's display name. |
| `created_at` | `DateTime` | Yes | Default: Now | Timestamp of account creation. |

### Task
Represents a unit of work to be tracked.

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `id` | `UUID` | Yes | Primary Key | Unique identifier for the task. |
| `title` | `String` | Yes | Max 200 chars, Min 1 char | The main content of the task. |
| `description` | `String` | No | Max 1000 chars | Additional details about the task. |
| `is_completed` | `Boolean` | Yes | Default: False | Status of the task. |
| `user_id` | `UUID` | Yes | Foreign Key -> `User.id` | The owner of the task. |
| `created_at` | `DateTime` | Yes | Default: Now | When the task was created. |
| `updated_at` | `DateTime` | Yes | Auto-update | Last modification timestamp. |

## Relationships

- **User** (1) ---- (N) **Task**
  - A `User` can have many `Tasks`.
  - A `Task` belongs to exactly one `User`.
  - **Cascade Delete**: If a User is deleted, their Tasks should be deleted (or archived depending on policy, but standard is cascade for basic Todo).

## Validation Rules (Pydantic/SQLModel)

1. **Title**: Must not be empty or whitespace only.
2. **Email**: Must be a valid email format.
3. **Data Isolation**: Application logic MUST ensure queries for `Task` always filter by the authenticated `user_id`.
