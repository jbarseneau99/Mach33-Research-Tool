#!/bin/bash

# Multi-Agent Research Platform - Google Cloud Setup Script (Cloud Run Version)
# This script sets up the infrastructure using Cloud Run instead of GKE

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="mach33-research-tool-460917"
PROJECT_NAME="Mach33 Research Tool"
REGION="us-central1"
DB_INSTANCE_NAME="research-platform-db"

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
    
    print_success "All prerequisites are installed"
}

# Authenticate with Google Cloud
authenticate() {
    print_status "Authenticating with Google Cloud..."
    
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        print_status "No active authentication found. Please authenticate:"
        gcloud auth login
    fi
    
    print_success "Authentication verified"
}

# Set project
setup_project() {
    print_status "Setting up Google Cloud project..."
    
    # Set default project
    gcloud config set project $PROJECT_ID
    
    print_success "Project setup completed"
}

# Create Cloud SQL instance
create_cloud_sql() {
    print_status "Creating Cloud SQL instance..."
    
    if gcloud sql instances describe $DB_INSTANCE_NAME >/dev/null 2>&1; then
        print_warning "Cloud SQL instance $DB_INSTANCE_NAME already exists"
    else
        print_status "Creating Cloud SQL instance $DB_INSTANCE_NAME..."
        gcloud sql instances create $DB_INSTANCE_NAME \
            --database-version=POSTGRES_14 \
            --tier=db-f1-micro \
            --region=$REGION \
            --storage-type=SSD \
            --storage-size=10GB \
            --backup-start-time=03:00 \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=04
        
        # Create database
        gcloud sql databases create research_platform --instance=$DB_INSTANCE_NAME
        
        # Create database user
        DB_PASSWORD=$(openssl rand -base64 32)
        gcloud sql users create app_user --instance=$DB_INSTANCE_NAME --password=$DB_PASSWORD
        
        print_status "Database password: $DB_PASSWORD"
        print_warning "Please save this password securely!"
    fi
    
    print_success "Cloud SQL setup completed"
}

# Create storage buckets
create_storage() {
    print_status "Creating storage buckets..."
    
    local buckets=(
        "$PROJECT_ID-research-documents"
        "$PROJECT_ID-research-artifacts"
        "$PROJECT_ID-research-backups"
    )
    
    for bucket in "${buckets[@]}"; do
        if gsutil ls -b gs://$bucket >/dev/null 2>&1; then
            print_warning "Bucket gs://$bucket already exists"
        else
            print_status "Creating bucket gs://$bucket..."
            gsutil mb -p $PROJECT_ID -c STANDARD -l $REGION gs://$bucket
        fi
    done
    
    print_success "Storage buckets created"
}

# Create Pub/Sub topics and subscriptions
create_pubsub() {
    print_status "Creating Pub/Sub topics and subscriptions..."
    
    local topics=(
        "research-events"
        "quality-assessments"
        "ai-agent-requests"
        "session-updates"
    )
    
    for topic in "${topics[@]}"; do
        if gcloud pubsub topics describe $topic >/dev/null 2>&1; then
            print_warning "Topic $topic already exists"
        else
            print_status "Creating topic $topic..."
            gcloud pubsub topics create $topic
        fi
        
        local subscription="${topic}-sub"
        if gcloud pubsub subscriptions describe $subscription >/dev/null 2>&1; then
            print_warning "Subscription $subscription already exists"
        else
            print_status "Creating subscription $subscription..."
            gcloud pubsub subscriptions create $subscription --topic=$topic
        fi
    done
    
    print_success "Pub/Sub setup completed"
}

