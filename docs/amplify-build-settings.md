# Amplify Build Settings Examples

This document provides example build settings and configurations for different deployment scenarios in AWS Amplify.

## Basic Build Settings (amplify.yml)

The main `amplify.yml` file is already configured in the project root. Here are additional examples for specific scenarios:

### Minimal Build Configuration
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

### Advanced Build Configuration with Environment Injection
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            # Install dependencies
            - npm ci
            # Inject environment-specific configurations
            - node amplify/scripts/build-env-injection.js
            # Validate environment variables before build
            - npm run validate:env:frontend
            # Optional: Run security audit
            - npm audit --audit-level high
        build:
          commands:
            # Build with environment validation
            - npm run build
            # Optional: Generate build report
            - npm run build:analyze
        postBuild:
          commands:
            # Validate build output
            - echo "Build completed successfully"
            # Optional: Run post-build tests
            - npm run test:build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
        # Exclude unnecessary files from deployment
        exclude:
          - node_modules/**/*
          - .git/**/*
          - '*.log'
          - '.env*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
          - ~/.npm/**/*
```

## Environment-Specific Build Settings

### Development Environment
```yaml
# amplify-dev.yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Building for development environment"
            - npm run validate:env:frontend
        build:
          commands:
            - NEXT_PUBLIC_STAGE=dev npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
      environmentVariables:
        - NEXT_PUBLIC_STAGE=dev
        - NEXT_PUBLIC_API_URL=https://api-dev.marko.dev
        - NEXT_PUBLIC_SITE_URL=https://dev.marko.dev
```

### Production Environment
```yaml
# amplify-prod.yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Building for production environment"
            - npm run validate:env:frontend
            - npm run lint
            - npm run format:check
        build:
          commands:
            - NEXT_PUBLIC_STAGE=prod npm run build
        postBuild:
          commands:
            - echo "Production build completed"
            - npm run validate:build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
      environmentVariables:
        - NEXT_PUBLIC_STAGE=prod
        - NEXT_PUBLIC_API_URL=https://api.marko.dev
        - NEXT_PUBLIC_SITE_URL=https://marko.dev
```

## Custom Build Scripts

### Build Environment Injection Script
```javascript
// amplify/scripts/build-env-injection.js
const fs = require('fs');
const path = require('path');

const stage = process.env.STAGE || 'dev';
const configPath = path.join(__dirname, '..', '..', 'config', `${stage}.json`);

console.log(`Injecting environment configuration for stage: ${stage}`);

// Read stage-specific configuration
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Inject configuration into environment
  Object.keys(config).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = config[key];
      console.log(`Injected ${key}=${config[key]}`);
    }
  });
} else {
  console.warn(`Configuration file not found: ${configPath}`);
}

console.log('Environment injection completed');
```

### Build Validation Script
```javascript
// scripts/validate-build.js
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', '.next');
const requiredFiles = [
  'BUILD_ID',
  'static',
  'server',
  'standalone'
];

console.log('Validating build output...');

let isValid = true;

requiredFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`Missing required build file: ${file}`);
    isValid = false;
  } else {
    console.log(`✓ Found: ${file}`);
  }
});

// Check for critical pages
const pagesDir = path.join(buildDir, 'server', 'pages');
if (fs.existsSync(pagesDir)) {
  console.log('✓ Server pages directory exists');
} else {
  console.error('✗ Server pages directory missing');
  isValid = false;
}

if (isValid) {
  console.log('✓ Build validation passed');
  process.exit(0);
} else {
  console.error('✗ Build validation failed');
  process.exit(1);
}
```

## Branch-Specific Build Settings

### Feature Branch Configuration
```yaml
# For feature branches (feature/*)
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Building feature branch: $AMPLIFY_BRANCH"
            # Skip some checks for faster feature builds
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
      environmentVariables:
        - NEXT_PUBLIC_STAGE=feature
        - NEXT_PUBLIC_API_URL=https://api-dev.marko.dev
```

### Hotfix Branch Configuration
```yaml
# For hotfix branches (hotfix/*)
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            - echo "Building hotfix branch: $AMPLIFY_BRANCH"
            - npm run validate:env:frontend
            - npm run lint
        build:
          commands:
            - npm run build
        postBuild:
          commands:
            - echo "Hotfix build completed"
            - npm run test:critical
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

## Performance Optimization Settings

### Build Performance Configuration
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            # Use npm ci for faster, reliable installs
            - npm ci --prefer-offline --no-audit
            # Parallel environment setup
            - npm run validate:env:frontend &
            - node amplify/scripts/build-env-injection.js &
            - wait
        build:
          commands:
            # Use Turbopack for faster builds
            - npm run build
            # Optional: Analyze bundle size
            - npm run build:analyze || true
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
        exclude:
          # Exclude source maps in production
          - '**/*.map'
          - 'node_modules/**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
          - ~/.npm/**/*
          - .turbo/**/*
```

## Security-Enhanced Build Settings

### Security-Focused Configuration
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
            # Security audit
            - npm audit --audit-level high
            # Validate environment variables
            - npm run validate:env:frontend
            # Check for sensitive data in code
            - npm run security:scan || true
        build:
          commands:
            - npm run build
        postBuild:
          commands:
            # Validate build security
            - npm run security:validate-build || true
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
        exclude:
          # Exclude sensitive files
          - '.env*'
          - '*.log'
          - 'node_modules/**/*'
          - '.git/**/*'
          - 'docs/**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

## Monitoring and Logging Configuration

### Enhanced Logging Build Settings
```yaml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - echo "Build started at $(date)"
            - echo "Node version: $(node --version)"
            - echo "NPM version: $(npm --version)"
            - echo "Environment: $AMPLIFY_BRANCH"
            - npm ci
            - npm run validate:env:frontend
        build:
          commands:
            - echo "Starting build process..."
            - npm run build
            - echo "Build process completed"
        postBuild:
          commands:
            - echo "Build completed at $(date)"
            - echo "Build size analysis:"
            - du -sh .next/ || true
            - echo "Critical files check:"
            - ls -la .next/ || true
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

## Troubleshooting Build Issues

### Common Build Problems and Solutions

1. **Environment Variable Issues**
   ```yaml
   # Add debugging to preBuild phase
   preBuild:
     commands:
       - echo "Environment variables:"
       - printenv | grep NEXT_PUBLIC_ || true
       - npm run validate:env:frontend
   ```

2. **Cache Issues**
   ```yaml
   # Clear cache if needed
   preBuild:
     commands:
       - rm -rf .next/cache || true
       - npm ci
   ```

3. **Build Timeout Issues**
   ```yaml
   # Optimize build performance
   build:
     commands:
       - timeout 600 npm run build  # 10 minute timeout
   ```

4. **Memory Issues**
   ```yaml
   # Increase Node.js memory limit
   build:
     commands:
       - NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

## Build Settings Validation

### Validation Checklist
- [ ] All required environment variables are set
- [ ] Build commands are correct for the environment
- [ ] Artifact paths are properly configured
- [ ] Cache paths include all necessary directories
- [ ] Security exclusions are in place
- [ ] Performance optimizations are enabled
- [ ] Monitoring and logging are configured

### Testing Build Settings
```bash
# Test build locally with Amplify CLI
amplify mock hosting

# Validate build configuration
amplify configure project

# Test environment-specific builds
STAGE=dev amplify push
STAGE=prod amplify push
```