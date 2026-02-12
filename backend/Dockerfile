# Stage 1: Builder
FROM python:3.13-slim AS builder

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Install dependencies first (layer caching)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-cache

# Copy source
COPY src/ src/

# Stage 2: Runtime
FROM python:3.13-slim

WORKDIR /app

# Install uv for uv run
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy built artifacts from builder
COPY --from=builder /app/.venv .venv
COPY --from=builder /app/src src
COPY --from=builder /app/pyproject.toml pyproject.toml

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uv", "run", "prod"]
