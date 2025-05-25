#!/bin/bash

# Multi-Agent Research Platform - GCP Status Check Script
# This script checks the status of all Google Cloud resources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="mach33-research-tool-460917"

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "=== Google Cloud Platform Status Check ==="
echo "Project: $PROJECT_ID"
echo "Time: $(date)"
echo

# Check project and billing
print_status "Checking project and billing..."
gcloud config get-value project
gcloud billing projects describe $PROJECT_ID --format="value(billingEnabled)" | grep -q "True" && print_success "Billing enabled" || print_error "Billing not enabled"
echo

# Check enabled APIs
print_status "Checking enabled APIs..."
gcloud services list --enabled --format="value(name)" | grep -E "(cloudbuild|run|sql|storage|pubsub)" | while read api; do
    print_success "✓ $api"
done
echo

# Check Cloud SQL
print_status "Checking Cloud SQL instances..."
if gcloud sql instances list --format="value(name)" | grep -q "research-platform-db"; then
    status=$(gcloud sql instances describe research-platform-db --format="value(state)")
    if [ "$status" = "RUNNABLE" ]; then
        print_success "✓ Cloud SQL instance: research-platform-db (RUNNABLE)"
    else
        print_warning "⏳ Cloud SQL instance: research-platform-db ($status)"
    fi
else
    print_warning "⏳ Cloud SQL instance: research-platform-db (NOT FOUND)"
fi
echo

# Check Storage Buckets
print_status "Checking storage buckets..."
for bucket in "research-documents" "research-artifacts" "research-backups"; do
    if gsutil ls -b gs://$PROJECT_ID-$bucket >/dev/null 2>&1; then
        print_success "✓ Storage bucket: $PROJECT_ID-$bucket"
    else
        print_warning "⏳ Storage bucket: $PROJECT_ID-$bucket (NOT FOUND)"
    fi
done
echo

# Check Pub/Sub Topics
print_status "Checking Pub/Sub topics..."
for topic in "research-events" "quality-assessments" "ai-agent-requests" "session-updates"; do
    if gcloud pubsub topics describe $topic >/dev/null 2>&1; then
        print_success "✓ Pub/Sub topic: $topic"
    else
        print_warning "⏳ Pub/Sub topic: $topic (NOT FOUND)"
    fi
done
echo

# Check Service Accounts
print_status "Checking service accounts..."
for sa in "research-platform-api" "research-platform-worker"; do
    if gcloud iam service-accounts describe "${sa}@${PROJECT_ID}.iam.gserviceaccount.com" >/dev/null 2>&1; then
        print_success "✓ Service account: $sa"
    else
        print_warning "⏳ Service account: $sa (NOT FOUND)"
    fi
done
echo

# Check Cloud Run services
print_status "Checking Cloud Run services..."
for service in "research-platform-frontend" "research-platform-api" "research-platform-worker"; do
    if gcloud run services describe $service --region=us-central1 >/dev/null 2>&1; then
        url=$(gcloud run services describe $service --region=us-central1 --format="value(status.url)")
        print_success "✓ Cloud Run service: $service ($url)"
    else
        print_warning "⏳ Cloud Run service: $service (NOT DEPLOYED)"
    fi
done
echo

# Summary
print_status "Setup Status Summary:"
echo "- If you see ⏳ items, the setup is still in progress"
echo "- If you see ✓ items, those resources are ready"
echo "- Run this script again to check updated status"
echo
print_status "To monitor setup progress: tail -f /tmp/gcp-setup.log"
print_status "To check Cloud SQL creation: gcloud sql operations list --instance=research-platform-db" 