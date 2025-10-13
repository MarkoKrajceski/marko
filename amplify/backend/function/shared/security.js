/**
 * Security Utilities for Lambda Functions
 * 
 * This module provides security utilities for AWS Lambda functions including:
 * - Input validation and sanitization
 * - XSS prevention
 * - SQL injection prevention
 * - Request validation
 */

const crypto = require('crypto');

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize string input to prevent XSS and injection attacks
 * @param {string} input - Input string to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Sanitized string
 */
function sanitizeString(input, maxLength = 1000) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .replace(/['"]/g, '') // Remove quotes to prevent injection
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitize email input with validation
 * @param {string} email - Email string to sanitize
 * @returns {string|null} Sanitized email or null if invalid
 */
function sanitizeEmail(email) {
  if (typeof email !== 'string') {
    return null;
  }
  
  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized) || sanitized.length > 254) {
    return null;
  }
  
  // Additional security checks
  if (sanitized.includes('<') || sanitized.includes('>') || sanitized.includes('script')) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate and sanitize pitch request data
 * @param {Object} data - Request data
 * @returns {Object} Validation result with sanitized data or errors
 */
function validatePitchRequest(data) {
  const errors = [];
  const sanitized = {};
  
  // Validate role
  const allowedRoles = ['recruiter', 'cto', 'product', 'founder'];
  if (!data.role || !allowedRoles.includes(data.role)) {
    errors.push('Role must be one of: ' + allowedRoles.join(', '));
  } else {
    sanitized.role = data.role;
  }
  
  // Validate focus
  const allowedFocus = ['ai', 'cloud', 'automation'];
  if (!data.focus || !allowedFocus.includes(data.focus)) {
    errors.push('Focus must be one of: ' + allowedFocus.join(', '));
  } else {
    sanitized.focus = data.focus;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

/**
 * Validate and sanitize lead request data
 * @param {Object} data - Request data
 * @returns {Object} Validation result with sanitized data or errors
 */
function validateLeadRequest(data) {
  const errors = [];
  const sanitized = {};
  
  // Validate name
  if (!data.name) {
    errors.push('Name is required');
  } else {
    const name = sanitizeString(data.name, 100);
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else {
      sanitized.name = name;
    }
  }
  
  // Validate email
  if (!data.email) {
    errors.push('Email is required');
  } else {
    const email = sanitizeEmail(data.email);
    if (!email) {
      errors.push('Please provide a valid email address');
    } else {
      sanitized.email = email;
    }
  }
  
  // Validate message
  if (!data.message) {
    errors.push('Message is required');
  } else {
    const message = sanitizeString(data.message, 2000);
    if (message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    } else {
      sanitized.message = message;
    }
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

// =============================================================================
// REQUEST VALIDATION
// =============================================================================

/**
 * Validate HTTP method for endpoint
 * @param {string} method - HTTP method
 * @param {string[]} allowedMethods - Array of allowed methods
 * @returns {boolean} True if method is allowed
 */
function validateHttpMethod(method, allowedMethods) {
  return allowedMethods.includes(method.toUpperCase());
}

/**
 * Validate request headers for security
 * @param {Object} headers - Request headers
 * @param {string} expectedOrigin - Expected origin for CORS
 * @returns {Object} Validation result
 */
function validateRequestHeaders(headers, expectedOrigin) {
  const issues = [];
  
  // Check Content-Type for POST requests
  const contentType = headers['content-type'] || headers['Content-Type'];
  if (contentType && !contentType.includes('application/json')) {
    issues.push('Invalid Content-Type header');
  }
  
  // Check Origin for CORS (if provided)
  const origin = headers.origin || headers.Origin;
  if (origin && origin !== expectedOrigin) {
    issues.push('Invalid origin');
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-host', 'x-original-host'];
  for (const header of suspiciousHeaders) {
    if (headers[header]) {
      issues.push(`Suspicious header detected: ${header}`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

// =============================================================================
// DATA HASHING AND ANONYMIZATION
// =============================================================================

/**
 * Hash sensitive data for analytics while preserving privacy
 * @param {string} data - Data to hash
 * @param {string} salt - Salt for hashing
 * @returns {string} Hashed data
 */
function hashSensitiveData(data, salt = '') {
  return crypto
    .createHash('sha256')
    .update(data + salt)
    .digest('hex')
    .substring(0, 16); // Truncate for storage efficiency
}

/**
 * Anonymize IP address for logging
 * @param {string} ip - IP address
 * @returns {string} Anonymized IP hash
 */
function anonymizeIP(ip) {
  if (!ip || ip === 'unknown') {
    return 'unknown';
  }
  
  // Hash IP with a daily salt for privacy
  const today = new Date().toISOString().split('T')[0];
  return hashSensitiveData(ip, today);
}

/**
 * Anonymize User-Agent for logging
 * @param {string} userAgent - User-Agent string
 * @returns {string} Anonymized User-Agent hash
 */
function anonymizeUserAgent(userAgent) {
  if (!userAgent) {
    return 'unknown';
  }
  
  // Extract basic info and hash the rest
  const basicInfo = userAgent.substring(0, 50); // Keep first 50 chars for debugging
  const hash = hashSensitiveData(userAgent);
  
  return `${basicInfo}...${hash}`;
}

// =============================================================================
// SECURITY RESPONSE HELPERS
// =============================================================================

/**
 * Create security error response
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Lambda response object
 */
function createSecurityErrorResponse(message, code, statusCode = 400) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
    body: JSON.stringify({
      error: true,
      message,
      code,
      timestamp: new Date().toISOString(),
    }),
  };
}

/**
 * Validate request size to prevent DoS attacks
 * @param {string} body - Request body
 * @param {number} maxSize - Maximum allowed size in bytes
 * @returns {boolean} True if size is acceptable
 */
function validateRequestSize(body, maxSize = 10240) { // 10KB default
  if (!body) return true;
  
  const size = Buffer.byteLength(body, 'utf8');
  return size <= maxSize;
}

/**
 * Check for common attack patterns in request data
 * @param {Object} data - Request data
 * @returns {Object} Security check result
 */
function checkForAttackPatterns(data) {
  const threats = [];
  const dataString = JSON.stringify(data).toLowerCase();
  
  // SQL injection patterns
  const sqlPatterns = [
    'union select',
    'drop table',
    'insert into',
    'delete from',
    'update set',
    '1=1',
    'or 1=1',
    'and 1=1',
  ];
  
  // XSS patterns
  const xssPatterns = [
    '<script',
    'javascript:',
    'onerror=',
    'onload=',
    'onclick=',
    'eval(',
    'alert(',
  ];
  
  // Check for SQL injection
  for (const pattern of sqlPatterns) {
    if (dataString.includes(pattern)) {
      threats.push(`SQL injection pattern detected: ${pattern}`);
    }
  }
  
  // Check for XSS
  for (const pattern of xssPatterns) {
    if (dataString.includes(pattern)) {
      threats.push(`XSS pattern detected: ${pattern}`);
    }
  }
  
  return {
    isSafe: threats.length === 0,
    threats
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Input sanitization
  sanitizeString,
  sanitizeEmail,
  validatePitchRequest,
  validateLeadRequest,
  
  // Request validation
  validateHttpMethod,
  validateRequestHeaders,
  validateRequestSize,
  checkForAttackPatterns,
  
  // Data anonymization
  hashSensitiveData,
  anonymizeIP,
  anonymizeUserAgent,
  
  // Response helpers
  createSecurityErrorResponse,
};