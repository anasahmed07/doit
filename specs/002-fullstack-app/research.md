# Research & Decisions: 002-fullstack-app

## 1. Authentication Integration (Better Auth + FastAPI)

- **Problem**: Better Auth is a TS-first library running in Next.js, but FastAPI needs to verify requests.
- **Decision**: Use **Shared Secret / JWT Verification**.
- **Rationale**: Better Auth issues a session token (often a JWT or signed cookie). By sharing the signing secret (`BETTER_AUTH_SECRET`) with the FastAPI backend, we can verify the token signature and extract the `user_id` without a database round-trip (if stateless) or by querying the DB (if session-based).
- **Implementation**:
  - Frontend: Better Auth handles login/signup and sets `session_token` cookie.
  - Backend: Middleware extracts cookie, verifies signature using `BETTER_AUTH_SECRET`.
  - **Constraint**: Must ensure cookie is accessible to API domain (configure `SameSite` and `Domain` correctly if on different subdomains).

## 2. Media Storage (Postgres BLOBs)

- **Problem**: User mandated storing images/audio in DB, which can bloat table reads.
- **Decision**: **Separate Table/Model with Deferred Loading**.
- **Rationale**: Storing BLOBs in the main `Note` table would slow down list queries (`SELECT * FROM note`).
- **Implementation**:
  - `MediaAsset` entity: `id`, `note_id`, `data` (LargeBinary), `mime_type`.
  - `Note` entity: `id`, `content`, `media_assets` (relationship).
  - Queries for the dashboard (list notes) will NOT join `MediaAsset.data`. Only fetch content when needed or use optimized pre-loading for small thumbnails if generated.
  - **Warning**: Postgres has a row size limit (~1.6GB), but practical limits are much lower for performance. We will enforce application-level size limits (e.g., 5MB per file).

## 3. Drag-and-Drop (Dnd-kit + Next.js App Router)

- **Problem**: Dnd-kit relies on DOM/Window APIs, incompatible with Server Components.
- **Decision**: **Client Component Wrapper**.
- **Rationale**: The drag-and-drop context must be rooted in a Client Component.
- **Implementation**:
  - `DraggableNoteGrid.tsx` (Client Component): Wraps the grid with `<DndContext>`.
  - Notes data is fetched in a Server Component (Page) and passed as props to the Client Component.
  - Reordering triggers a server action or API call to update `order_index`.

## 4. Dynamic Sidebar

- **Problem**: Sidebar needs to reflect Categories instantly.
- **Decision**: **Shared Layout Fetching**.
- **Rationale**: The Sidebar is part of the global layout.
- **Implementation**:
  - `layout.tsx`: Fetches categories.
  - **Optimization**: Use React Query (TanStack Query) or Next.js Cache with tag revalidation. When a category is added, invalidate the `categories` tag to refresh the sidebar without a full reload.
