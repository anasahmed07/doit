---
id: 1
title: Create CI/CD pipeline for backend deployment to Hugging Face
stage: green
date: 2026-02-09
surface: agent
model: gemini-2.0-flash
feature: 002-fullstack-app
branch: main
user: anas.shaikh
command: "i want you to create a ci cd pipeline that deploys the backend to hugging face spaces mean push the backend/ code to its hugging face space if the backend folder has any changes"
labels: ["github-actions", "huggingface", "deployment", "cicd"]
links:
  spec: "specs/002-fullstack-app/spec.md"
  plan: "specs/002-fullstack-app/plan.md"
  adr: null
  pr: null
files_yaml:
  - .github/workflows/deploy-backend.yml
  - .github/workflows/deploy-mcp.yml
tests_yaml: []
---

## Summary
Created GitHub Actions workflows to deploy the `backend/` and `mcp/` directories to separate Hugging Face Spaces.

## Outcome
- Created `.github/workflows/deploy-backend.yml` for the FastAPI backend.
- Created `.github/workflows/deploy-mcp.yml` for the standalone MCP service.
- Configured path filters to trigger only on relevant folder changes.
- Used `git subtree split` and `--force` push to ensure deployment succeeds even if the remote Spaces have diverged history.
- Provided instructions for setting up `HF_TOKEN`, `HF_BACKEND_SPACE_NAME` (e.g., anas-ahmed/doit-backend), and `HF_MCP_SPACE_NAME` (e.g., anas-ahmed/doit-mcp) secrets.
