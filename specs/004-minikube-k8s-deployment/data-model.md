# Data Model: Local Kubernetes Deployment

**Feature**: 004-minikube-k8s-deployment
**Date**: 2026-02-11

> Phase IV introduces no new database entities. The data model here describes the Kubernetes resource topology and configuration structure.

## Kubernetes Resource Topology

### Per-Service Resources (×3: frontend, backend, mcp)

| Resource | Purpose | Key Properties |
|----------|---------|----------------|
| Deployment | Manages pod replicas and rolling updates | 1 replica (default), liveness/readiness probes, resource requests/limits |
| Service (ClusterIP) | Internal service discovery | Port mapping to container port |
| ConfigMap | Non-sensitive environment config | Service URLs, feature flags |
| Secret | Sensitive environment values | DB URL, API keys, auth secrets |

### Shared Resources (umbrella chart)

| Resource | Purpose | Key Properties |
|----------|---------|----------------|
| Ingress | External access via path-based routing | Host: `doit.local`, paths: `/`, `/api`, `/mcp` |
| Namespace (optional) | Resource isolation | `doit` namespace |

## Configuration Data Model

### Secrets (values.secret.yaml)

```yaml
# Shared across services
global:
  databaseUrl: ""          # PostgreSQL connection string
  betterAuthSecret: ""     # Shared JWT signing secret

# Service-specific
mcp:
  geminiApiKey: ""         # Google Gemini API key

frontend:
  googleClientId: ""       # OAuth - Google
  googleClientSecret: ""
  githubClientId: ""       # OAuth - GitHub
  githubClientSecret: ""
```

### Config (values.yaml)

```yaml
global:
  namespace: doit
  ingressHost: doit.local

frontend:
  replicaCount: 1
  image:
    repository: doit-frontend
    tag: latest
    pullPolicy: IfNotPresent
  port: 3000
  env:
    betterAuthUrl: "http://doit.local"
    nextPublicBetterAuthUrl: "http://doit.local"
    nextPublicApiUrl: "http://doit.local/api"
    backendUrl: "http://doit-backend:8000"
    mcpUrl: "http://doit-mcp:8080"

backend:
  replicaCount: 1
  image:
    repository: doit-backend
    tag: latest
    pullPolicy: IfNotPresent
  port: 8000
  env:
    corsOrigins: "http://doit.local"

mcp:
  replicaCount: 1
  image:
    repository: doit-mcp
    tag: latest
    pullPolicy: IfNotPresent
  port: 8080
  env:
    mcpHost: "0.0.0.0"
    mcpPort: "8080"
```

## Service Communication Map

```
Browser
  │
  ▼
Ingress (doit.local)
  ├─ /        → frontend Service (ClusterIP :3000)
  ├─ /api     → backend Service  (ClusterIP :8000)
  └─ /mcp     → mcp Service      (ClusterIP :8080)

Internal (server-side):
  frontend pod ──BACKEND_URL──→ backend Service (doit-backend:8000)
  frontend pod ──MCP_URL──────→ mcp Service     (doit-mcp:8080)

External (via Neon):
  backend pod  ──DATABASE_URL──→ Neon PostgreSQL (internet)
  mcp pod      ──DATABASE_URL──→ Neon PostgreSQL (internet)
  frontend pod ──DATABASE_URL──→ Neon PostgreSQL (internet)
```

## Health Check Endpoints

| Service  | Liveness Probe | Readiness Probe | Path | Expected Response |
|----------|---------------|-----------------|------|-------------------|
| Backend  | HTTP GET | HTTP GET | `/health` | 200 `{"status":"ok"}` |
| MCP      | HTTP GET | HTTP GET | `/health` | 200 `{"status":"ok"}` (NEW — must be added) |
| Frontend | HTTP GET | HTTP GET | `/` | 200 (Next.js page) |
