# Claude Code Rules - Backend

## Environment
- **Framework**: FastAPI (Python 3.13+)
- **ORM**: SQLModel
- **Database**: PostgreSQL (Neon Serverless)
- **Migrations**: Alembic
- **Package Manager**: uv

## Commands
- **Run Server**: `uv run uvicorn backend.main:app --reload`
- **Run Tests**: `uv run pytest`
- **Format**: `uv run ruff format .`
- **Lint**: `uv run ruff check .`
- **Migrations**:
  - Create: `uv run alembic revision --autogenerate -m "message"`
  - Apply: `uv run alembic upgrade head`

## Structure
- `src/backend/` - Main application code
  - `routes/` - API Route definitions
  - `core/` - Configuration, Database, Security
  - `models/` - SQLModel entities
  - `services/` - Business logic
  - `middlewares/` - Custom middlewares
- `tests/` - Tests (Unit & Integration)
- `migrations/` - Database migration scripts managed by Alembic

## Code Standards
- Use `pydantic-settings` for configuration.
- Use `SQLModel` for database models.
- Use `async`/`await` for I/O bound operations (though `psycopg` sync is currently configured, consider async if scaling).
- Follow TDD: Write tests before implementation.
- Place business logic in `services/`, not in routes.
