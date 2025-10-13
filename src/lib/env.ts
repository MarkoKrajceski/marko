/**
 * Environment Configuration Utility
 * 
 * This utility provides type-safe access to environment variables with proper fallbacks
 * for local development. It handles both build-time and runtime environment detection.
 */

import getConfig from 'next/config';

// Get Next.js runtime config
const { publicRuntimeConfig, serverRuntimeConfig } = getConfig() || {};

// Environment detection
export const isServer = typeof window === 'undefined';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Stage detection with fallbacks
export const getStage = (): 'dev' | 'staging' | 'prod' => {
  // Try multiple sources for stage detection
  const stage = 
    process.env.NEXT_PUBLIC_STAGE ||
    publicRuntimeConfig?.stage ||
    process.env.STAGE ||
    (isDevelopment ? 'dev' : 'prod');
  
  return stage as 'dev' | 'staging' | 'prod';
};

// API URL with intelligent fallbacks
export const getApiUrl = (): string => {
  // In development, use local API
  if (isDevelopment) {
    return 'http://localhost:3000/api';
  }
  
  // Try multiple sources for API URL
  const apiUrl = 
    process.env.NEXT_PUBLIC_API_URL ||
    publicRuntimeConfig?.apiUrl;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Fallback: construct API URL from current domain
  if (!isServer && typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // If we're on an Amplify domain, construct the API URL
    if (hostname.includes('amplifyapp.com')) {
      return `${protocol}//${hostname}/api`;
    }
    
    // For custom domains, assume API is on api subdomain
    if (hostname === 'marko.dev') {
      return 'https://api.marko.dev';
    }
    
    // Default fallback
    return `${protocol}//${hostname}/api`;
  }
  
  // Server-side fallback
  const stage = getStage();
  return stage === 'prod' 
    ? 'https://api.marko.dev'
    : `https://api-${stage}.marko.dev`;
};

// Site URL with intelligent fallbacks
export const getSiteUrl = (): string => {
  // Try multiple sources for site URL
  const siteUrl = 
    process.env.NEXT_PUBLIC_SITE_URL ||
    publicRuntimeConfig?.siteUrl;
  
  if (siteUrl) {
    return siteUrl;
  }
  
  // Fallback: construct site URL from current domain
  if (!isServer && typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // Server-side fallback
  const stage = getStage();
  return stage === 'prod' 
    ? 'https://marko.dev'
    : `https://${stage}.marko.dev`;
};

// Backend configuration (server-side only)
export const getBackendConfig = () => {
  if (!isServer) {
    throw new Error('Backend config is only available on the server side');
  }
  
  const stage = getStage();
  
  return {
    tableName: 
      process.env.TABLE_NAME ||
      serverRuntimeConfig?.tableName ||
      `personalSiteData-${stage}`,
    
    rateLimitMax: 
      parseInt(process.env.RATE_LIMIT_MAX || '') ||
      serverRuntimeConfig?.rateLimitMax ||
      (stage === 'prod' ? 30 : 10),
    
    rateLimitWindow: 
      parseInt(process.env.RATE_LIMIT_WINDOW || '') ||
      serverRuntimeConfig?.rateLimitWindow ||
      60,
    
    awsRegion: 
      process.env.AWS_REGION ||
      serverRuntimeConfig?.awsRegion ||
      'us-east-1',
    
    corsOrigin: 
      process.env.CORS_ORIGIN ||
      serverRuntimeConfig?.corsOrigin ||
      getSiteUrl(),
  };
};

// Environment info for debugging
export const getEnvironmentInfo = () => {
  return {
    stage: getStage(),
    apiUrl: getApiUrl(),
    siteUrl: getSiteUrl(),
    isDevelopment,
    isProduction,
    isServer,
    nodeEnv: process.env.NODE_ENV,
    buildTime: process.env.BUILD_TIME,
    buildId: process.env.BUILD_ID,
    amplifyAppId: process.env.AMPLIFY_APP_ID,
    amplifyBranch: process.env.AMPLIFY_BRANCH,
    amplifyCommitId: process.env.AMPLIFY_COMMIT_ID,
  };
};

// Validation function
export const validateEnvironment = () => {
  const errors: string[] = [];
  
  try {
    const stage = getStage();
    const apiUrl = getApiUrl();
    const siteUrl = getSiteUrl();
    
    if (!stage) errors.push('Stage is not defined');
    if (!apiUrl) errors.push('API URL is not defined');
    if (!siteUrl) errors.push('Site URL is not defined');
    
    // Server-side validation
    if (isServer) {
      try {
        const backendConfig = getBackendConfig();
        if (!backendConfig.tableName) errors.push('Table name is not defined');
        if (!backendConfig.awsRegion) errors.push('AWS region is not defined');
      } catch {
        // Backend config validation is optional for client-side
      }
    }
    
    if (errors.length > 0) {
      console.error('Environment validation errors:', errors);
      return { valid: false, errors };
    }
    
    console.log('✅ Environment validation passed', {
      stage,
      apiUrl,
      siteUrl,
    });
    
    return { valid: true, errors: [] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Environment validation failed:', errorMessage);
    return { valid: false, errors: [errorMessage] };
  }
};

// Export environment variables for easy access
export const env = {
  stage: getStage(),
  apiUrl: getApiUrl(),
  siteUrl: getSiteUrl(),
  isDevelopment,
  isProduction,
  isServer,
} as const;

// Default export
const envUtils = {
  getStage,
  getApiUrl,
  getSiteUrl,
  getBackendConfig,
  getEnvironmentInfo,
  validateEnvironment,
  env,
};

export default envUtils;