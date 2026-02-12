# Quickstart: Local Kubernetes Deployment

**Feature**: 004-minikube-k8s-deployment
**Date**: 2026-02-11

## Prerequisites

- Docker Desktop (4.x+)
- Minikube (`brew install minikube` / `choco install minikube` / `winget install minikube`)
- Helm (`brew install helm` / `choco install kubernetes-helm`)
- kubectl (`brew install kubectl` / `choco install kubernetes-cli`)
- Optional: kubectl-ai, kagent

## Step 1: Start Minikube

```bash
minikube start --cpus=4 --memory=8192 --driver=docker
minikube addons enable ingress
```

## Step 2: Build Docker Images

```bash
# Point Docker CLI at Minikube's Docker daemon
eval $(minikube docker-env)

# Build all three images
docker build -t doit-backend:latest ./backend
docker build -t doit-mcp:latest ./mcp
docker build -t doit-frontend:latest ./frontend
```

## Step 3: Configure Secrets

```bash
# Copy the example secrets file
cp helm/doit/values.secret.yaml.example helm/doit/values.secret.yaml

# Edit with your actual values
# Required: databaseUrl, betterAuthSecret, geminiApiKey
```

## Step 4: Deploy with Helm

```bash
# Update chart dependencies
helm dependency update ./helm/doit

# Install
helm install doit ./helm/doit -f ./helm/doit/values.secret.yaml
```

## Step 5: Configure DNS

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (or C:\Windows\System32\drivers\etc\hosts on Windows)
# <minikube-ip>  doit.local
```

## Step 6: Access the Application

Open http://doit.local in your browser.

## Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Check services
kubectl get svc

# Check ingress
kubectl get ingress

# View logs for a specific service
kubectl logs -l app=doit-backend
kubectl logs -l app=doit-mcp
kubectl logs -l app=doit-frontend
```

## Teardown

```bash
helm uninstall doit
minikube stop
# Or to fully delete: minikube delete
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Pods stuck in ImagePullBackOff | Ensure images are built with `eval $(minikube docker-env)` active |
| Ingress not working | Verify addon: `minikube addons list \| grep ingress` |
| Database connection refused | Check Neon DB allows external connections; verify DATABASE_URL in secrets |
| Frontend shows blank page | Check NEXT_PUBLIC_* env vars are set correctly for `doit.local` |
| Pod OOMKilled | Increase Minikube memory: `minikube start --memory=12288` |
