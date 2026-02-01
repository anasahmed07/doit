---
id: "003"
title: "Containerize Backend for Hugging Face"
stage: "implement"
date: "2026-01-31"
surface: "agent"
model: "gemini-2.0-flash-thinking-exp"
feature: "002-fullstack-app"
branch: "main"
user: "Anas"
command: "containerize backend"
labels: ["docker", "huggingface", "uv", "fastapi"]
links:
  spec: "specs/002-fullstack-app/spec.md"
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - backend/Dockerfile
  - backend/README.md
  - backend/src/backend/__init__.py
  - backend/.dockerignore
tests_yaml: |
  - none
---

# PROMPT_TEXT
i wanna containarize the backend repository with dockerfile so ill be able to deploy it on hugging face

append this to the top of readme of backend with correct data
title: Supply Guard AI Backend
emoji: 🐨
colorFrom: yellow
colorTo: blue
sdk: docker
pinned: false
and this is the docker file to containerize simmilar apis that are using uv

Use Python 3.12 slim image
FROM python:3.12-slim

Set working directory
WORKDIR /app

Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

Copy all files
COPY . .

Install dependencies using UV
RUN uv sync --frozen --no-cache

Expose the port the app runs on (7860 for Hugging Face)
EXPOSE 7860

Set environment variables
ENV PYTHONUNBUFFERED=1

Run the application using UV
CMD ["uv", "run", "prod"]

# RESPONSE_TEXT
I have containerized the backend for Hugging Face deployment.

- Created `backend/Dockerfile` using `python:3.13-slim` (to match your `pyproject.toml` requirement of `>=3.13`).
- Updated `backend/README.md` with the required metadata.
- Updated `backend/src/backend/__init__.py` to allow the `production` script to listen on `0.0.0.0:7860` by default.
- Added `backend/.dockerignore` to optimize the build.

# OUTCOME
The backend is now ready for deployment on Hugging Face Spaces.
