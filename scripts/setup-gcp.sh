#!/bin/bash

# Multi-Agent Research Platform - Google Cloud Setup Script
# This script sets up the complete Google Cloud infrastructure

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
ZONE="us-central1-a"
CLUSTER_NAME="research-platform-cluster"
DB_INSTANCE_NAME="research-platform-db"
REDIS_INSTANCE_NAME="research-platform-cache"

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
    
    if ! command_exists kubectl; then
        print_error "kubectl is not installed. Please install it first."
        exit 1
    fi
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install it first."
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

# Create and configure project
setup_project() {
    print_status "Setting up Google Cloud project..."
    
    # Check if project exists
    if gcloud projects describe $PROJECT_ID >/dev/null 2>&1; then
        print_warning "Project $PROJECT_ID already exists"
    else
        print_status "Creating project $PROJECT_ID..."
        gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
    fi
    
    # Set default project
    gcloud config set project $PROJECT_ID
    
    # Check if billing is enabled
    if ! gcloud billing projects describe $PROJECT_ID >/dev/null 2>&1; then
        print_warning "Billing is not enabled for this project."
        print_status "Please enable billing in the Google Cloud Console:"
        print_status "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
        read -p "Press Enter after enabling billing..."
    fi
    
    print_success "Project setup completed"
}

# Enable required APIs
enable_apis() {
    print_status "Enabling required APIs..."
    
    local apis=(
        "cloudbuild.googleapis.com"
        "run.googleapis.com"
        "sql.googleapis.com"
        "redis.googleapis.com"
        "storage.googleapis.com"
        "secretmanager.googleapis.com"
        "cloudresourcemanager.googleapis.com"
        "iam.googleapis.com"
        "container.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "cloudfunctions.googleapis.com"
        "pubsub.googleapis.com"
        "aiplatform.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        print_status "Enabling $api..."
        gcloud services enable $api
    done
    
    print_success "All APIs enabled"
}

# Create GKE cluster
create_gke_cluster() {
    print_status "Creating GKE cluster..."
    
    if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE >/dev/null 2>&1; then
        print_warning "GKE cluster $CLUSTER_NAME already exists"
    else
        print_status "Creating GKE cluster $CLUSTER_NAME..."
        gcloud container clusters create $CLUSTER_NAME \
            --zone=$ZONE \
            --num-nodes=3 \
            --enable-autoscaling \
            --min-nodes=1 \
            --max-nodes=10 \
            --machine-type=e2-standard-4 \
            --enable-autorepair \
            --enable-autoupgrade \
            --enable-network-policy \
            --enable-ip-alias \
            --disk-size=50GB \
            --disk-type=pd-ssd
    fi
    
    # Get cluster credentials
    gcloud container clusters get-credentials $CLUSTER_NAME --zone=$ZONE
    
    print_success "GKE cluster setup completed"
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
            --tier=db-custom-2-8192 \
            --region=$REGION \
            --storage-type=SSD \
            --storage-size=100GB \
            --storage-auto-increase \
            --backup-start-time=03:00 \
            --maintenance-window-day=SUN \
            --maintenance-window-hour=04 \
            --deletion-protection
        
        # Create database
        gcloud sql databases create research_platform --instance=$DB_INSTANCE_NAME
        
        # Create database user
        DB_PASSWORD=$(openssl rand -base64 32)
        gcloud sql users create app_user --instance=$DB_INSTANCE_NAME --password=$DB_PASSWORD
        
        # Store password in Secret Manager
        echo -n "$DB_PASSWORD" | gcloud secrets create database-password --data-file=-
    fi
    
    print_success "Cloud SQL setup completed"
}

# Create Redis instance
create_redis() {
    print_status "Creating Redis instance..."
    
    if gcloud redis instances describe $REDIS_INSTANCE_NAME --region=$REGION >/dev/null 2>&1; then
        print_warning "Redis instance $REDIS_INSTANCE_NAME already exists"
    else
        print_status "Creating Redis instance $REDIS_INSTANCE_NAME..."
        gcloud redis instances create $REDIS_INSTANCE_NAME \
            --size=1 \
            --region=$REGION \
            --redis-version=redis_6_x \
            --tier=standard
    fi
    
    print_success "Redis setup completed"
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
        "research-platform-ci:Research Platform CI/CD Service Account"
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
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/cloudsql.client"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/storage.objectAdmin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/pubsub.publisher"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$api_sa" --role="roles/secretmanager.secretAccessor"
    
    print_success "Service accounts setup completed"
}

# Setup secrets
setup_secrets() {
    print_status "Setting up secrets in Secret Manager..."
    
    local secrets=(
        "jwt-secret"
        "openai-api-key"
        "anthropic-api-key"
        "redis-auth-string"
    )
    
    for secret in "${secrets[@]}"; do
        if gcloud secrets describe $secret >/dev/null 2>&1; then
            print_warning "Secret $secret already exists"
        else
            print_status "Creating secret $secret..."
            echo -n "CHANGE_ME_$(openssl rand -hex 16)" | gcloud secrets create $secret --data-file=-
            print_warning "Please update the secret $secret with the actual value"
        fi
    done
    
    print_success "Secrets setup completed"
}

# Setup monitoring
setup_monitoring() {
    print_status "Setting up monitoring and logging..."
    
    # Create log sink
    if gcloud logging sinks describe research-platform-logs >/dev/null 2>&1; then
        print_warning "Log sink research-platform-logs already exists"
    else
        print_status "Creating log sink..."
        gcloud logging sinks create research-platform-logs \
            "storage.googleapis.com/${PROJECT_ID}-research-backups/logs" \
            --log-filter='resource.type="gce_instance" OR resource.type="k8s_container"'
    fi
    
    print_success "Monitoring setup completed"
}

# Setup Cloud Build permissions
setup_cloud_build() {
    print_status "Setting up Cloud Build permissions..."
    
    local project_number=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
    local cloud_build_sa="${project_number}@cloudbuild.gserviceaccount.com"
    
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/container.developer"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/run.admin"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/iam.serviceAccountUser"
    gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:$cloud_build_sa" --role="roles/secretmanager.secretAccessor"
    
    print_success "Cloud Build permissions setup completed"
}

# Setup budget alerts
setup_budget() {
    print_status "Setting up budget alerts..."
    
    print_warning "Budget setup requires manual configuration in the Google Cloud Console"
    print_status "Please visit: https://console.cloud.google.com/billing/budgets?project=$PROJECT_ID"
    
    print_success "Budget setup information provided"
}

# Main execution
main() {
    print_status "Starting Google Cloud Platform setup for Multi-Agent Research Platform"
    print_status "Project ID: $PROJECT_ID"
    print_status "Region: $REGION"
    print_status "Zone: $ZONE"
    echo
    
    check_prerequisites
    authenticate
    setup_project
    enable_apis
    create_gke_cluster
    create_cloud_sql
    create_redis
    create_storage
    create_pubsub
    create_service_accounts
    setup_secrets
    setup_monitoring
    setup_cloud_build
    setup_budget
    
    print_success "Google Cloud Platform setup completed!"
    echo
    print_status "Next steps:"
    print_status "1. Update secrets in Secret Manager with actual values"
    print_status "2. Connect GitHub repository in Cloud Build console"
    print_status "3. Set up monitoring dashboards"
    print_status "4. Configure domain and SSL certificates"
    print_status "5. Review and adjust resource quotas if needed"
    echo
    print_status "Estimated monthly cost: \$150-200 for development, \$800-1200 for production"
    print_status "Setup complete! You can now start developing your application."
}

# Run main function
main "$@" 