# Create service accounts
create_service_accounts() {
    print_status "Creating service accounts..."
    
    local service_accounts=(
        "research-platform-api:Research Platform API Service Account"
        "research-platform-worker:Research Platform Worker Service Account"
    )
    
    for sa_info in "${service_accounts[@]}"; do
        local sa_name=$(echo $sa_info | cut -d: -f1)
        local sa_display_name=$(echo $sa_info | cut -d: -f2)
        
        if gcloud iam service-accounts describe "${sa_name}@${PROJECT_ID}.iam.gserviceaccount.com" >/dev/null 2>&1; then
            print_warning "Service account $sa_name already exists"
        else
            print_status "Creating service account $sa_name..."
            gcloud iam service-accounts create $sa_name --display-name="$sa_display_name"
        fi
    done
    
    # Grant permissions
    print_status "Granting service account permissions..."
    
    local api_sa="research-platform-api@${PROJECT_ID}.iam.gserviceaccount.com"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/cloudsql.client" || true
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/storage.objectAdmin" || true
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/pubsub.publisher" || true
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/run.invoker" || true
    
    print_success "Service accounts setup completed"
}

# Setup Cloud Run services
setup_cloud_run() {
    print_status "Setting up Cloud Run configuration..."
    
    print_status "Cloud Run services will be deployed via CI/CD pipeline"
    print_status "The following services will be created:"
    print_status "- research-platform-frontend (React app)"
    print_status "- research-platform-api (FastAPI backend)"
    print_status "- research-platform-worker (Background tasks)"
    
    print_success "Cloud Run setup completed"
}

# Setup Cloud Build
setup_cloud_build() {
    print_status "Setting up Cloud Build permissions..."
    
    local project_number=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    local cloud_build_sa="${project_number}@cloudbuild.gserviceaccount.com"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/run.admin" || true
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/iam.serviceAccountUser" || true
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/storage.admin" || true
    
    print_success "Cloud Build permissions setup completed"
}

# Create environment configuration
create_env_config() {
    print_status "Creating environment configuration..."
    
    # Get database connection info
    local db_ip=$(gcloud sql instances describe $DB_INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)" 2>/dev/null || echo "localhost")
    
    cat > .env.example << EOF
# Multi-Agent Research Platform Environment Configuration
# Copy this file to .env and update with your actual values

# Database Configuration
DATABASE_HOST=$db_ip
DATABASE_PORT=5432
DATABASE_NAME=research_platform
DATABASE_USER=app_user
DATABASE_PASSWORD=your_database_password_here

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=$PROJECT_ID
GOOGLE_CLOUD_REGION=$REGION

# Storage Configuration
STORAGE_BUCKET_DOCUMENTS=$PROJECT_ID-research-documents
STORAGE_BUCKET_ARTIFACTS=$PROJECT_ID-research-artifacts
STORAGE_BUCKET_BACKUPS=$PROJECT_ID-research-backups

# Pub/Sub Configuration
PUBSUB_TOPIC_RESEARCH_EVENTS=research-events
PUBSUB_TOPIC_QUALITY_ASSESSMENTS=quality-assessments
PUBSUB_TOPIC_AI_AGENT_REQUESTS=ai-agent-requests
PUBSUB_TOPIC_SESSION_UPDATES=session-updates

# AI Service Configuration (update with your API keys)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Application Configuration
JWT_SECRET=your_jwt_secret_here
ENVIRONMENT=development
EOF
    
    print_success "Environment configuration created (.env.example)"
}

# Main execution
main() {
    print_status "Starting Google Cloud Platform setup for Multi-Agent Research Platform (Cloud Run)"
    print_status "Project ID: $PROJECT_ID"
    print_status "Region: $REGION"
    echo
    
    check_prerequisites
    authenticate
    setup_project
    create_cloud_sql
    create_storage
    create_pubsub
    create_service_accounts
    setup_cloud_run
    setup_cloud_build
    create_env_config
    
    print_success "Google Cloud Platform setup completed!"
    echo
    print_status "Next steps:"
    print_status "1. Copy .env.example to .env and update with actual values"
    print_status "2. Update database password from the output above"
    print_status "3. Add your AI service API keys (OpenAI, Anthropic)"
    print_status "4. Connect GitHub repository in Cloud Build console"
    print_status "5. Deploy your application using Cloud Run"
    echo
    print_status "Estimated monthly cost: \$50-100 for development, \$200-400 for production"
    print_status "Setup complete! You can now start developing your application."
}

# Run main function
main "$@" 