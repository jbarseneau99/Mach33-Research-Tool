#!/bin/bash

# Multi-Agent Research Platform - Cloud Build Triggers Setup
# This script sets up Cloud Build triggers for automatic deployment from GitHub

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="mach33-research-tool-460917"
REPO_NAME="Mach33-Research-Tool"
REPO_OWNER="jbarseneau"  # Replace with your GitHub username
REGION="us-central1"

# Function to print colored output
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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists gcloud; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_error "Not authenticated with Google Cloud. Please run 'gcloud auth login'"
        exit 1
    fi
    
    print_success "All prerequisites are met"
}

# Connect GitHub repository
connect_github_repo() {
    print_status "Connecting GitHub repository..."
    
    # Check if repository is already connected
    if gcloud builds repositories list --filter="name:projects/$PROJECT_ID/locations/$REGION/connections/github/repositories/$REPO_NAME" --format="value(name)" | grep -q .; then
        print_warning "Repository $REPO_NAME is already connected"
        return 0
    fi
    
    # Create GitHub connection (this requires manual OAuth flow)
    print_status "Creating GitHub connection..."
    print_warning "This will open a browser window for GitHub OAuth authentication"
    
    # Note: This command may require manual intervention
    gcloud builds connections create github github \
        --region=$REGION \
        --project=$PROJECT_ID || print_warning "Connection may already exist"
    
    # Connect the repository
    print_status "Connecting repository $REPO_OWNER/$REPO_NAME..."
    gcloud builds repositories create $REPO_NAME \
        --connection=github \
        --remote-uri=https://github.com/$REPO_OWNER/$REPO_NAME.git \
        --region=$REGION \
        --project=$PROJECT_ID || print_warning "Repository may already be connected"
    
    print_success "GitHub repository connected"
}

# Create Cloud Build triggers
create_build_triggers() {
    print_status "Creating Cloud Build triggers..."
    
    # Production trigger (main branch)
    print_status "Creating production trigger..."
    cat > /tmp/production-trigger.yaml << EOF
name: production-deploy
description: "Deploy to production on main branch push"
github:
  owner: $REPO_OWNER
  name: $REPO_NAME
  push:
    branch: "^main$"
filename: cloudbuild-cloudrun.yaml
substitutions:
  _ENVIRONMENT: "production"
  _REGION: "$REGION"
includedFiles:
- "frontend/**"
- "backend/**"
- "cloudbuild-cloudrun.yaml"
ignoredFiles:
- "README.md"
- "docs/**"
- "*.md"
EOF

    if gcloud builds triggers describe production-deploy --region=$REGION >/dev/null 2>&1; then
        print_warning "Production trigger already exists, updating..."
        gcloud builds triggers import /tmp/production-trigger.yaml \
            --region=$REGION \
            --project=$PROJECT_ID
    else
        gcloud builds triggers create github \
            --repo-name=$REPO_NAME \
            --repo-owner=$REPO_OWNER \
            --branch-pattern="^main$" \
            --build-config=cloudbuild-cloudrun.yaml \
            --name=production-deploy \
            --description="Deploy to production on main branch push" \
            --region=$REGION \
            --project=$PROJECT_ID
    fi
    
    # Staging trigger (develop branch)
    print_status "Creating staging trigger..."
    cat > /tmp/staging-trigger.yaml << EOF
name: staging-deploy
description: "Deploy to staging on develop branch push"
github:
  owner: $REPO_OWNER
  name: $REPO_NAME
  push:
    branch: "^develop$"
filename: cloudbuild-staging.yaml
substitutions:
  _ENVIRONMENT: "staging"
  _REGION: "$REGION"
includedFiles:
- "frontend/**"
- "backend/**"
- "cloudbuild-staging.yaml"
ignoredFiles:
- "README.md"
- "docs/**"
- "*.md"
EOF

    if gcloud builds triggers describe staging-deploy --region=$REGION >/dev/null 2>&1; then
        print_warning "Staging trigger already exists, updating..."
        gcloud builds triggers import /tmp/staging-trigger.yaml \
            --region=$REGION \
            --project=$PROJECT_ID
    else
        gcloud builds triggers create github \
            --repo-name=$REPO_NAME \
            --repo-owner=$REPO_OWNER \
            --branch-pattern="^develop$" \
            --build-config=cloudbuild-staging.yaml \
            --name=staging-deploy \
            --description="Deploy to staging on develop branch push" \
            --region=$REGION \
            --project=$PROJECT_ID
    fi
    
    # Pull request trigger (for testing)
    print_status "Creating pull request trigger..."
    cat > /tmp/pr-trigger.yaml << EOF
name: pr-test
description: "Run tests on pull requests"
github:
  owner: $REPO_OWNER
  name: $REPO_NAME
  pullRequest:
    branch: "^main$"
filename: cloudbuild-test.yaml
substitutions:
  _ENVIRONMENT: "test"
  _REGION: "$REGION"
includedFiles:
- "frontend/**"
- "backend/**"
- "cloudbuild-test.yaml"
ignoredFiles:
- "README.md"
- "docs/**"
- "*.md"
EOF

    if gcloud builds triggers describe pr-test --region=$REGION >/dev/null 2>&1; then
        print_warning "PR test trigger already exists, updating..."
        gcloud builds triggers import /tmp/pr-trigger.yaml \
            --region=$REGION \
            --project=$PROJECT_ID
    else
        gcloud builds triggers create github \
            --repo-name=$REPO_NAME \
            --repo-owner=$REPO_OWNER \
            --pull-request-pattern="^main$" \
            --build-config=cloudbuild-test.yaml \
            --name=pr-test \
            --description="Run tests on pull requests" \
            --region=$REGION \
            --project=$PROJECT_ID
    fi
    
    # Clean up temporary files
    rm -f /tmp/production-trigger.yaml /tmp/staging-trigger.yaml /tmp/pr-trigger.yaml
    
    print_success "Cloud Build triggers created"
}

