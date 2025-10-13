/**
 * Lambda Environment Variable Validation Utilities
 * 
 * This module provides environment variable validation specifically for AWS Lambda functions.
 * It's designed to be lightweight and have minimal dependencies for optimal cold start performance.
 */

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validates that a required environment variable exists and is not empty
 * @param {string} name - Environment variable name
 * @param {string|undefined} value - Environment variable value
 * @returns {string} Validated and trimmed value
 * @throws {Error} If variable is missing or empty
 */
function requireEnv(name, value) {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

/**
 * Validates and converts a string to number
 * @param {string} name - Environment variable name
 * @param {string|undefined} value - Environment variable value
 * @returns {number} Validated number
 * @throws {Error} If variable is missing or not a valid number
 */
function requireEnvNumber(name, value) {
  const str = requireEnv(name, value);
  const num = parseInt(str, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a valid number, got: ${str}`);
  }
  return num;
}

/**
 * Validates that a value is one of the allowed options
 * @param {string} name - Environment variable name
 * @param {string|undefined} value - Environment variable value
 * @param {string[]} allowedValues - Array of allowed values
 * @returns {string} Validated value
 * @throws {Error} If variable is missing or not in allowed values
 */
function requireEnvEnum(name, value, allowedValues) {
  const str = requireEnv(name, value);
  if (!allowedValues.includes(str)) {
    throw new Error(
      `Environment variable ${name} must be one of: ${allowedValues.join(', ')}, got: ${str}`
    );
  }
  return str;
}

/**
 * Validates URL format
 * @param {string} name - Environment variable name
 * @param {string|undefined} value - Environment variable value
 * @returns {string} Validated URL
 * @throws {Error} If variable is missing or not a valid URL
 */
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
// LAMBDA ENVIRONMENT VALIDATION
// =============================================================================

/**
 * Validates and returns all required environment variables for Lambda functions
 * @returns {Object} Validated environment configuration
 * @throws {Error} If any required environment variable is missing or invalid
 */
function validateLambdaEnv() {
  try {
    const env = {
      STAGE: requireEnvEnum('STAGE', process.env.STAGE, ['dev', 'staging', 'prod']),
      TABLE_NAME: requireEnv('TABLE_NAME', process.env.TABLE_NAME),
      RATE_LIMIT_MAX: requireEnvNumber('RATE_LIMIT_MAX', process.env.RATE_LIMIT_MAX),
      RATE_LIMIT_WINDOW: requireEnvNumber('RATE_LIMIT_WINDOW', process.env.RATE_LIMIT_WINDOW),
      AWS_REGION: requireEnv('AWS_REGION', process.env.AWS_REGION),
      CORS_ORIGIN: requireEnvUrl('CORS_ORIGIN', process.env.CORS_ORIGIN),
    };

    // Log successful validation in development
    if (env.STAGE === 'dev') {
      console.log('✅ Lambda environment validation successful:', {
        stage: env.STAGE,
        tableName: env.TABLE_NAME,
        rateLimit: `${env.RATE_LIMIT_MAX}/${env.RATE_LIMIT_WINDOW}s`,
        region: env.AWS_REGION,
        corsOrigin: env.CORS_ORIGIN,
      });
    }

    return env;
  } catch (error) {
    console.error('❌ Lambda environment validation failed:', error.message);
    throw error;
  }
}

// =============================================================================
// CACHED ENVIRONMENT INSTANCE
// =============================================================================

let cachedEnv = null;

/**
 * Get validated Lambda environment variables (cached)
 * Safe to call multiple times - validation only happens once per Lambda container
 * @returns {Object} Validated environment configuration
 */
function getLambdaEnv() {
  if (!cachedEnv) {
    cachedEnv = validateLambdaEnv();
  }
  return cachedEnv;
}

// =============================================================================
// CORS UTILITIES
// =============================================================================

/**
 * Get CORS headers for Lambda responses
 * @returns {Object} CORS headers object
 */
function getCorsHeaders() {
  const env = getLambdaEnv();
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Create a standardized Lambda response with CORS headers
 * @param {number} statusCode - HTTP status code
 * @param {Object} body - Response body (will be JSON stringified)
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Lambda response object
 */
function createLambdaResponse(statusCode, body, additionalHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(),
      ...additionalHeaders,
    },
    body: JSON.stringify(body),
  };
}

/**
 * Create a success response
 * @param {Object} data - Success response data
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} Lambda response object
 */
function createSuccessResponse(data, additionalHeaders = {}) {
  return createLambdaResponse(200, data, additionalHeaders);
}

/**
 * Create an error response
 * @param {number} statusCode - HTTP error status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {Object} additionalData - Additional error data
 * @returns {Object} Lambda response object
 */
function createErrorResponse(statusCode, message, code, additionalData = {}) {
  return createLambdaResponse(statusCode, {
    error: true,
    message,
    code,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}

/**
 * Handle CORS preflight requests
 * @returns {Object} Lambda response object for OPTIONS requests
 */
function handleCorsPreflightRequest() {
  return {
    statusCode: 200,
    headers: getCorsHeaders(),
    body: '',
  };
}

// =============================================================================
// RATE LIMITING UTILITIES
// =============================================================================

/**
 * Generate a rate limit key from IP address
 * @param {string} ip - Client IP address
 * @returns {string} Rate limit key
 */
function getRateLimitKey(ip) {
  const env = getLambdaEnv();
  // Hash IP for privacy while maintaining rate limiting functionality
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(ip + env.STAGE).digest('hex');
  return `rate_limit:${hash.substring(0, 16)}`;
}

/**
 * Check if request should be rate limited
 * @param {string} ip - Client IP address
 * @param {Object} dynamoClient - DynamoDB client instance
 * @returns {Promise<boolean>} True if request should be rate limited
 */
async function isRateLimited(ip, dynamoClient) {
  const env = getLambdaEnv();
  const key = getRateLimitKey(ip);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - env.RATE_LIMIT_WINDOW;

  try {
    // Query recent requests for this IP
    const params = {
      TableName: env.TABLE_NAME,
      KeyConditionExpression: 'pk = :pk AND sk > :windowStart',
      ExpressionAttributeValues: {
        ':pk': key,
        ':windowStart': `time#${windowStart}`,
      },
    };

    const result = await dynamoClient.query(params).promise();
    const requestCount = result.Items ? result.Items.length : 0;

    // Check if rate limit exceeded
    if (requestCount >= env.RATE_LIMIT_MAX) {
      console.warn(`Rate limit exceeded for IP hash: ${key.split(':')[1]}, requests: ${requestCount}`);
      return true;
    }

    // Record this request
    await dynamoClient.put({
      TableName: env.TABLE_NAME,
      Item: {
        pk: key,
        sk: `time#${now}`,
        timestamp: new Date().toISOString(),
        ttl: now + env.RATE_LIMIT_WINDOW + 300, // TTL with 5min buffer
      },
    }).promise();

    return false;
  } catch (error) {
    console.error('Rate limiting check failed:', error);
    // Fail open - don't block requests if rate limiting fails
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Environment validation
  validateLambdaEnv,
  getLambdaEnv,
  
  // Response utilities
  createLambdaResponse,
  createSuccessResponse,
  createErrorResponse,
  handleCorsPreflightRequest,
  getCorsHeaders,
  
  // Rate limiting
  isRateLimited,
  getRateLimitKey,
  
  // Validation helpers (for custom validation)
  requireEnv,
  requireEnvNumber,
  requireEnvEnum,
  requireEnvUrl,
};