# Environment Variable Setup Guide

This document provides detailed instructions for setting up environment variables across different stages (development, staging, production) for the Marko personal site project.

## Environment Variable Categories

### 1. Frontend Environment Variables (Next.js)
These variables are used by the Next.js application and are prefixed with `NEXT_PUBLIC_` for client-side access.

### 2. Backend Environment Variables (Lambda Functions)
These variables are used by AWS Lambda functions and are server-side only.

### 3. Build-time Environment Variables
These variables are used during the build process and are automatically set by Amplify.

## Development Environment (.env.local)

Create a `.env.local` file in your project root with the following variables:

```bash
# Stage identifier
STAGE=dev

# Frontend environment variables (client-side accessible)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STAGE=dev

# Backend environment variables (server-side only)
TABLE_NAME=personalSiteData-dev
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=http://localhost:3000

# Optional: Local development overrides
API_ENDPOINT=http://localhost:20002
LOCAL_DYNAMODB_ENDPOINT=http://localhost:8000
```

## Staging Environment (Amplify Console)

Configure the following environment variables in the Amplify Console for your staging environment:

### Frontend Variables
```bash
NEXT_PUBLIC_API_URL=https://api-staging.marko.dev
NEXT_PUBLIC_SITE_URL=https://staging.marko.dev
NEXT_PUBLIC_STAGE=staging
```

### Backend Variables
```bash
STAGE=staging
TABLE_NAME=personalSiteData-staging
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=https://staging.marko.dev
```

### Build Variables (automatically set by Amplify)
```bash
AMPLIFY_APP_ID=<your-app-id>
AMPLIFY_BRANCH=staging
AMPLIFY_COMMIT_ID=<commit-hash>
```

## Production Environment (Amplify Console)

Configure the following environment variables in the Amplify Console for your production environment:

### Frontend Variables
```bash
NEXT_PUBLIC_API_URL=https://api.marko.dev
NEXT_PUBLIC_SITE_URL=https://marko.dev
NEXT_PUBLIC_STAGE=prod
```

### Backend Variables
```bash
STAGE=prod
TABLE_NAME=personalSiteData-prod
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=https://marko.dev
```

### Build Variables (automatically set by Amplify)
```bash
AMPLIFY_APP_ID=<your-app-id>
AMPLIFY_BRANCH=main
AMPLIFY_COMMIT_ID=<commit-hash>
```

## Setting Environment Variables in Amplify Console

### Step-by-Step Instructions

1. **Navigate to Amplify Console**
   - Go to AWS Amplify Console
   - Select your application
   - Choose the environment (staging/prod)

2. **Access Environment Variables**
   - Click on "Environment variables" in the left sidebar
   - Or go to App settings > Environment variables

3. **Add Variables**
   - Click "Manage variables"
   - Add each variable with its corresponding value
   - Ensure proper naming (NEXT_PUBLIC_ prefix for client-side variables)

4. **Apply Changes**
   - Save the variables
   - Trigger a new build to apply the changes

### Environment Variable Validation

Use the built-in validation scripts to ensure all required variables are set:

```bash
# Validate all environment variables
npm run validate:env

# Validate frontend-specific variables
npm run validate:env:frontend

# Validate backend-specific variables
npm run validate:env:backend

# Validate server-side variables
npm run validate:env:server
```

## Environment-Specific Configuration Examples

### Development Configuration
```javascript
// config/development.js
module.exports = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 5000,
    retries: 2
  },
  database: {
    tableName: process.env.TABLE_NAME || 'personalSiteData-dev',
    region: process.env.AWS_REGION || 'us-east-1'
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
  }
};
```

### Production Configuration
```javascript
// config/production.js
module.exports = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    retries: 3
  },
  database: {
    tableName: process.env.TABLE_NAME,
    region: process.env.AWS_REGION
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX) || 30,
    window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60
  },
  cors: {
    origin: process.env.CORS_ORIGIN
  }
};
```

## Security Best Practices

### 1. Sensitive Variables
- Never commit sensitive variables to version control
- Use AWS Systems Manager Parameter Store for highly sensitive data
- Rotate API keys and secrets regularly

### 2. Client-Side Variables
- Only use `NEXT_PUBLIC_` prefix for non-sensitive data
- Remember that client-side variables are visible to users
- Validate all client-side inputs on the server

### 3. Environment Separation
- Use different AWS accounts for staging and production
- Implement proper IAM roles and policies
- Monitor environment variable changes

## Troubleshooting

### Common Issues

1. **Variables Not Loading**
   ```bash
   # Check if variables are properly set
   npm run validate:env
   
   # Verify Next.js can access variables
   console.log(process.env.NEXT_PUBLIC_API_URL);
   ```

2. **Build Failures**
   ```bash
   # Ensure all required variables are set in Amplify Console
   # Check build logs for missing variable errors
   # Verify variable names match exactly (case-sensitive)
   ```

3. **Lambda Function Errors**
   ```bash
   # Check CloudWatch logs for environment variable issues
   # Verify IAM roles have access to required resources
   # Ensure table names match across environments
   ```

### Debug Commands

```bash
# List all environment variables (development)
printenv | grep -E "(NEXT_PUBLIC_|STAGE|TABLE_NAME)"

# Test API endpoints with environment variables
curl -X GET "${NEXT_PUBLIC_API_URL}/health"

# Validate specific environment
STAGE=staging npm run validate:env
```

## Environment Variable Reference

| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| `STAGE` | Backend | Yes | Environment identifier | `dev`, `staging`, `prod` |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | API base URL | `https://api.marko.dev` |
| `NEXT_PUBLIC_SITE_URL` | Frontend | Yes | Site canonical URL | `https://marko.dev` |
| `NEXT_PUBLIC_STAGE` | Frontend | Yes | Client-side stage identifier | `prod` |
| `TABLE_NAME` | Backend | Yes | DynamoDB table name | `personalSiteData-prod` |
| `RATE_LIMIT_MAX` | Backend | No | Max requests per window | `30` |
| `RATE_LIMIT_WINDOW` | Backend | No | Rate limit window (seconds) | `60` |
| `AWS_REGION` | Backend | No | AWS region | `us-east-1` |
| `CORS_ORIGIN` | Backend | Yes | Allowed CORS origin | `https://marko.dev` |
| `AMPLIFY_APP_ID` | Build | Auto | Amplify application ID | Auto-set |
| `AMPLIFY_BRANCH` | Build | Auto | Current branch | Auto-set |
| `AMPLIFY_COMMIT_ID` | Build | Auto | Git commit hash | Auto-set |