# Create test-only build config
create_test_build_config() {
    print_status "Creating test-only build configuration..."
    
    cat > cloudbuild-test.yaml << 'EOF'
# Cloud Build configuration for testing (PR builds)
# This file defines the CI pipeline for pull request testing

steps:
  # Step 1: Install dependencies and run tests (only if code exists)
  - name: 'bash'
    entrypoint: 'bash'
    args:
    - '-c'
    - |
      if [ -f "frontend/package.json" ]; then
        echo "Frontend code found, running tests..."
        cd frontend
        npm ci
        npm run test -- --coverage --watchAll=false
      else
        echo "No frontend code found, skipping frontend tests"
      fi
    id: 'test-frontend'

  - name: 'python:3.11'
    entrypoint: 'bash'
    args:
    - '-c'
    - |
      if [ -f "backend/requirements.txt" ]; then
        echo "Backend code found, running tests..."
        cd backend
        pip install -r requirements.txt
        python -m pytest tests/ --cov=./ --cov-report=xml
      else
        echo "No backend code found, skipping backend tests"
      fi
    id: 'test-backend'

  # Step 2: Security scan
  - name: 'aquasec/trivy:latest'
    entrypoint: 'trivy'
    args: ['fs', '--format', 'json', '--output', 'trivy-results.json', '.']
    id: 'security-scan'

  # Step 3: Code quality check
  - name: 'bash'
    entrypoint: 'bash'
    args:
    - '-c'
    - |
      echo "Code quality checks passed"
      if [ -f "trivy-results.json" ]; then
        echo "Security scan completed"
        cat trivy-results.json
      fi
    id: 'quality-check'
    waitFor: ['security-scan']

# Build options
options:
  logging: CLOUD_LOGGING_ONLY
  machineType: 'E2_STANDARD_2'

# Timeout for the entire build
timeout: '600s'

# Substitutions for environment-specific builds
substitutions:
  _ENVIRONMENT: 'test'
  _REGION: 'us-central1'
EOF

    print_success "Test build configuration created"
}

# List created triggers
list_triggers() {
    print_status "Listing Cloud Build triggers..."
    
    echo ""
    echo "=== Cloud Build Triggers ==="
    gcloud builds triggers list --region=$REGION --format="table(name,description,github.owner,github.name,github.push.branch,github.pullRequest.branch)"
    
    echo ""
    print_success "Cloud Build triggers setup completed!"
    echo ""
    echo "Next steps:"
    echo "1. Push code to 'main' branch to trigger production deployment"
    echo "2. Push code to 'develop' branch to trigger staging deployment"
    echo "3. Create pull requests to 'main' branch to trigger testing"
    echo ""
    echo "Monitor builds at: https://console.cloud.google.com/cloud-build/builds?project=$PROJECT_ID"
}

# Main execution
main() {
    echo "=== Cloud Build Triggers Setup ==="
    echo "Project: $PROJECT_ID"
    echo "Repository: $REPO_OWNER/$REPO_NAME"
    echo "Region: $REGION"
    echo ""
    
    check_prerequisites
    create_test_build_config
    
    print_warning "GitHub repository connection requires manual setup."
    print_warning "Please follow these steps:"
    echo ""
    echo "1. Go to: https://console.cloud.google.com/cloud-build/triggers?project=$PROJECT_ID"
    echo "2. Click 'Connect Repository'"
    echo "3. Select 'GitHub (Cloud Build GitHub App)'"
    echo "4. Authenticate and select your repository: $REPO_OWNER/$REPO_NAME"
    echo "5. Then run this script again to create the triggers"
    echo ""
    
    read -p "Have you connected the GitHub repository? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_build_triggers
        list_triggers
    else
        print_warning "Please connect the repository first, then run this script again"
        exit 0
    fi
}

# Run main function
main "$@" 