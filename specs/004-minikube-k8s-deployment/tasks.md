# Tasks: Local Kubernetes Deployment

**Input**: Design documents from `/specs/004-minikube-k8s-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Infrastructure validated via `helm template`, `kubectl apply --dry-run`, and manual E2E verification.

**Organization**: Tasks grouped by user story. Note: US2 (Containerize) and US3 (Helm Charts) are prerequisites for US1 (Deploy & Validate), so they are ordered before US1 despite all being high priority.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Application Preparation)

**Purpose**: Prepare the existing application for containerization — add missing health endpoint, enable standalone output, create ignore files.

- [ ] T001 Add `/health` endpoint to MCP service in mcp/src/mcp_service/routes/health.py returning `{"status": "ok", "service": "DoIt MCP"}` and register route in mcp/src/mcp_service/main.py
- [ ] T002 Add `output: "standalone"` to frontend/next.config.ts for production Docker builds
- [ ] T003 [P] Create frontend/.dockerignore excluding node_modules, .next, .env*, .git
- [ ] T004 [P] Create backend/.dockerignore excluding .venv, __pycache__, .env*, .git
- [ ] T005 [P] Create mcp/.dockerignore excluding .venv, __pycache__, .env*, .git
- [ ] T006 Add `helm/doit/values.secret.yaml` to root .gitignore

**Checkpoint**: All three services have health check capabilities. Frontend configured for standalone build. Docker ignore files prevent bloated contexts.

---

## Phase 2: User Story 2 - Containerize All Services (Priority: P1) 🎯 MVP

**Goal**: Build optimized, production-ready Docker images for frontend, backend, and MCP using multi-stage builds.

**Independent Test**: Build each image with `docker build`, run with `docker run`, verify service starts and responds to health check.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Write multi-stage Dockerfile for backend in backend/Dockerfile — Stage 1: install deps with uv sync, Stage 2: copy .venv + src, CMD uv run prod, EXPOSE 8000
- [ ] T008 [P] [US2] Write multi-stage Dockerfile for MCP in mcp/Dockerfile — Stage 1: install deps with uv sync, Stage 2: copy .venv + src, CMD uv run prod, EXPOSE 8080
- [ ] T009 [P] [US2] Write multi-stage Dockerfile for frontend in frontend/Dockerfile — Stage 1: npm ci (deps), Stage 2: npm run build (builder), Stage 3: copy .next/standalone + static + public, CMD node server.js, EXPOSE 3000
- [ ] T010 [US2] Verify all three images build successfully with `docker build -t doit-backend:latest ./backend && docker build -t doit-mcp:latest ./mcp && docker build -t doit-frontend:latest ./frontend`
- [ ] T011 [US2] Verify each image runs and responds — `docker run -p 8000:8000 doit-backend` responds at /health, `docker run -p 8080:8080 doit-mcp` responds at /health, `docker run -p 3000:3000 doit-frontend` serves the app

**Checkpoint**: All three Docker images build and run successfully. Each service starts and responds to health probes.

---

## Phase 3: User Story 3 - Helm Charts (Priority: P2)

**Goal**: Create an umbrella Helm chart with three subcharts that packages the complete DoIt deployment.

**Independent Test**: Run `helm template` to render valid manifests, validate with `kubectl apply --dry-run=client`.

### Implementation for User Story 3

- [ ] T012 [US3] Create umbrella chart structure — helm/doit/Chart.yaml with apiVersion v2, name doit, version 0.1.0, appVersion 3.0.0, and dependency declarations for frontend, backend, mcp subcharts
- [ ] T013 [US3] Create helm/doit/templates/_helpers.tpl with common template helpers (fullname, labels, selectors)
- [ ] T014 [P] [US3] Create backend subchart — helm/doit/charts/backend/Chart.yaml, helm/doit/charts/backend/templates/deployment.yaml with liveness/readiness probes on /health, helm/doit/charts/backend/templates/service.yaml (ClusterIP port 8000), helm/doit/charts/backend/templates/configmap.yaml, helm/doit/charts/backend/templates/secret.yaml
- [ ] T015 [P] [US3] Create MCP subchart — helm/doit/charts/mcp/Chart.yaml, helm/doit/charts/mcp/templates/deployment.yaml with liveness/readiness probes on /health, helm/doit/charts/mcp/templates/service.yaml (ClusterIP port 8080), helm/doit/charts/mcp/templates/configmap.yaml, helm/doit/charts/mcp/templates/secret.yaml
- [ ] T016 [P] [US3] Create frontend subchart — helm/doit/charts/frontend/Chart.yaml, helm/doit/charts/frontend/templates/deployment.yaml with liveness/readiness probes on /, helm/doit/charts/frontend/templates/service.yaml (ClusterIP port 3000), helm/doit/charts/frontend/templates/configmap.yaml, helm/doit/charts/frontend/templates/secret.yaml
- [ ] T017 [US3] Create shared Ingress template in helm/doit/templates/ingress.yaml with path-based routing — `/` to frontend:3000, `/api` to backend:8000, `/mcp` to mcp:8080, host configurable via values
- [ ] T018 [US3] Create helm/doit/values.yaml with default configuration — global.ingressHost=doit.local, all service image repos/tags, ports, replica counts, env var mappings for ConfigMaps (CORS_ORIGINS, BACKEND_URL, MCP_URL, NEXT_PUBLIC_API_URL, BETTER_AUTH_URL, NEXT_PUBLIC_BETTER_AUTH_URL)
- [ ] T019 [US3] Create helm/doit/values.secret.yaml.example with placeholder structure for secrets — global.databaseUrl, global.betterAuthSecret, mcp.geminiApiKey, frontend OAuth credentials
- [ ] T020 [US3] Create helm/doit/.helmignore to exclude values.secret.yaml, .git, and temp files
- [ ] T021 [US3] Validate chart renders correctly — run `helm dependency update ./helm/doit && helm template doit ./helm/doit` and verify valid YAML output for all resources (3 Deployments, 3 Services, 3 ConfigMaps, 3 Secrets, 1 Ingress)

**Checkpoint**: Helm chart renders valid Kubernetes manifests for all services. `helm template` produces correct resources.

---

## Phase 4: User Story 1 - Deploy to Minikube & Validate (Priority: P1)

**Goal**: Deploy the full DoIt stack to a local Minikube cluster and verify end-to-end functionality.

**Independent Test**: Access http://doit.local in browser, sign in, create project, add tasks, write notes, chat with AI.

**Dependencies**: Requires US2 (images built) and US3 (Helm chart ready)

### Implementation for User Story 1

- [ ] T022 [US1] Start Minikube with `minikube start --cpus=4 --memory=8192 --driver=docker` and enable Ingress addon with `minikube addons enable ingress`
- [ ] T023 [US1] Build all three Docker images inside Minikube's Docker daemon — run `eval $(minikube docker-env)` then build doit-backend:latest, doit-mcp:latest, doit-frontend:latest
- [ ] T024 [US1] Create helm/doit/values.secret.yaml from the example file and populate with real DATABASE_URL, BETTER_AUTH_SECRET, GEMINI_API_KEY, and OAuth credentials
- [ ] T025 [US1] Deploy with `helm dependency update ./helm/doit && helm install doit ./helm/doit -f ./helm/doit/values.secret.yaml` and verify all pods reach Running status with `kubectl get pods`
- [ ] T026 [US1] Configure DNS — add Minikube IP (from `minikube ip`) mapped to `doit.local` in hosts file, then verify `curl http://doit.local` returns the frontend
- [ ] T027 [US1] Run full E2E validation — sign in via Better Auth, create a project, add tasks to Kanban board, write a note, send a chat message to AI assistant, verify all operations succeed
- [ ] T028 [US1] Test pod recovery — delete a pod with `kubectl delete pod <backend-pod>`, verify K8s restarts it within 60 seconds and app recovers
- [ ] T029 [US1] Test Helm lifecycle — run `helm upgrade doit ./helm/doit -f ./helm/doit/values.secret.yaml --set backend.replicaCount=2` to verify upgrade works, then `helm uninstall doit` to verify clean removal with no orphaned resources

