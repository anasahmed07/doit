# Quickstart: 002-fullstack-app

## Prerequisites
- Node.js 18+
- Python 3.13+
- uv (Python package manager)
- Docker (optional, for local Postgres if not using Neon dev branch)

## Setup

1. **Backend (FastAPI)**
   ```bash
   cd backend
   uv venv
   source .venv/bin/activate
   uv pip install -r requirements.txt
   cp .env.example .env  # Add DATABASE_URL, BETTER_AUTH_SECRET
   uv run uvicorn src.api.main:app --reload
   ```

2. **Frontend (Next.js)**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local # Add NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, DATABASE_URL (for auth)
   npm run dev
   ```

## Development Flow
1. **Database Migrations**:
   ```bash
   cd backend
   alembic revision --autogenerate -m "message"
   alembic upgrade head
   ```
2. **Access Swagger UI**: http://localhost:8000/docs
3. **Access Frontend**: http://localhost:3000
