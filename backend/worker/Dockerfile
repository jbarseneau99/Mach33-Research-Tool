FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy worker code
COPY . .

# Copy Django settings from API
COPY research_platform /app/research_platform

# Expose port (for health checks)
EXPOSE 8080

# Run celery worker
CMD ["celery", "-A", "celery_app", "worker", "--loglevel=info", "--concurrency=2"] 