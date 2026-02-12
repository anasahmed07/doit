# Use Python 3.13 slim image
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install UV
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy all files
COPY . .

# Install dependencies using UV
RUN uv sync --frozen --no-cache

# Expose the port the app runs on (7860 for Hugging Face)
EXPOSE 8080

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Run the application using UV
CMD ["uv", "run", "prod"]
