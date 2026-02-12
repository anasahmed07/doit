# Phase 4: Local Kubernetes Deployment

## Overview

Phase 4 packages the DoIt platform for local Kubernetes deployment using Minikube. All three services (frontend, backend, MCP) are containerized with optimized multi-stage Docker builds and orchestrated through an umbrella Helm chart with subcharts.

## Architecture

```
Browser → Ingress (doit.local)
              ├── /       → Frontend Service (ClusterIP :3000)
              ├── /api    → Backend Service  (ClusterIP :8000)
              └── /mcp    → MCP Service      (ClusterIP :8080)

Internal (server-side):
  Frontend Pod ──BACKEND_URL──→ Backend Service (doit-backend:8000)
  Frontend Pod ──MCP_URL──────→ MCP Service     (doit-mcp:8080)

External:
  All Pods ──DATABASE_URL──→ Neon PostgreSQL (internet)
```

## Components

### Docker Images

| Service | Base Image | Stages | Port | Size |
|---------|-----------|--------|------|------|
| Backend | python:3.13-slim | 2 (builder + runtime) | 8000 | ~200-300MB |
| MCP | python:3.13-slim | 2 (builder + runtime) | 8080 | ~200-300MB |
| Frontend | node:20-alpine | 3 (deps + builder + runtime) | 3000 | ~100-200MB |

### Helm Chart Structure

```
helm/doit/                    # Umbrella chart
├── Chart.yaml                # Dependencies on subcharts
├── values.yaml               # Default configuration
├── values.secret.yaml.example # Secret template
├── .helmignore
├── templates/
│   ├── ingress.yaml          # Path-based routing
│   └── _helpers.tpl          # Common helpers
└── charts/
    ├── frontend/             # Frontend subchart
    │   └── templates/        # Deployment, Service, ConfigMap, Secret
    ├── backend/              # Backend subchart
    │   └── templates/        # Deployment, Service, ConfigMap, Secret
    └── mcp/                  # MCP subchart
        └── templates/        # Deployment, Service, ConfigMap, Secret
```

### Kubernetes Resources (per deployment)

- 3 Deployments (one per service)
- 3 Services (ClusterIP)
- 3 ConfigMaps (non-sensitive env vars)
- 3 Secrets (credentials, API keys)
- 1 Ingress (shared, path-based routing)

## Health Checks

| Service | Path | Liveness | Readiness |
|---------|------|----------|-----------|
| Backend | `/health` | 30s interval | 10s interval |
| MCP | `/health` | 30s interval | 10s interval |
| Frontend | `/` | 30s interval | 10s interval |

## Configuration

### Environment Variables (ConfigMaps)

| Service | Variable | Value |
|---------|----------|-------|
| Backend | `CORS_ORIGINS` | `http://doit.local` |
| MCP | `MCP_HOST` | `0.0.0.0` |
| MCP | `MCP_PORT` | `8080` |
| Frontend | `BETTER_AUTH_URL` | `http://doit.local` |
| Frontend | `NEXT_PUBLIC_BETTER_AUTH_URL` | `http://doit.local` |
| Frontend | `NEXT_PUBLIC_API_URL` | `http://doit.local/api` |
| Frontend | `BACKEND_URL` | `http://doit-backend:8000` |
| Frontend | `MCP_URL` | `http://doit-mcp:8080` |

### Secrets (values.secret.yaml)

| Key | Required | Used By |
|-----|----------|---------|
| `global.databaseUrl` | Yes | All services |
| `global.betterAuthSecret` | Yes | Backend, Frontend |
| `global.geminiApiKey` | Yes | MCP |
| `global.googleClientId` | No | Frontend |
| `global.googleClientSecret` | No | Frontend |
| `global.githubClientId` | No | Frontend |
| `global.githubClientSecret` | No | Frontend |

## Quickstart

See [quickstart.md](../../specs/004-minikube-k8s-deployment/quickstart.md) for the full deployment guide.

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress

# 2. Build images
eval $(minikube docker-env)
docker build -t doit-backend:latest ./backend
docker build -t doit-mcp:latest ./mcp
docker build -t doit-frontend:latest ./frontend

# 3. Configure secrets
cp helm/doit/values.secret.yaml.example helm/doit/values.secret.yaml
# Edit with real values

# 4. Deploy
helm dependency update ./helm/doit
helm install doit ./helm/doit -f ./helm/doit/values.secret.yaml

# 5. DNS
echo "$(minikube ip)  doit.local" | sudo tee -a /etc/hosts

# 6. Access
open http://doit.local
```

## Prerequisites

- Docker Desktop 4.x+
- Minikube (4 CPUs / 8GB RAM minimum)
- Helm 3
- kubectl
- 16GB+ total RAM on host machine

## Technologies

| Technology | Purpose |
|------------|---------|
| Docker | Multi-stage container builds |
| Minikube | Local Kubernetes cluster |
| Helm 3 | Package management and templating |
| nginx Ingress | Path-based HTTP routing |
| Kubernetes | Container orchestration |
