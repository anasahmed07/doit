# Feature Specification: Local Kubernetes Deployment

**Feature Branch**: `004-minikube-k8s-deployment`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "Phase IV — Local Kubernetes deployment using Minikube, Helm Charts, kubectl-ai, and Kagent for the DoIt productivity platform"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Full Application Stack to Local Kubernetes (Priority: P1)

A developer wants to deploy the entire DoIt application (frontend, backend, MCP service) to a local Kubernetes cluster running on Minikube so they can validate that the system works in a container-orchestrated environment before moving to cloud deployment.

**Why this priority**: This is the core deliverable of Phase IV. Without a working local Kubernetes deployment, none of the other stories matter. It proves the application is Kubernetes-ready.

**Independent Test**: Can be fully tested by running `helm install` on a Minikube cluster and accessing the DoIt application through a browser, verifying that the dashboard, projects, notes, and chat all function correctly.

**Acceptance Scenarios**:

1. **Given** a running Minikube cluster with all prerequisites installed, **When** the developer runs the Helm install command, **Then** all three services (frontend, backend, MCP) start successfully as Kubernetes pods.
2. **Given** the application is deployed on Minikube, **When** the developer accesses the frontend URL, **Then** they can log in, view the dashboard, manage tasks, and use the AI chat — identical to the Docker Compose experience.
3. **Given** the application is deployed on Minikube, **When** any pod crashes or is deleted, **Then** Kubernetes automatically restarts it and the application recovers without manual intervention.
4. **Given** the application is deployed on Minikube, **When** the developer runs `kubectl get pods`, **Then** all pods show a `Running` status with no restart loops.

---

### User Story 2 - Containerize All Services with Production-Ready Docker Images (Priority: P1)

A developer wants to build optimized, production-ready Docker images for each of the three services (frontend, backend, MCP) that are suitable for Kubernetes deployment — smaller, faster, and secure.

**Why this priority**: Kubernetes deploys containers. Without properly containerized services, nothing else in Phase IV can proceed. This is a prerequisite for all Kubernetes work.

**Independent Test**: Can be fully tested by building each Docker image locally, running them individually with `docker run`, and verifying each service starts and responds to health checks.

**Acceptance Scenarios**:

1. **Given** the project source code, **When** the developer builds the frontend Docker image, **Then** the image builds successfully and serves the Next.js application.
2. **Given** the project source code, **When** the developer builds the backend Docker image, **Then** the image builds successfully and the FastAPI server starts and responds to API requests.
3. **Given** the project source code, **When** the developer builds the MCP service Docker image, **Then** the image builds successfully and the MCP service starts and connects to the database.
4. **Given** all three images are built, **When** the developer inspects the images, **Then** they use multi-stage builds, have no unnecessary build dependencies in the final image, and are reasonably sized.

---

### User Story 3 - Manage Deployments with Helm Charts (Priority: P2)

A developer wants reusable, parameterized Helm charts that package the Kubernetes manifests for all DoIt services, so deployments are repeatable, configurable, and version-controlled.

**Why this priority**: Helm charts are the standard way to package Kubernetes applications. They make deployment repeatable and configurable across environments (local vs cloud in Phase V).

**Independent Test**: Can be fully tested by running `helm template` to render manifests, validating them with `kubectl apply --dry-run`, and deploying to Minikube with `helm install`.

**Acceptance Scenarios**:

1. **Given** the Helm chart exists, **When** the developer runs `helm template`, **Then** valid Kubernetes manifests are generated for all services, including Deployments, Services, ConfigMaps, and Secrets.
2. **Given** the Helm chart is installed on Minikube, **When** the developer changes a configuration value (e.g., replica count, image tag), **Then** `helm upgrade` applies the change without downtime.
3. **Given** the Helm chart is installed, **When** the developer runs `helm uninstall`, **Then** all Kubernetes resources created by the chart are cleanly removed.
4. **Given** the Helm chart values file, **When** the developer reviews it, **Then** all environment-specific values (database URL, API keys, service URLs) are configurable without modifying templates.

---

### User Story 4 - Use AI-Assisted Kubernetes Operations (Priority: P3)

A developer wants to use kubectl-ai and kagent to perform Kubernetes operations using natural language commands, making cluster management more accessible and efficient.

**Why this priority**: AI-assisted operations are a learning and productivity enhancement. The core deployment works without them, but they demonstrate modern AIOps practices.

**Independent Test**: Can be tested by issuing natural language commands to kubectl-ai (e.g., "show all pods in the doit namespace") and verifying correct Kubernetes operations are performed.

**Acceptance Scenarios**:

1. **Given** kubectl-ai is installed and configured, **When** the developer asks "deploy the todo frontend with 2 replicas", **Then** kubectl-ai generates and applies the correct Kubernetes manifest.
2. **Given** the application is deployed, **When** the developer asks kubectl-ai "check why pods are failing", **Then** kubectl-ai provides diagnostic information about pod status and events.
3. **Given** kagent is installed, **When** the developer asks kagent to "analyze cluster health", **Then** kagent provides a summary of cluster resource usage, pod health, and potential issues.

---

### Edge Cases

