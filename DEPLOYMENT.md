# Deployment Guide - Multi-Agent Research Platform

This guide walks you through deploying the Multi-Agent Research Platform to Google Cloud Platform via GitHub.

## Prerequisites

Before starting, ensure you have:

1. **Google Cloud Account** with billing enabled
2. **GitHub Account** with repository access
3. **Local Development Environment** with:
   - `gcloud` CLI installed ([Installation Guide](https://cloud.google.com/sdk/docs/install))
   - `kubectl` installed ([Installation Guide](https://kubernetes.io/docs/tasks/tools/))
   - `docker` installed ([Installation Guide](https://docs.docker.com/get-docker/))
   - `git` installed

## Quick Start

### 1. Automated Setup (Recommended)

Run the automated setup script to create all Google Cloud infrastructure:

```bash
# Make the script executable (if not already)
chmod +x scripts/setup-gcp.sh

# Run the setup script
./scripts/setup-gcp.sh
```

This script will:
- Create the Google Cloud project
- Enable all required APIs
- Set up GKE cluster
- Create Cloud SQL database
- Set up Redis cache
- Create storage buckets
- Configure Pub/Sub topics
- Set up service accounts and permissions
- Create secrets in Secret Manager
- Configure monitoring and logging

### 2. Manual Setup (Alternative)

If you prefer manual setup or need to customize the configuration, follow the detailed instructions in `gcp-setup.md`.

## GitHub Integration

### 1. Repository Setup

1. **Create GitHub Repository** (if not already created):
   ```bash
   # Initialize git repository
   git init
   git add .
   git commit -m "Initial commit"
   
   # Add remote origin (replace with your repository URL)
   git remote add origin https://github.com/your-username/mach33-research-tool.git
   git push -u origin main
   ```

2. **Set up Branch Protection Rules**:
   - Go to your GitHub repository
   - Navigate to Settings → Branches
   - Add protection rules for `main` and `develop` branches
   - Require pull request reviews
   - Require status checks to pass

### 2. Cloud Build Integration

1. **Connect Repository to Cloud Build**:
   - Go to [Cloud Build Console](https://console.cloud.google.com/cloud-build/triggers)
   - Click "Connect Repository"
   - Select GitHub and authenticate
   - Choose your repository

2. **Create Build Triggers**:

   **Production Trigger (main branch)**:
   ```yaml
   Name: deploy-production
   Event: Push to branch
   Branch: ^main$
   Configuration: Cloud Build configuration file
   Cloud Build configuration file location: /cloudbuild.yaml
   ```

   **Staging Trigger (develop branch)**:
   ```yaml
   Name: deploy-staging
   Event: Push to branch
   Branch: ^develop$
   Configuration: Cloud Build configuration file
   Cloud Build configuration file location: /cloudbuild-staging.yaml
   ```

### 3. GitHub Actions Setup (Alternative)

If you prefer GitHub Actions over Cloud Build:

1. **Create Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=research-platform-ci@mach33-research-tool.iam.gserviceaccount.com
   ```

2. **Add GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `GCP_SA_KEY`: Content of the `key.json` file
     - `STAGING_API_URL`: Your staging API URL

## Environment Configuration

### 1. Update Secrets

After running the setup script, update the following secrets in Google Cloud Secret Manager:

```bash
# Update JWT secret
echo -n "your-actual-jwt-secret" | gcloud secrets versions add jwt-secret --data-file=-

# Update OpenAI API key
echo -n "your-openai-api-key" | gcloud secrets versions add openai-api-key --data-file=-

# Update Anthropic API key
echo -n "your-anthropic-api-key" | gcloud secrets versions add anthropic-api-key --data-file=-

# Update Redis auth string (if using AUTH)
echo -n "your-redis-auth-string" | gcloud secrets versions add redis-auth-string --data-file=-
```

### 2. Environment-Specific Configuration

Create environment-specific configuration files:

**Development Environment** (`config/development.yaml`):
```yaml
database:
  host: localhost
  port: 5432
  name: research_platform_dev
  
redis:
  host: localhost
  port: 6379
  
ai_services:
  rate_limits:
    openai: 100
    anthropic: 50
```

**Staging Environment** (`config/staging.yaml`):
```yaml
database:
  host: research-platform-db
  port: 5432
  name: research_platform_staging
  
redis:
  host: research-platform-cache
  port: 6379
  
ai_services:
  rate_limits:
    openai: 500
    anthropic: 250
```

**Production Environment** (`config/production.yaml`):
```yaml
database:
  host: research-platform-db
  port: 5432
  name: research_platform
  
redis:
  host: research-platform-cache
  port: 6379
  
ai_services:
  rate_limits:
    openai: 2000
    anthropic: 1000
```

## Deployment Process

### 1. Development Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request to develop branch
```

### 2. Staging Deployment

```bash
# Merge to develop branch triggers staging deployment
git checkout develop
git merge feature/new-feature
git push origin develop
```

This automatically:
- Runs tests
- Builds Docker images
- Deploys to staging environment
- Runs integration tests

### 3. Production Deployment

```bash
# Merge to main branch triggers production deployment
git checkout main
git merge develop
git push origin main
```

This automatically:
- Runs full test suite
- Builds production Docker images
- Deploys to production environment
- Runs database migrations
- Performs health checks

## Monitoring and Maintenance

### 1. Monitoring Setup

1. **Cloud Monitoring Dashboards**:
   - Go to [Cloud Monitoring](https://console.cloud.google.com/monitoring)
   - Create custom dashboards for:
     - Application performance metrics
     - Database performance
     - GKE cluster health
     - Error rates and latency

2. **Alerting Policies**:
   - Set up alerts for:
     - High error rates
     - Database connection issues
     - Memory/CPU usage
     - Disk space
     - SSL certificate expiration

### 2. Log Management

1. **Centralized Logging**:
   - All application logs are automatically sent to Cloud Logging
   - Logs are also stored in Cloud Storage for long-term retention

2. **Log Analysis**:
   ```bash
   # View recent application logs
   gcloud logging read "resource.type=k8s_container" --limit=50
   
   # Filter by severity
   gcloud logging read "severity>=ERROR" --limit=20
   ```

### 3. Backup and Recovery

1. **Database Backups**:
   - Automated daily backups are configured
   - Point-in-time recovery is available
   - Cross-region backup replication

2. **Application Data Backups**:
   - Research documents are stored in Cloud Storage
   - Versioning is enabled for all buckets
   - Cross-region replication for critical data

## Security Considerations

### 1. Network Security

- VPC native networking for GKE
- Private Google Access enabled
- Network policies for pod-to-pod communication
- Cloud NAT for outbound internet access

### 2. Identity and Access Management

- Service accounts with minimal required permissions
- Workload Identity for secure pod authentication
- Regular access reviews and rotation

### 3. Data Protection

- Encryption at rest for all data stores
- Encryption in transit with TLS 1.3
- Secret management with Cloud Secret Manager
- Regular security scanning with Container Analysis

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check Cloud Build logs
   gcloud builds list --limit=10
   gcloud builds log BUILD_ID
   ```

2. **Deployment Issues**:
   ```bash
   # Check GKE pod status
   kubectl get pods
   kubectl describe pod POD_NAME
   kubectl logs POD_NAME
   ```

3. **Database Connection Issues**:
   ```bash
   # Check Cloud SQL instance status
   gcloud sql instances describe research-platform-db
   
   # Test database connectivity
   kubectl run db-test --image=postgres:14 --rm -it -- psql -h DB_HOST -U app_user -d research_platform
   ```

### Performance Optimization

1. **Database Performance**:
   - Monitor slow queries in Cloud SQL Insights
   - Optimize indexes based on query patterns
   - Consider read replicas for read-heavy workloads

2. **Application Performance**:
   - Use Cloud Profiler for performance analysis
   - Implement caching strategies with Redis
   - Optimize Docker images for faster builds

## Cost Management

### 1. Cost Monitoring

- Set up budget alerts in Cloud Billing
- Use Cloud Cost Management for detailed analysis
- Regular review of resource utilization

### 2. Cost Optimization

- Use preemptible instances for non-critical workloads
- Implement auto-scaling for GKE nodes
- Regular cleanup of unused resources
- Use committed use discounts for predictable workloads

## Support and Documentation

- **Google Cloud Documentation**: [cloud.google.com/docs](https://cloud.google.com/docs)
- **Kubernetes Documentation**: [kubernetes.io/docs](https://kubernetes.io/docs)
- **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/actions)

## Next Steps

1. **Complete the infrastructure setup** using the provided scripts
2. **Configure your GitHub repository** with the deployment workflows
3. **Update secrets** with your actual API keys and credentials
4. **Set up monitoring and alerting** for your production environment
5. **Start developing** your Multi-Agent Research Platform!

---

**Estimated Setup Time**: 30-60 minutes for automated setup
**Estimated Monthly Cost**: $150-200 (development), $800-1200 (production)

For questions or issues, please refer to the troubleshooting section or create an issue in the repository. 