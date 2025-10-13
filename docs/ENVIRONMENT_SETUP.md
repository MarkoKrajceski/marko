# Environment Variable Setup Guide

This guide explains how to configure environment variables for Marko's personal site across different environments (development, staging, production).

## Overview

The application uses a comprehensive environment variable management system with:

- **Type-safe validation** for all environment variables
- **Stage-specific configuration** (dev/staging/prod)
- **Automatic injection** from Amplify to Lambda functions
- **Build-time validation** to catch configuration errors early
- **Client/server separation** for security

## Environment Variable Categories

### 1. Frontend Variables (Client-Side)
These variables are exposed to the browser bundle and must use the `NEXT_PUBLIC_` prefix:

```bash
NEXT_PUBLIC_API_URL=https://api.marko.dev
NEXT_PUBLIC_SITE_URL=https://marko.dev
NEXT_PUBLIC_STAGE=prod
```

### 2. Backend Variables (Lambda Functions)
These variables are only available to Lambda functions:

```bash
STAGE=prod
TABLE_NAME=personalSiteData-prod
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=https://marko.dev
```

### 3. Server Variables (Next.js Server-Side)
These variables are only available on the Next.js server:

```bash
API_ENDPOINT=https://api.marko.dev
PITCH_LAMBDA_URL=https://api.marko.dev/pitch
LEAD_LAMBDA_URL=https://api.marko.dev/lead
HEALTH_LAMBDA_URL=https://api.marko.dev/health
```

### 4. Build Variables (Amplify)
These variables are automatically set by Amplify during deployment:

```bash
AMPLIFY_APP_ID=your-app-id
AMPLIFY_BRANCH=main
AMPLIFY_COMMIT_ID=commit-hash
```

## Environment Setup by Stage

### Development (.env.local)

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update the values for local development:
   ```bash
   STAGE=dev
   TABLE_NAME=personalSiteData-dev
   RATE_LIMIT_MAX=10
   RATE_LIMIT_WINDOW=60
   AWS_REGION=us-east-1
   CORS_ORIGIN=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_STAGE=dev
   API_ENDPOINT=http://localhost:3000/api
   ```

### Staging (Amplify Console)

Configure these variables in the Amplify Console for your staging branch:

```bash
STAGE=staging
TABLE_NAME=personalSiteData-staging
RATE_LIMIT_MAX=20
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=https://staging.marko.dev
NEXT_PUBLIC_API_URL=https://api-staging.marko.dev
NEXT_PUBLIC_SITE_URL=https://staging.marko.dev
NEXT_PUBLIC_STAGE=staging
API_ENDPOINT=https://api-staging.marko.dev
```

### Production (Amplify Console)

Configure these variables in the Amplify Console for your main branch:

```bash
STAGE=prod
TABLE_NAME=personalSiteData-prod
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
CORS_ORIGIN=https://marko.dev
NEXT_PUBLIC_API_URL=https://api.marko.dev
NEXT_PUBLIC_SITE_URL=https://marko.dev
NEXT_PUBLIC_STAGE=prod
API_ENDPOINT=https://api.marko.dev
```

## Amplify Console Configuration

### Setting Environment Variables

1. Open the Amplify Console
2. Navigate to your app
3. Go to "App settings" > "Environment variables"
4. Add each variable with its appropriate value
5. Make sure to set variables for the correct branch (main, staging, etc.)

### Environment Variable Inheritance

Amplify automatically injects environment variables into:
- **Next.js build process** (for `NEXT_PUBLIC_*` variables)
- **Lambda functions** (for backend variables)
- **Build scripts** (for validation and build-time logic)

## Validation and Type Safety

### Automatic Validation

The application automatically validates environment variables:

1. **Build-time validation**: During `npm run build`
2. **Runtime validation**: When Lambda functions start
3. **Client-side validation**: When React components mount

### Manual Validation

You can manually validate environment variables:

```bash
# Validate all environment variables
npm run validate:env

# Validate only frontend variables
npm run validate:env:frontend

# Validate only backend variables
npm run validate:env:backend

# Validate only server variables
npm run validate:env:server
```

### Type-Safe Access

Use the provided utilities for type-safe environment variable access:

```typescript
// In React components
import { useEnvironment, useStage, useApiUrl } from '@/hooks/useEnvironment';

function MyComponent() {
  const { env, isLoading, error } = useEnvironment();
  const stage = useStage();
  const apiUrl = useApiUrl();
  
  // env is fully typed and validated
}

// In server-side code
import { getServerEnv, getFrontendEnv } from '@/lib/env';

const serverEnv = getServerEnv(); // Fully typed
const frontendEnv = getFrontendEnv(); // Fully typed

// In Lambda functions
const { getLambdaEnv } = require('./shared/env');

const env = getLambdaEnv(); // Fully typed and validated
```

## Security Best Practices

### Client vs Server Variables

- **Never put sensitive data** in `NEXT_PUBLIC_*` variables
- **Use server-only variables** for API keys, database credentials, etc.
- **Use client variables** only for public configuration like API URLs

### CORS Configuration

- Set `CORS_ORIGIN` to your exact domain in production
- Never use `*` for CORS origin in production
- Use `http://localhost:3000` only for local development

### Rate Limiting

- Configure appropriate rate limits for each environment
- Use lower limits in development for testing
- Use higher limits in production for real traffic

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing required environment variable: NEXT_PUBLIC_API_URL
   ```
   - Check that the variable is set in Amplify Console
   - Verify the variable name is spelled correctly
   - Ensure you're using the correct prefix (`NEXT_PUBLIC_` for client variables)

2. **Invalid URL Format**
   ```
   Error: Environment variable NEXT_PUBLIC_API_URL must be a valid URL
   ```
   - Ensure URLs include the protocol (http:// or https://)
   - Check for typos in the URL
   - Verify the URL is accessible

3. **Stage Mismatch**
   ```
   Error: Environment variable STAGE must be one of: dev, staging, prod
   ```
   - Check that STAGE is set to a valid value
   - Ensure consistency between STAGE and NEXT_PUBLIC_STAGE

### Debugging Environment Variables

1. **Check build logs** in Amplify Console for validation errors
2. **Use the validation script** locally: `npm run validate:env`
3. **Enable debug logging** in development by setting `NODE_ENV=development`
4. **Check Lambda logs** in CloudWatch for runtime validation errors

### Environment Variable Precedence

1. **Amplify Console variables** (highest priority)
2. **Local .env.local file** (development only)
3. **Default values** in code (lowest priority)

## Migration Guide

### From Manual Configuration

If you're migrating from manual environment variable management:

1. **Audit existing variables** and map them to the new schema
2. **Run validation** to ensure all required variables are present
3. **Update code** to use the new type-safe utilities
4. **Test thoroughly** in each environment

### Adding New Variables

When adding new environment variables:

1. **Update the validation schema** in `src/lib/env.ts`
2. **Add to the example file** `.env.local.example`
3. **Update this documentation**
4. **Add to Amplify Console** for each environment
5. **Update Lambda shared utilities** if needed for backend variables

## Support

If you encounter issues with environment variable configuration:

1. Check the validation error messages for specific guidance
2. Review the example configuration in `.env.local.example`
3. Verify Amplify Console settings match the documentation
4. Check build logs for detailed error information