# Data Model: 002-fullstack-app

## Entities

### User
- **Description**: Account holder. Authentication managed via Better Auth.
- **Fields**:
  - `id`: UUID (Primary Key)
  - `email`: String (Unique, Indexed)
  - `name`: String
  - `hashed_password`: String (Managed by Better Auth / Backend sync if needed)
  - `image`: String (URL)
  - `created_at`: DateTime

### Category
- **Description**: User-defined tag/grouping for notes.
- **Fields**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key -> User.id)
  - `name`: String
  - `color`: String (Hex code, default: "#000000")
  - `created_at`: DateTime

### Note
- **Description**: Personal content container (text, mixed media).
- **Fields**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key -> User.id)
  - `category_id`: UUID (Foreign Key -> Category.id, Nullable)
  - `content`: Text (Markdown supported)
  - `order_index`: Float (For Drag-and-Drop)
  - `created_at`: DateTime
  - `updated_at`: DateTime

### MediaAsset
- **Description**: Binary data for images/audio attached to notes. Stored in DB (BLOB).
- **Fields**:
  - `id`: UUID (Primary Key)
  - `note_id`: UUID (Foreign Key -> Note.id)
  - `mime_type`: String (e.g., "image/png", "audio/mpeg")
  - `data`: LargeBinary (BYTEA)
  - `created_at`: DateTime

### Project
- **Description**: Professional work container.
- **Fields**:
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key -> User.id)
  - `name`: String
  - `framework`: String (Enum: "KANBAN_FIXED")
  - `created_at`: DateTime

### ProjectTask
- **Description**: Actionable item within a project.
- **Fields**:
  - `id`: UUID (Primary Key)
  - `project_id`: UUID (Foreign Key -> Project.id)
  - `status`: String (Enum: "TODO", "IN_PROGRESS", "DONE")
  - `content`: String
  - `order_index`: Float
  - `created_at`: DateTime
