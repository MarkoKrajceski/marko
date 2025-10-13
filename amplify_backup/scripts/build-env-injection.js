#!/usr/bin/env node

/**
 * Amplify Build-Time Environment Injection Script
 * 
 * This script automatically generates environment variables during the Amplify build process
 * by reading the Amplify backend configuration and injecting the correct API URLs and settings.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Amplify build-time environment injection...');

// Get Amplify environment information
const amplifyAppId = process.env.AMPLIFY_APP_ID || 'local';
const amplifyBranch = process.env.AMPLIFY_BRANCH || 'main';
const amplifyCommitId = process.env.AMPLIFY_COMMIT_ID || 'local';
const awsRegion = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-1';

// Determine stage from branch
function getStageFromBranch(branch) {
  if (branch === 'main' || branch === 'master') return 'prod';
  if (branch === 'staging') return 'staging';
  if (branch === 'develop' || branch === 'dev') return 'dev';
  return 'dev'; // Default for feature branches
}

const stage = process.env.STAGE || getStageFromBranch(amplifyBranch);

console.log(`📋 Build Environment Info:
  - App ID: ${amplifyAppId}
  - Branch: ${amplifyBranch}
  - Stage: ${stage}
  - Region: ${awsRegion}
  - Commit: ${amplifyCommitId.substring(0, 8)}...`);

// Function to read Amplify backend configuration
function getAmplifyBackendConfig() {
  const amplifyBackendPath = path.join(process.cwd(), 'amplify', 'backend', 'amplify-meta.json');
  const teamProviderPath = path.join(process.cwd(), 'amplify', 'team-provider-info.json');
  
  let backendConfig = {};
  let teamProviderInfo = {};
  
  // Try to read amplify-meta.json
  if (fs.existsSync(amplifyBackendPath)) {
    try {
      backendConfig = JSON.parse(fs.readFileSync(amplifyBackendPath, 'utf8'));
      console.log('✅ Found Amplify backend configuration');
    } catch (error) {
      console.warn('⚠️  Could not parse amplify-meta.json:', error.message);
    }
  } else {
    console.log('ℹ️  No amplify-meta.json found (expected for initial build)');
  }
  
  // Try to read team-provider-info.json
  if (fs.existsSync(teamProviderPath)) {
    try {
      teamProviderInfo = JSON.parse(fs.readFileSync(teamProviderPath, 'utf8'));
      console.log('✅ Found team provider configuration');
    } catch (error) {
      console.warn('⚠️  Could not parse team-provider-info.json:', error.message);
    }
  }
  
  return { backendConfig, teamProviderInfo };
}

// Function to generate API URL from Amplify configuration
function generateApiUrl(backendConfig, stage, region, appId) {
  // Try to get API Gateway URL from backend config
  if (backendConfig.api) {
    const apiName = Object.keys(backendConfig.api)[0];
    if (apiName && backendConfig.api[apiName]) {
      const apiConfig = backendConfig.api[apiName];
      if (apiConfig.output && apiConfig.output.RootUrl) {
        console.log('✅ Found API URL from backend config');
        return apiConfig.output.RootUrl;
      }
    }
  }
  
  // Fallback: Generate expected API Gateway URL pattern
  const apiId = `${appId.substring(0, 10)}${stage}api`;
  const generatedUrl = `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;
  console.log('🔧 Generated API URL from pattern');
  return generatedUrl;
}

// Function to generate site URL
function generateSiteUrl(stage, appId, branch) {
  if (stage === 'prod') {
    return 'https://marko.dev';
  }
  
  // For non-prod environments, use Amplify's default URL pattern
  return `https://${branch}.${appId}.amplifyapp.com`;
}

// Main injection function
function injectEnvironmentVariables() {
  const { backendConfig, teamProviderInfo } = getAmplifyBackendConfig();
  
  // Generate environment variables
  const apiUrl = generateApiUrl(backendConfig, stage, awsRegion, amplifyAppId);
  const siteUrl = generateSiteUrl(stage, amplifyAppId, amplifyBranch);
  
  // Environment variables to inject
  const envVars = {
    // Stage information
    STAGE: stage,
    NEXT_PUBLIC_STAGE: stage,
    
    // URLs
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    
    // AWS Configuration
    AWS_REGION: awsRegion,
    
    // Build information
    AMPLIFY_APP_ID: amplifyAppId,
    AMPLIFY_BRANCH: amplifyBranch,
    AMPLIFY_COMMIT_ID: amplifyCommitId,
    
    // Backend configuration
    TABLE_NAME: `personalSiteData-${stage}`,
    RATE_LIMIT_MAX: stage === 'prod' ? '30' : '10',
    RATE_LIMIT_WINDOW: '60',
    CORS_ORIGIN: siteUrl
  };
  
  console.log('🔧 Injecting environment variables:');
  
  // Inject environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    // Only set if not already defined (allow manual overrides)
    if (!process.env[key]) {
      process.env[key] = value;
      console.log(`  ✅ ${key}=${value}`);
    } else {
      console.log(`  ⏭️  ${key}=${process.env[key]} (already set)`);
    }
  });
  
  // Create .env file for Next.js build process
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const envFilePath = path.join(process.cwd(), '.env.production');
  fs.writeFileSync(envFilePath, envContent);
  console.log(`✅ Created ${envFilePath} for Next.js build`);
  
  return envVars;
}

// Function to validate required environment variables
function validateEnvironment(envVars) {
  const requiredVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_STAGE',
    'TABLE_NAME',
    'AWS_REGION'
  ];
  
  const missing = requiredVars.filter(varName => !envVars[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

// Function to create environment info file for runtime access
function createRuntimeEnvInfo(envVars) {
  const runtimeEnv = {
    stage: envVars.NEXT_PUBLIC_STAGE,
    apiUrl: envVars.NEXT_PUBLIC_API_URL,
    siteUrl: envVars.NEXT_PUBLIC_SITE_URL,
    buildTime: new Date().toISOString(),
    commitId: envVars.AMPLIFY_COMMIT_ID,
    branch: envVars.AMPLIFY_BRANCH
  };
  
  const envInfoPath = path.join(process.cwd(), 'public', 'env-info.json');
  
  // Ensure public directory exists
  const publicDir = path.dirname(envInfoPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(envInfoPath, JSON.stringify(runtimeEnv, null, 2));
  console.log(`✅ Created runtime environment info at ${envInfoPath}`);
}

// Main execution
try {
  console.log('🔄 Injecting build-time environment variables...');
  
  const injectedVars = injectEnvironmentVariables();
  validateEnvironment(injectedVars);
  createRuntimeEnvInfo(injectedVars);
  
  console.log('✅ Build-time environment injection completed successfully!');
  console.log(`🌐 API URL: ${injectedVars.NEXT_PUBLIC_API_URL}`);
  console.log(`🏠 Site URL: ${injectedVars.NEXT_PUBLIC_SITE_URL}`);
  
} catch (error) {
  console.error('❌ Build-time environment injection failed:', error);
  process.exit(1);
}