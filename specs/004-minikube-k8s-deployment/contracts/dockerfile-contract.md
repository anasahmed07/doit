# Dockerfile Contract: Production Images

**Feature**: 004-minikube-k8s-deployment
**Date**: 2026-02-11

## Backend Dockerfile (`backend/Dockerfile`)

```
Stage 1 (builder):
  Base: python:3.13-slim
  Install: uv (from ghcr.io/astral-sh/uv:latest)
  Copy: pyproject.toml, uv.lock
  Run: uv sync --frozen --no-cache
  Copy: src/

Stage 2 (runtime):
  Base: python:3.13-slim
  Copy from builder: /app/.venv, /app/src, /app/pyproject.toml
  Install: uv (for uv run)
  Expose: 8000
  Healthcheck: curl --fail http://localhost:8000/health
  CMD: ["uv", "run", "prod"]
```

**Expected image size**: ~200-300MB
**Build context**: `./backend`

## MCP Dockerfile (`mcp/Dockerfile`)

```
Stage 1 (builder):
  Base: python:3.13-slim
  Install: uv (from ghcr.io/astral-sh/uv:latest)
  Copy: pyproject.toml, uv.lock
  Run: uv sync --frozen --no-cache
  Copy: src/

Stage 2 (runtime):
  Base: python:3.13-slim
  Copy from builder: /app/.venv, /app/src, /app/pyproject.toml
  Install: uv (for uv run)
  Expose: 8080
  Healthcheck: curl --fail http://localhost:8080/health
  CMD: ["uv", "run", "prod"]
```

**Expected image size**: ~200-300MB
**Build context**: `./mcp`

## Frontend Dockerfile (`frontend/Dockerfile`)

```
Stage 1 (deps):
  Base: node:20-alpine
  Copy: package.json, package-lock.json
  Run: npm ci

Stage 2 (builder):
  Base: node:20-alpine
  Copy from deps: node_modules
  Copy: all source files
  Env: NEXT_TELEMETRY_DISABLED=1
  Run: npm run build

Stage 3 (runtime):
  Base: node:20-alpine
  Copy from builder: .next/standalone, .next/static, public
  Expose: 3000
  Env: HOSTNAME=0.0.0.0, PORT=3000
  CMD: ["node", "server.js"]
```

**Prerequisite**: `next.config.ts` must include `output: "standalone"`
**Expected image size**: ~100-200MB
**Build context**: `./frontend`

## Build Commands (Minikube)

```bash
# Point Docker CLI at Minikube's daemon
eval $(minikube docker-env)

# Build all images
docker build -t doit-backend:latest ./backend
docker build -t doit-mcp:latest ./mcp
docker build -t doit-frontend:latest ./frontend
```
