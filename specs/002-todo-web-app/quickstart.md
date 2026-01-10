# Quickstart: Phase II - Todo Web Application

## Prerequisites

- **Python 3.13+** (Managed via UV)
- **Node.js 20+** (LTS)
- **Docker** (Optional, for local DB if not using Neon cloud)
- **Neon Account** (or local Postgres connection string)

## Setup

1.  **Clone & Install Dependencies**

    ```bash
    # Backend
    cd backend
    uv sync
    source .venv/bin/activate

    # Frontend
    cd ../frontend
    npm install
    ```

2.  **Environment Configuration**

    Create `.env` files in both `backend/` and `frontend/`.

    **Backend (`backend/.env`)**:
    ```ini
    DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
    BETTER_AUTH_SECRET="your-secret-key"
    BETTER_AUTH_URL="http://localhost:3000" # Frontend URL
    ```

    **Frontend (`frontend/.env.local`)**:
    ```ini
    NEXT_PUBLIC_API_URL="http://localhost:8000"
    BETTER_AUTH_SECRET="your-secret-key" # Must match backend
    BETTER_AUTH_URL="http://localhost:3000"
    ```

3.  **Database Migration**

    ```bash
    cd backend
    # Run SQLModel migrations (command TBD based on final tool choice, likely alembic)
    # For now (dev):
    python -m src.scripts.init_db
    ```

## Running the App

1.  **Start Backend**
    ```bash
    cd backend
    uv run fastapi dev src/api/main.py
    # Runs on http://localhost:8000
    ```

2.  **Start Frontend**
    ```bash
    cd frontend
    npm run dev
    # Runs on http://localhost:3000
    ```

3.  **Verify**
    Open `http://localhost:3000` in your browser. You should see the login page.
