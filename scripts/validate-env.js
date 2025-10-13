#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * 
 * This script validates environment variables during the build process
 * and provides clear error messages for missing or invalid configuration.
 * 
 * Usage:
 *   node scripts/validate-env.js [--frontend|--backend|--all]
 */

const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

function requireEnv(name, value) {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function requireEnvNumber(name, value) {
  const str = requireEnv(name, value);
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a valid number, got: ${str}`);
  }
  return num;
}

function requireEnvEnum(name, value, allowedValues) {
  const str = requireEnv(name, value);
  if (!allowedValues.includes(str)) {
    throw new Error(
      `Environment variable ${name} must be one of: ${allowedValues.join(', ')}, got: ${str}`
    );
  }
  return str;
}

function requireEnvUrl(name, value) {
  const str = requireEnv(name, value);
  try {
    new URL(str);
    return str;
  } catch {
    throw new Error(`Environment variable ${name} must be a valid URL, got: ${str}`);
  }
}

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

function validateFrontendEnv() {
  console.log('🔍 Validating frontend environment variables...');
  
  const env = {
    NEXT_PUBLIC_API_URL: requireEnvUrl('NEXT_PUBLIC_API_URL', process.env.NEXT_PUBLIC_API_URL),
    NEXT_PUBLIC_SITE_URL: requireEnvUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL),
    NEXT_PUBLIC_STAGE: requireEnvEnum(
      'NEXT_PUBLIC_STAGE', 
      process.env.NEXT_PUBLIC_STAGE, 
      ['dev', 'staging', 'prod']
    ),
  };

  console.log('✅ Frontend environment variables validated');
  console.log(`   - Stage: ${env.NEXT_PUBLIC_STAGE}`);
  console.log(`   - Site URL: ${env.NEXT_PUBLIC_SITE_URL}`);
  console.log(`   - API URL: ${env.NEXT_PUBLIC_API_URL}`);
  
  return env;
}

function validateBackendEnv() {
  console.log('🔍 Validating backend environment variables...');
  
  const env = {
    STAGE: requireEnvEnum('STAGE', process.env.STAGE, ['dev', 'staging', 'prod']),
    TABLE_NAME: requireEnv('TABLE_NAME', process.env.TABLE_NAME),
    RATE_LIMIT_MAX: requireEnvNumber('RATE_LIMIT_MAX', process.env.RATE_LIMIT_MAX),
    RATE_LIMIT_WINDOW: requireEnvNumber('RATE_LIMIT_WINDOW', process.env.RATE_LIMIT_WINDOW),
    AWS_REGION: requireEnv('AWS_REGION', process.env.AWS_REGION),
    CORS_ORIGIN: requireEnvUrl('CORS_ORIGIN', process.env.CORS_ORIGIN),
  };

  console.log('✅ Backend environment variables validated');
  console.log(`   - Stage: ${env.STAGE}`);
  console.log(`   - Table: ${env.TABLE_NAME}`);
  console.log(`   - Rate Limit: ${env.RATE_LIMIT_MAX}/${env.RATE_LIMIT_WINDOW}s`);
  console.log(`   - Region: ${env.AWS_REGION}`);
  console.log(`   - CORS Origin: ${env.CORS_ORIGIN}`);
  
  return env;
}

function validateServerEnv() {
  console.log('🔍 Validating server environment variables...');
  
  const frontendEnv = validateFrontendEnv();
  
  const serverEnv = {
    ...frontendEnv,
    API_ENDPOINT: requireEnvUrl('API_ENDPOINT', process.env.API_ENDPOINT),
  };

  console.log('✅ Server environment variables validated');
  console.log(`   - API Endpoint: ${serverEnv.API_ENDPOINT}`);
  
  return serverEnv;
}

function validateBuildEnv() {
  console.log('🔍 Validating build environment variables...');
  
  const env = {
    AMPLIFY_APP_ID: process.env.AMPLIFY_APP_ID,
    AMPLIFY_BRANCH: process.env.AMPLIFY_BRANCH,
    AMPLIFY_COMMIT_ID: process.env.AMPLIFY_COMMIT_ID,
  };

  console.log('✅ Build environment variables validated');
  if (env.AMPLIFY_APP_ID) {
    console.log(`   - Amplify App: ${env.AMPLIFY_APP_ID}`);
    console.log(`   - Branch: ${env.AMPLIFY_BRANCH || 'local'}`);
    console.log(`   - Commit: ${env.AMPLIFY_COMMIT_ID || 'local'}`);
  } else {
    console.log('   - Running in local development mode');
  }
  
  return env;
}

// =============================================================================
// ENVIRONMENT FILE VALIDATION
// =============================================================================

function validateEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  const examplePath = path.join(process.cwd(), '.env.local.example');
  
  if (!fs.existsSync(examplePath)) {
    console.warn('⚠️  .env.local.example file not found');
    return;
  }
  
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env.local file not found - using environment variables only');
    return;
  }
  
  console.log('✅ Environment files found');
  console.log(`   - Example: ${examplePath}`);
  console.log(`   - Local: ${envPath}`);
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

function validateEnvironment(mode = 'all') {
  console.log('🚀 Starting environment validation...');
  console.log(`   Mode: ${mode}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log('');

  try {
    // Validate environment files
    validateEnvFile();
    console.log('');

    // Validate build environment
    validateBuildEnv();
    console.log('');

    // Validate based on mode
    switch (mode) {
      case 'frontend':
        validateFrontendEnv();
        break;
      case 'backend':
        validateBackendEnv();
        break;
      case 'server':
        validateServerEnv();
        break;
      case 'all':
      default:
        validateServerEnv(); // Includes frontend validation
        console.log('');
        validateBackendEnv();
        break;
    }

    console.log('');
    console.log('🎉 All environment variables validated successfully!');
    return true;

  } catch (error) {
    console.log('');
    console.error('❌ Environment validation failed:');
    console.error(`   ${error.message}`);
    console.log('');
    console.log('💡 Tips:');
    console.log('   - Copy .env.local.example to .env.local and update values');
    console.log('   - Check Amplify Console environment variables for production');
    console.log('   - Ensure all required variables are set for your stage');
    console.log('');
    return false;
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const mode = args.find(arg => ['--frontend', '--backend', '--server', '--all'].includes(arg))?.replace('--', '') || 'all';
  
  const success = validateEnvironment(mode);
  process.exit(success ? 0 : 1);
}

module.exports = {
  validateEnvironment,
  validateFrontendEnv,
  validateBackendEnv,
  validateServerEnv,
  validateBuildEnv,
};