- What happens when Minikube runs out of allocated memory or CPU during deployment?
- How does the system handle database connectivity issues when the Neon DB is unreachable from inside the cluster?
- What happens when a Docker image build fails mid-way (e.g., npm install fails due to network issues)?
- How does Helm handle a failed upgrade where only some resources were updated?
- What happens if the developer tries to deploy without first loading images into Minikube's Docker daemon?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide new production-ready Dockerfiles for all three services (frontend, backend, MCP), written from scratch following a consistent multi-stage template — replacing any existing Dockerfiles
- **FR-002**: All Docker images MUST use multi-stage builds to minimize final image size, exclude build-time dependencies, and follow a consistent pattern across all three services
- **FR-003**: Each containerized service MUST expose a health check endpoint that Kubernetes can probe for liveness and readiness
- **FR-004**: System MUST provide an umbrella Helm chart (`doit/`) with three subcharts (`frontend/`, `backend/`, `mcp/`), deployable with a single `helm install` command
- **FR-005**: Helm chart MUST include Kubernetes Services to enable inter-service communication within the cluster
- **FR-006**: Helm chart MUST include ConfigMaps for non-sensitive config and Kubernetes Secrets for sensitive values (database URLs, API keys, auth secrets), populated from a gitignored `values.secret.yaml` file passed at install time
- **FR-007**: Helm chart values MUST be configurable so the same chart works for local Minikube and can be adapted for cloud deployment in Phase V
- **FR-008**: System MUST provide clear setup instructions for Minikube, including resource allocation recommendations
- **FR-009**: The Helm chart MUST include an Ingress resource that routes traffic to all services via path-based routing (e.g., `/` for frontend, `/api` for backend, `/mcp` for MCP), using Minikube's built-in Ingress addon
- **FR-010**: The backend and MCP services MUST use ClusterIP Services, reachable only within the cluster; the Ingress handles external access
- **FR-011**: All services deployed on Kubernetes MUST function identically to the existing Docker Compose setup — users can log in, manage tasks/projects/notes, and use the AI chat
- **FR-012**: System MUST support kubectl-ai for natural language Kubernetes operations
- **FR-013**: System MUST support kagent for AI-assisted cluster analysis and management

### Key Entities

- **Docker Image**: A packaged, runnable artifact for each service (frontend, backend, MCP) — defined by a Dockerfile, tagged with version
- **Helm Chart**: A versioned package of Kubernetes manifests with parameterized values — contains templates for Deployments, Services, ConfigMaps, Secrets
- **Kubernetes Deployment**: A desired-state declaration for each service — manages pod replicas, rolling updates, health checks
- **Kubernetes Service**: A stable network endpoint for each deployment — enables service discovery via DNS within the cluster
- **Kubernetes Secret**: Encrypted storage for sensitive configuration — database credentials, API keys, auth secrets
- **Kubernetes ConfigMap**: Non-sensitive configuration data — service URLs, feature flags, runtime settings

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All three services (frontend, backend, MCP) deploy successfully to Minikube and reach a healthy running state within 5 minutes of running `helm install`
- **SC-002**: A user can complete the full application workflow (sign in, create a project, add tasks, write notes, chat with AI) through the Kubernetes-deployed application without errors
- **SC-003**: When a pod is manually deleted, Kubernetes restores it to a healthy state within 60 seconds
- **SC-004**: The Helm chart can be installed, upgraded (with changed values), and uninstalled cleanly with no orphaned resources
- **SC-005**: Docker images for all services build successfully in under 10 minutes on a standard development machine
- **SC-006**: A developer following the setup documentation can go from zero (no Minikube installed) to a running deployment in under 30 minutes
- **SC-007**: kubectl-ai and kagent can be used to perform at least basic cluster inspection and scaling operations via natural language

## Clarifications

### Session 2026-02-11

- Q: How should users access the DoIt frontend from their browser on Minikube? → A: Ingress — a single entry point with path-based routing (e.g., `/` for frontend, `/api` for backend). Requires enabling Minikube's Ingress addon.
- Q: How should the Helm chart be structured? → A: Umbrella chart with subcharts — one parent chart (`doit/`) containing three subcharts (`frontend/`, `backend/`, `mcp/`). Single `helm install` deploys everything.
- Q: How should secrets (DB URL, API keys, auth secret) be provided to the cluster? → A: Separate `values.secret.yaml` — a gitignored file passed via `helm install -f values.secret.yaml`. Helm creates K8s Secrets from those values.
- Q: What should happen with the existing Dockerfiles? → A: Start fresh for all three — write new production-ready Dockerfiles from scratch following a consistent multi-stage template for all services.
- Q: What minimum Minikube resource allocation should be documented? → A: 4 CPUs / 8GB RAM — comfortable margin for all services plus Ingress. Requires a machine with at least 16GB total RAM.

## Assumptions

- The developer has Docker Desktop installed and running with sufficient resources (minimum 4 CPU cores, 8GB RAM allocated to Minikube)
- The Neon serverless PostgreSQL database is accessible from inside the Minikube cluster (external network access is available)
- The existing Docker Compose setup from Phase III is the baseline for understanding service configuration, but all Dockerfiles will be written fresh for Kubernetes deployment
- Gordon (Docker AI Agent) may not be available in all regions/tiers; standard Docker CLI is an acceptable fallback
- kubectl-ai and kagent are optional enhancements; the core deployment must work without them
- The existing application environment variables and configuration from Phase III carry forward