**Checkpoint**: DoIt is fully functional on Minikube. All services healthy, Ingress routes traffic correctly, full app workflow works, pods self-heal.

---

## Phase 5: User Story 4 - AI-Assisted Kubernetes Operations (Priority: P3)

**Goal**: Set up kubectl-ai and kagent for natural language Kubernetes management.

**Independent Test**: Issue natural language commands and verify correct K8s operations are performed.

### Implementation for User Story 4

- [ ] T030 [US4] Install and configure kubectl-ai — follow setup instructions, configure API key, verify with `kubectl-ai "list all pods in default namespace"`
- [ ] T031 [US4] Test kubectl-ai operations — try `kubectl-ai "scale doit-backend to 2 replicas"`, `kubectl-ai "check why pods are failing"`, `kubectl-ai "show resource usage for all pods"`
- [ ] T032 [US4] Install and configure kagent — follow setup instructions, verify with `kagent "analyze cluster health"`
- [ ] T033 [US4] Document kubectl-ai and kagent example commands in the deployment guide

**Checkpoint**: kubectl-ai and kagent are operational. Developer can manage the cluster using natural language.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and deployment guide finalization.

- [ ] T034 [P] Update docs/README.md — add Phase IV section with local K8s deployment instructions, link to quickstart guide
- [ ] T035 [P] Create a Phase IV documentation file at docs/phase 4 - local k8s deployment/phase 4.md describing the architecture, Helm chart structure, and deployment workflow
- [ ] T036 Update CLAUDE.md with Phase IV technologies (Docker, Minikube, Helm, Kubernetes)
- [ ] T037 Verify quickstart.md steps work end-to-end on a fresh Minikube cluster (tear down and redo from step 1)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **US2 Containerize (Phase 2)**: Depends on Setup (T001 health endpoint required for MCP, T002 standalone for frontend)
- **US3 Helm Charts (Phase 3)**: Can start after Setup (T006 gitignore). Parallel with US2 for template writing, but chart testing needs images from US2
- **US1 Deploy & Validate (Phase 4)**: Depends on BOTH US2 (images) AND US3 (chart)
- **US4 AI Ops (Phase 5)**: Depends on US1 (needs running cluster to test against)
- **Polish (Phase 6)**: Depends on US1 completion

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ├──→ Phase 2 (US2: Containerize) ──┐
    │                                   ├──→ Phase 4 (US1: Deploy & Validate) ──→ Phase 5 (US4: AI Ops)
    └──→ Phase 3 (US3: Helm Charts) ───┘                                       │
                                                                                └──→ Phase 6 (Polish)
