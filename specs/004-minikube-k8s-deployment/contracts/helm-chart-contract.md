# Helm Chart Contract: DoIt Umbrella Chart

**Feature**: 004-minikube-k8s-deployment
**Date**: 2026-02-11

## Chart Metadata

```yaml
# helm/doit/Chart.yaml
apiVersion: v2
name: doit
description: DoIt productivity platform - umbrella Helm chart
type: application
version: 0.1.0
appVersion: "3.0.0"
dependencies:
  - name: frontend
    version: 0.1.0
    repository: file://charts/frontend
  - name: backend
    version: 0.1.0
    repository: file://charts/backend
  - name: mcp
    version: 0.1.0
    repository: file://charts/mcp
```

## Ingress Contract

```yaml
# Path-based routing rules
rules:
  - host: doit.local
    paths:
      - path: /
        pathType: Prefix
        service: frontend → port 3000
      - path: /api
        pathType: Prefix
        service: backend → port 8000
      - path: /mcp
        pathType: Prefix
        service: mcp → port 8080
```

## Service Contracts

### Backend Service
- **Type**: ClusterIP
- **Port**: 8000 → container port 8000
- **Name**: doit-backend
- **Probes**:
  - Liveness: `GET /health` every 30s, timeout 5s, 3 failures
  - Readiness: `GET /health` every 10s, timeout 5s, 3 failures

### MCP Service
- **Type**: ClusterIP
- **Port**: 8080 → container port 8080
- **Name**: doit-mcp
- **Probes**:
  - Liveness: `GET /health` every 30s, timeout 5s, 3 failures
  - Readiness: `GET /health` every 10s, timeout 5s, 3 failures

### Frontend Service
- **Type**: ClusterIP
- **Port**: 3000 → container port 3000
- **Name**: doit-frontend
- **Probes**:
  - Liveness: `GET /` every 30s, timeout 5s, 3 failures
  - Readiness: `GET /` every 10s, timeout 5s, 3 failures

## Secret Contract

```yaml
# values.secret.yaml structure
global:
  databaseUrl: <required>
  betterAuthSecret: <required>
mcp:
  geminiApiKey: <required>
frontend:
  googleClientId: <optional>
  googleClientSecret: <optional>
  githubClientId: <optional>
  githubClientSecret: <optional>
```

## Install Command Contract

```bash
# Standard install
helm install doit ./helm/doit -f ./helm/doit/values.secret.yaml

# With custom namespace
helm install doit ./helm/doit -f ./helm/doit/values.secret.yaml --namespace doit --create-namespace

# Upgrade
helm upgrade doit ./helm/doit -f ./helm/doit/values.secret.yaml

# Uninstall
helm uninstall doit
```
