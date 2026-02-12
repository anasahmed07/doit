# Implementation Plan: Local Kubernetes Deployment

**Branch**: `004-minikube-k8s-deployment` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-minikube-k8s-deployment/spec.md`

## Summary

Deploy the DoIt productivity platform (frontend, backend, MCP service) to a local Kubernetes cluster using Minikube. This involves writing fresh multi-stage Dockerfiles for all three services, creating an umbrella Helm chart with subcharts, configuring Ingress for path-based routing, and documenting the full setup workflow. A `/health` endpoint must be added to the MCP service (it currently lacks one). Next.js standalone output must be enabled for the frontend container.

## Technical Context

**Language/Version**: Python 3.13+ (backend, MCP), TypeScript/Node 20 (frontend)
**Primary Dependencies**: Docker, Minikube, Helm 3, kubectl, nginx Ingress controller
**Storage**: PostgreSQL (Neon Serverless) — external, accessed via DATABASE_URL
**Testing**: `helm template` validation, `kubectl apply --dry-run`, manual E2E verification
**Target Platform**: Local Minikube cluster (Linux containers on Docker driver)
**Project Type**: Infrastructure / DevOps (deploying existing web application)
**Performance Goals**: All pods healthy within 5 minutes of `helm install`
**Constraints**: Minikube with 4 CPUs / 8GB RAM; developer machine needs 16GB+ total RAM
**Scale/Scope**: 3 services, 1 replica each, single Ingress, local-only deployment

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. TDD | PASS | Only new code is MCP `/health` endpoint — test included. Infrastructure validated via Helm template + dry-run. |
| II. API-First & Type-Safe | PASS | No new APIs. Deploying existing API contracts. MCP health endpoint follows existing backend pattern. |
| III. Cloud-Native Data | PASS | Database remains Neon Serverless. All services connect via DATABASE_URL. No local storage. |
| IV. Modern Web UX | PASS | Frontend unchanged. Standalone output is a build optimization, not a UX change. |
| V. Code Quality | PASS | Dockerfiles follow consistent multi-stage pattern. Helm templates use standard conventions. |
| VI. Security | PASS | Secrets in gitignored `values.secret.yaml`. K8s Secrets for runtime. No credentials in templates or images. CORS configured for Ingress host. |

**Pre-Phase 0 gate**: PASSED
**Post-Phase 1 gate**: PASSED (no violations introduced by design artifacts)

## Project Structure

### Documentation (this feature)

```text
specs/004-minikube-k8s-deployment/
├── plan.md                          # This file
├── spec.md                          # Feature specification
├── research.md                      # Phase 0 research findings
├── data-model.md                    # K8s resource topology & config model
├── quickstart.md                    # Developer setup guide
├── contracts/
│   ├── helm-chart-contract.md       # Helm chart structure & install commands
│   └── dockerfile-contract.md       # Dockerfile specifications per service
├── checklists/
│   └── requirements.md              # Spec quality checklist
└── tasks.md                         # Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
# New files introduced by Phase IV
backend/
├── Dockerfile                       # REPLACE: new multi-stage production Dockerfile
└── src/backend/                     # Existing (unchanged)

mcp/
├── Dockerfile                       # REPLACE: new multi-stage production Dockerfile
└── src/mcp_service/
    └── routes/
        └── health.py                # NEW: /health endpoint for K8s probes

frontend/
├── Dockerfile                       # NEW: multi-stage Next.js standalone build
├── next.config.ts                   # MODIFY: add output: "standalone"
├── .dockerignore                    # NEW: exclude node_modules, .next from build context
└── src/                             # Existing (unchanged)

helm/
└── doit/                            # NEW: umbrella Helm chart
    ├── Chart.yaml
    ├── values.yaml                  # Default config values
    ├── values.secret.yaml.example   # Template for secret values
    ├── .helmignore
    ├── templates/
    │   ├── ingress.yaml             # Shared Ingress with path-based routing
    │   └── _helpers.tpl             # Template helpers
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

.gitignore                           # MODIFY: add helm/doit/values.secret.yaml
```

**Structure Decision**: Infrastructure-as-code pattern. Helm charts live in a `helm/` directory at the repo root. Dockerfiles live within each service directory. No changes to existing application source code except MCP health endpoint and Next.js config.

## Implementation Phases

### Phase A: Application Preparation (prerequisites for containers)
1. Add `/health` endpoint to MCP service (mirrors existing backend pattern)
2. Enable `output: "standalone"` in `frontend/next.config.ts`
3. Create `.dockerignore` files for all three services

### Phase B: Dockerfiles (containerization)
4. Write `backend/Dockerfile` — multi-stage (builder → runtime)
5. Write `mcp/Dockerfile` — multi-stage (builder → runtime)
6. Write `frontend/Dockerfile` — multi-stage (deps → builder → runtime)
7. Verify all images build and run correctly with `docker run`

### Phase C: Helm Charts (orchestration)
8. Create umbrella chart structure (`helm/doit/Chart.yaml`, helpers)
9. Create backend subchart (Deployment, Service, ConfigMap, Secret)
10. Create MCP subchart (Deployment, Service, ConfigMap, Secret)
11. Create frontend subchart (Deployment, Service, ConfigMap, Secret)
12. Create shared Ingress template with path-based routing
13. Create `values.yaml` (defaults) and `values.secret.yaml.example` (template)
14. Add `helm/doit/values.secret.yaml` to `.gitignore`

### Phase D: Minikube Deployment & Validation
15. Document Minikube setup (start, addons, docker-env)
16. Build images inside Minikube, install chart, verify all pods healthy
17. Test full application workflow through Ingress (sign in, tasks, notes, chat)
18. Test pod recovery (delete pod, verify auto-restart)
19. Test Helm lifecycle (install, upgrade with changed values, uninstall)

### Phase E: AI-Assisted Operations (optional)
20. Document kubectl-ai setup and example commands
21. Document kagent setup and example commands

## Complexity Tracking

> No constitution violations. No complexity justifications needed.