```

### Within Each User Story

- Parallel tasks ([P]) can run simultaneously (different files)
- Sequential tasks must complete in order (dependencies within the story)
- Each story has a checkpoint for validation before proceeding

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel (different .dockerignore files)
- **Phase 2**: T007, T008, T009 can run in parallel (different Dockerfiles)
- **Phase 3**: T014, T015, T016 can run in parallel (different subcharts)
- **Phase 6**: T034, T035 can run in parallel (different doc files)
- **Cross-phase**: US3 template writing (T012-T020) can overlap with US2 (T007-T009) since they touch different directories

---

## Parallel Example: User Story 2 (Containerize)

```bash
# Launch all Dockerfiles in parallel (different files):
Task T007: "Write multi-stage Dockerfile for backend in backend/Dockerfile"
Task T008: "Write multi-stage Dockerfile for MCP in mcp/Dockerfile"
Task T009: "Write multi-stage Dockerfile for frontend in frontend/Dockerfile"

# Then sequential validation:
Task T010: "Verify all three images build successfully"
Task T011: "Verify each image runs and responds"
```

## Parallel Example: User Story 3 (Helm Charts)

```bash
# Launch all subcharts in parallel (different directories):
Task T014: "Create backend subchart in helm/doit/charts/backend/"
Task T015: "Create MCP subchart in helm/doit/charts/mcp/"
Task T016: "Create frontend subchart in helm/doit/charts/frontend/"

# Then sequential integration:
Task T017: "Create shared Ingress template"
Task T018: "Create values.yaml with all config"
Task T021: "Validate chart renders correctly"
```

---

## Implementation Strategy

### MVP First (US2 + US3 + US1)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: US2 Containerize (T007-T011)
3. Complete Phase 3: US3 Helm Charts (T012-T021)
4. Complete Phase 4: US1 Deploy & Validate (T022-T029)
5. **STOP and VALIDATE**: Full app works on Minikube
6. Deploy/demo if ready

### Full Delivery

1. MVP above ✅
2. Add Phase 5: US4 AI Ops (T030-T033) — optional enhancement
3. Add Phase 6: Polish (T034-T037) — documentation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US2 and US3 are prerequisites for US1 despite all being high priority
- US4 is optional — core deployment works without kubectl-ai/kagent
- `eval $(minikube docker-env)` must be active when building images for Minikube
- `imagePullPolicy: IfNotPresent` in Helm values prevents Minikube from trying to pull from a registry
- NEXT_PUBLIC_* env vars are baked at build time — frontend image must be built with correct Ingress URL
