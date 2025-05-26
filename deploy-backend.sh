#!/bin/bash

# Deploy Java Backend to Cloud Run
# This script builds and deploys the Spring Boot backend

set -e

PROJECT_ID="mach33-research-tool-460917"
REGION="us-central1"
SERVICE_NAME="research-platform-api"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Starting deployment of Java backend..."

# Build the Docker image for linux/amd64 platform (required for Cloud Run)
echo "📦 Building Docker image for linux/amd64..."
docker build --platform linux/amd64 -t $IMAGE_NAME:latest ./backend-java

# Tag with commit hash for versioning
COMMIT_SHA=$(git rev-parse --short HEAD)
docker tag $IMAGE_NAME:latest $IMAGE_NAME:$COMMIT_SHA

echo "🔐 Authenticating with Google Cloud..."
# You'll need to run: gcloud auth login
# And: gcloud auth configure-docker

echo "📤 Pushing image to Google Container Registry..."
docker push $IMAGE_NAME:latest
docker push $IMAGE_NAME:$COMMIT_SHA

echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME:$COMMIT_SHA \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --timeout=300

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://$SERVICE_NAME-214656435079.$REGION.run.app" 