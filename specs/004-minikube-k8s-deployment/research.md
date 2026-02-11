# Research: Local Kubernetes Deployment

**Feature**: 004-minikube-k8s-deployment
**Date**: 2026-02-11

## R1: Existing Service Configuration

**Decision**: Map all existing service ports, env vars, and entry points to inform Helm chart values.

**Findings**:

| Service  | Port | Entry Point            | Health Check | Prod Command   |
|----------|------|------------------------|-------------|----------------|
| Backend  | 8000 | `backend.main:app`     | `GET /health` → `{"status":"ok"}` | `uv run prod` |
| MCP      | 8080 | `mcp_service.main:app` | **NONE — must add** | `uv run prod` |
| Frontend | 3000 | Next.js app            | None (Next.js built-in) | `npm start` |

**Environment Variables (secrets)**:
- `DATABASE_URL` — all three services (MCP auto-converts to asyncpg format)
- `BETTER_AUTH_SECRET` — all three services (shared JWT secret)
- `GEMINI_API_KEY` — MCP only
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Frontend only
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — Frontend only

**Environment Variables (config)**:
- `CORS_ORIGINS` — Backend (must include Ingress URL)
- `BACKEND_URL` — Frontend server-side (K8s service DNS)
- `MCP_URL` — Frontend server-side (K8s service DNS)
- `NEXT_PUBLIC_API_URL` — Frontend client-side (Ingress URL)
- `NEXT_PUBLIC_BETTER_AUTH_URL` — Frontend (Ingress URL)
- `BETTER_AUTH_URL` — Frontend (Ingress URL)

**Rationale**: Understanding existing config prevents misconfigured deployments.

## R2: Dockerfile Strategy

**Decision**: Write new multi-stage Dockerfiles from scratch for all three services.

**Findings**:
- Backend/MCP have single-stage Dockerfiles (python:3.13-slim + `COPY .` + `uv sync`)
- Frontend has NO Dockerfile — docker-compose uses raw `node:20-alpine` with bind mount
- All three need multi-stage builds for production

**Multi-stage patterns**:
- **Python services** (backend, MCP): Stage 1 — `uv sync` to install deps. Stage 2 — copy `.venv` and source, run with `uv run prod`.
- **Next.js frontend**: Stage 1 — `npm ci` + `npm run build`. Stage 2 — copy `.next/standalone` output, run with `node server.js`. Requires `output: "standalone"` in next.config.ts.

**Alternatives considered**:
- Optimize existing Dockerfiles — rejected per clarification (user chose fresh start)
- Distroless base images — overkill for local Minikube, adds debugging complexity

## R3: Helm Umbrella Chart Structure

**Decision**: Umbrella chart with three subcharts + shared Ingress.

**Layout**:
```
helm/doit/
├── Chart.yaml              # Umbrella chart metadata
├── values.yaml             # Default values for all subcharts
├── values.secret.yaml.example  # Template for secret values
├── templates/
│   ├── ingress.yaml        # Shared Ingress resource
│   └── namespace.yaml      # Optional namespace creation
└── charts/
    ├── frontend/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       ├── service.yaml
    │       ├── configmap.yaml
    │       └── secret.yaml
    ├── backend/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml
    │       ├── service.yaml
    │       ├── configmap.yaml
    │       └── secret.yaml
    └── mcp/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            ├── deployment.yaml
            ├── service.yaml
            ├── configmap.yaml
            └── secret.yaml
```

**Rationale**: Umbrella chart allows single `helm install` while keeping service templates isolated. Subcharts can be independently versioned for Phase V.

**Alternatives considered**:
- Single flat chart — rejected (templates become unwieldy with 3 services)
- Separate charts — rejected per clarification (user chose umbrella)

## R4: Ingress Configuration

**Decision**: Minikube Ingress addon with path-based routing.

**Findings**:
- Minikube provides `ingress` addon (nginx Ingress controller)
- Enable: `minikube addons enable ingress`
- Path routing: `/` → frontend, `/api` → backend, `/mcp` → MCP
- **Critical**: Frontend client-side code uses `NEXT_PUBLIC_API_URL` — this must point to the Ingress URL (e.g., `http://doit.local/api`) NOT the internal K8s service
- **Critical**: `CORS_ORIGINS` on backend must include the Ingress host
- Minikube IP obtained via `minikube ip`; developer adds DNS entry to `/etc/hosts`

**Rationale**: Ingress provides production-like routing. Path-based routing avoids multiple hostnames.

## R5: MCP Health Check Gap

**Decision**: Add a `/health` endpoint to the MCP service before containerization.

**Findings**:
- Backend already has `GET /health` → `{"status": "ok", "service": "DoIt Backend"}`
- MCP service has NO health endpoint — all routes require authentication
- Kubernetes liveness/readiness probes need an unauthenticated endpoint
- Adding `GET /health` to MCP is minimal code (~5 lines in routes)

**Rationale**: Without a health endpoint, K8s cannot determine if the MCP pod is healthy, leading to potential traffic routing to unhealthy pods.

## R6: Image Loading into Minikube

**Decision**: Use `minikube image build` or `eval $(minikube docker-env)` to make images available.

**Findings**:
- Minikube runs its own Docker daemon, separate from the host
- Images built on the host are NOT visible to Minikube by default
- Two approaches:
  1. `eval $(minikube docker-env)` — point host Docker CLI at Minikube's daemon, then build
  2. `minikube image build -t <tag> <context>` — build directly in Minikube
- Helm chart must set `imagePullPolicy: Never` or `IfNotPresent` for local images

**Rationale**: Approach 1 is simpler and well-documented. Approach 2 works on all platforms.

## R7: Next.js Standalone Output

**Decision**: Enable `output: "standalone"` in next.config.ts for production Docker builds.

**Findings**:
- Current `next.config.ts` is minimal (no custom settings)
- Next.js standalone output creates a self-contained `server.js` that includes all dependencies
- This reduces the Docker image from ~1GB (full node_modules) to ~100-200MB
- Environment variables with `NEXT_PUBLIC_` prefix are baked at build time
- Runtime env vars (BACKEND_URL, MCP_URL) remain dynamic

**Rationale**: Standalone output is the standard approach for containerizing Next.js apps.
