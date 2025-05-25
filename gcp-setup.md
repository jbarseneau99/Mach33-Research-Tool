# Google Cloud Platform Setup Guide
## Multi-Agent Research Platform Deployment

### Prerequisites
- Google Cloud account with billing enabled
- GitHub account with repository access
- `gcloud` CLI installed locally

### 1. Initial Project Setup

```bash
# Create a new GCP project
gcloud projects create mach33-research-tool --name="Mach33 Research Tool"

# Set the project as default
gcloud config set project mach33-research-tool

# Enable billing (replace BILLING_ACCOUNT_ID with your billing account)
gcloud billing projects link mach33-research-tool --billing-account=BILLING_ACCOUNT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sql.googleapis.com \
  redis.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudresourcemanager.googleapis.com \
  iam.googleapis.com \
  container.googleapis.com \
  monitoring.googleapis.com \
  logging.googleapis.com \
  cloudfunctions.googleapis.com \
  pubsub.googleapis.com \
  aiplatform.googleapis.com
```

### 2. Infrastructure Components

#### 2.1 Google Kubernetes Engine (GKE) Cluster
```bash
# Create GKE cluster for microservices
gcloud container clusters create research-platform-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --machine-type=e2-standard-4 \
  --enable-autorepair \
  --enable-autoupgrade \
  --enable-network-policy
```

#### 2.2 Cloud SQL (PostgreSQL)
```bash
# Create PostgreSQL instance
gcloud sql instances create research-platform-db \
  --database-version=POSTGRES_14 \
  --tier=db-custom-2-8192 \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=100GB \
  --storage-auto-increase \
  --backup-start-time=03:00 \
  --enable-bin-log \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=04

# Create database
gcloud sql databases create research_platform --instance=research-platform-db

# Create database user
gcloud sql users create app_user --instance=research-platform-db --password=SECURE_PASSWORD
```

#### 2.3 Redis (Memorystore)
```bash
# Create Redis instance for caching
gcloud redis instances create research-platform-cache \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_6_x \
  --tier=standard
```

#### 2.4 Cloud Storage
```bash
# Create storage buckets
gsutil mb -p mach33-research-tool -c STANDARD -l us-central1 gs://mach33-research-documents
gsutil mb -p mach33-research-tool -c STANDARD -l us-central1 gs://mach33-research-artifacts
gsutil mb -p mach33-research-tool -c STANDARD -l us-central1 gs://mach33-research-backups

# Set bucket permissions (adjust as needed)
gsutil iam ch allUsers:objectViewer gs://mach33-research-documents
```

#### 2.5 Pub/Sub for Event-Driven Architecture
```bash
# Create topics for inter-service communication
gcloud pubsub topics create research-events
gcloud pubsub topics create quality-assessments
gcloud pubsub topics create ai-agent-requests
gcloud pubsub topics create session-updates

# Create subscriptions
gcloud pubsub subscriptions create research-events-sub --topic=research-events
gcloud pubsub subscriptions create quality-assessments-sub --topic=quality-assessments
gcloud pubsub subscriptions create ai-agent-requests-sub --topic=ai-agent-requests
gcloud pubsub subscriptions create session-updates-sub --topic=session-updates
```

### 3. Security Setup

#### 3.1 Service Accounts
```bash
# Create service accounts for different services
gcloud iam service-accounts create research-platform-api \
  --display-name="Research Platform API Service Account"

gcloud iam service-accounts create research-platform-worker \
  --display-name="Research Platform Worker Service Account"

gcloud iam service-accounts create research-platform-ci \
  --display-name="Research Platform CI/CD Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:research-platform-api@mach33-research-tool.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:research-platform-api@mach33-research-tool.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:research-platform-api@mach33-research-tool.iam.gserviceaccount.com" \
  --role="roles/pubsub.publisher"
```

#### 3.2 Secret Manager
```bash
# Store sensitive configuration
echo -n "your-jwt-secret" | gcloud secrets create jwt-secret --data-file=-
echo -n "your-openai-api-key" | gcloud secrets create openai-api-key --data-file=-
echo -n "your-anthropic-api-key" | gcloud secrets create anthropic-api-key --data-file=-
echo -n "your-database-password" | gcloud secrets create database-password --data-file=-
echo -n "your-redis-auth-string" | gcloud secrets create redis-auth-string --data-file=-
```

### 4. Monitoring and Logging
```bash
# Create log sinks for centralized logging
gcloud logging sinks create research-platform-logs \
  storage.googleapis.com/mach33-research-backups/logs \
  --log-filter='resource.type="gce_instance" OR resource.type="k8s_container"'

# Set up monitoring workspace (done through console)
# Navigate to: https://console.cloud.google.com/monitoring
```

### 5. CI/CD Setup with Cloud Build

#### 5.1 Connect GitHub Repository
```bash
# Connect GitHub repository (requires manual step in console)
# Navigate to: https://console.cloud.google.com/cloud-build/triggers
# Click "Connect Repository" and follow the OAuth flow
```

#### 5.2 Grant Cloud Build Permissions
```bash
# Get Cloud Build service account
PROJECT_NUMBER=$(gcloud projects describe mach33-research-tool --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Grant necessary permissions
gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding mach33-research-tool \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

### 6. Environment Configuration

Create environment-specific configurations:

#### Development Environment
- Single GKE node
- Smaller database instance
- Shared Redis instance
- Development secrets

#### Staging Environment
- 2-3 GKE nodes
- Medium database instance
- Dedicated Redis instance
- Staging secrets

#### Production Environment
- Auto-scaling GKE cluster (3-10 nodes)
- High-availability database
- Redis cluster
- Production secrets
- Multi-region setup

### 7. Cost Optimization
```bash
# Set up budget alerts
gcloud billing budgets create \
  --billing-account=BILLING_ACCOUNT_ID \
  --display-name="Research Platform Budget" \
  --budget-amount=500USD \
  --threshold-rule=percent=50 \
  --threshold-rule=percent=90 \
  --threshold-rule=percent=100
```

### 8. Next Steps

1. **Manual Console Steps Required:**
   - Connect GitHub repository in Cloud Build
   - Configure OAuth for GitHub integration
   - Set up monitoring dashboards
   - Configure alerting policies

2. **Repository Setup:**
   - Create GitHub repository
   - Set up branch protection rules
   - Configure GitHub Actions (optional)
   - Add repository secrets

3. **Application Deployment:**
   - Create Kubernetes manifests
   - Set up Cloud Build triggers
   - Configure environment variables
   - Deploy initial application

### 9. Estimated Monthly Costs

**Development Environment:** ~$150-200/month
- GKE cluster (1-2 nodes): $50-100
- Cloud SQL (small): $30-50
- Redis (1GB): $25
- Storage and networking: $20-25

**Production Environment:** ~$800-1200/month
- GKE cluster (3-10 nodes): $400-800
- Cloud SQL (HA): $200-300
- Redis cluster: $100-150
- Storage, networking, monitoring: $100-150

### 10. Security Checklist

- [ ] Enable VPC native networking
- [ ] Configure firewall rules
- [ ] Set up IAM policies with least privilege
- [ ] Enable audit logging
- [ ] Configure SSL/TLS certificates
- [ ] Set up DDoS protection
- [ ] Enable binary authorization for containers
- [ ] Configure network policies in GKE 