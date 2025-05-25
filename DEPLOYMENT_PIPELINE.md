# Deployment Pipeline Guide

## Overview

This project now has **two deployment options** configured:

1. **GitHub Actions** (disabled until application code exists)
2. **Google Cloud Build** (recommended for production)

## Current Status

### ✅ What's Working
- **Cloud Run Infrastructure**: Fully provisioned and ready
- **GitHub Actions**: Updated to use Cloud Run (but disabled until app code exists)
- **Google Cloud Build**: Configured and ready to set up triggers

### 🔄 What's Disabled
- **GitHub Actions workflows**: Will only run when `frontend/package.json` and `backend/requirements.txt` exist
- **Cloud Build triggers**: Need manual GitHub repository connection

## Architecture

### Cloud Run Services
- **Frontend**: React app (`research-platform-frontend`)
- **API**: Python/Django backend (`research-platform-api`)
- **Worker**: Background job processor (`research-platform-worker`)

### Supporting Infrastructure
- **Cloud SQL**: PostgreSQL database
- **Cloud Storage**: Document and artifact storage
- **Pub/Sub**: Event-driven messaging
- **Container Registry**: Docker image storage

## Deployment Options

### Option 1: GitHub Actions (Current Setup)

**Status**: ✅ Updated but disabled until app code exists

**Triggers**:
- Push to `main` → Production deployment
- Push to `develop` → Staging deployment
- Pull requests to `main` → Security scan and performance tests

**Features**:
- Automatic code detection (won't run without `package.json` and `requirements.txt`)
- Cloud Run deployment
- Database migrations
- Security scanning with Trivy
- Performance testing with k6

**To Enable**:
1. Create application code with `frontend/package.json` and `backend/requirements.txt`
2. Add GitHub secrets:
   - `GCP_SA_KEY`: Service account JSON key
   - `STAGING_API_URL`: Staging API URL for performance tests

### Option 2: Google Cloud Build (Recommended)

**Status**: 🔄 Ready to configure

**Setup Steps**:
1. Run the setup script:
   ```bash
   export PATH="/Users/jbarseneau/Mach33-Research-Tool/Google_cloud/google-cloud-sdk/bin:$PATH"
   ./scripts/setup-cloud-build-triggers.sh
   ```

2. Follow the manual GitHub connection steps in the script

**Triggers**:
- Push to `main` → Production deployment (`cloudbuild-cloudrun.yaml`)
- Push to `develop` → Staging deployment (`cloudbuild-staging.yaml`)
- Pull requests to `main` → Testing only (`cloudbuild-test.yaml`)

**Advantages**:
- Native Google Cloud integration
- Better performance and reliability
- Automatic scaling
- Built-in security and compliance

## Build Configurations

### Production Build (`cloudbuild-cloudrun.yaml`)
- Full deployment pipeline
- Runs tests, builds images, deploys to Cloud Run
- Executes database migrations
- Production-grade resource allocation

### Staging Build (`cloudbuild-staging.yaml`)
- Similar to production but with staging environment
- Smaller resource allocation
- Additional testing steps

### Test Build (`cloudbuild-test.yaml`)
- Testing and security scanning only
- No deployment
- Runs on pull requests

## Environment Configuration

### Required Environment Variables
```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=mach33-research-tool-460917
ENVIRONMENT=production|staging|development

# Database (automatically configured)
DATABASE_URL=postgresql://...

# AI Services (to be added)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROK_API_KEY=your_grok_key
```

### Service Accounts
- `research-platform-api@mach33-research-tool-460917.iam.gserviceaccount.com`
- `research-platform-worker@mach33-research-tool-460917.iam.gserviceaccount.com`

## Next Steps

### Immediate (Infrastructure Complete)
1. ✅ GitHub Actions updated for Cloud Run
2. ✅ Cloud Build configurations created
3. 🔄 Set up Cloud Build triggers (run setup script)

### When Ready to Deploy Application
1. Create application code structure:
   ```
   frontend/
   ├── package.json
   ├── Dockerfile
   └── src/
   
   backend/
   ├── requirements.txt
   ├── api/
   │   └── Dockerfile
   └── worker/
       └── Dockerfile
   ```

2. Add AI service API keys to environment
3. Test deployment pipeline
4. Set up monitoring and alerting

## Monitoring and Logs

### Cloud Build
- **Console**: https://console.cloud.google.com/cloud-build/builds?project=mach33-research-tool-460917
- **Logs**: Integrated with Cloud Logging

### Cloud Run Services
- **Console**: https://console.cloud.google.com/run?project=mach33-research-tool-460917
- **Metrics**: CPU, memory, request latency
- **Logs**: Application and system logs

### GitHub Actions
- **Console**: GitHub repository → Actions tab
- **Logs**: Build and deployment logs

## Cost Optimization

### Development Environment
- **Cloud SQL**: db-f1-micro instance (~$7/month)
- **Cloud Run**: Pay-per-use (minimal cost during development)
- **Storage**: Standard tier (~$0.02/GB/month)

### Production Environment
- **Estimated Cost**: $50-100/month (low traffic)
- **Scaling**: Automatic based on demand
- **Optimization**: Configured for cost-effective resource usage

## Security

### Access Control
- Service accounts with minimal required permissions
- No public database access
- API authentication required

### Secrets Management
- GitHub secrets for sensitive data
- Google Secret Manager integration ready
- Environment-specific configuration

### Security Scanning
- Trivy vulnerability scanning
- Container image security
- Dependency vulnerability checks

## Troubleshooting

### Common Issues

1. **GitHub Actions not running**
   - Check if `frontend/package.json` and `backend/requirements.txt` exist
   - Verify GitHub secrets are configured

2. **Cloud Build triggers not working**
   - Ensure GitHub repository is connected
   - Check trigger configuration in Cloud Console

3. **Deployment failures**
   - Check Cloud Build logs
   - Verify service account permissions
   - Ensure Docker images build successfully

### Support Resources
- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Cloud Run Documentation**: https://cloud.google.com/run/docs
- **Cloud Build Documentation**: https://cloud.google.com/build/docs 