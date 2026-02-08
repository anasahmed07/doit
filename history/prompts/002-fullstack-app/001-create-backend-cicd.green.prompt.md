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
tests_yaml: []
---

## Summary
Created a GitHub Actions workflow to deploy the `backend/` directory to Hugging Face Spaces.

## Outcome
- Created `.github/workflows/deploy-backend.yml`.
- Configured path filters to trigger only on `backend/**` changes.
- Used `git subtree split` strategy to push only the backend subdirectory to the remote Space.
- Provided instructions for setting up `HF_TOKEN` and `HF_BACKEND_SPACE_NAME` secrets.
