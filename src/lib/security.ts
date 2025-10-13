/**
 * Security Utilities and Configurations
 * 
 * This module provides security utilities including:
 * - Content Security Policy (CSP) configuration
 * - Input sanitization and validation
 * - XSS prevention utilities
 * - Security headers management
 */

import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// CONTENT SECURITY POLICY
// =============================================================================

/**
 * Generate Content Security Policy header value
 * @param stage - Environment stage for different CSP rules
 * @returns CSP header value
 */
export function generateCSP(stage: 'dev' | 'staging' | 'prod' = 'prod'): string {
  const isDevelopment = stage === 'dev';

  // Base CSP directives
  const csp = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for Next.js inline scripts
      ...(isDevelopment ? ["'unsafe-eval'"] : []), // Only in development
      'https://cdn.jsdelivr.net', // For any CDN scripts if needed
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components and CSS-in-JS
      'https://fonts.googleapis.com',
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:', // For base64 encoded fonts
    ],
    'img-src': [
      "'self'",
      'data:', // For base64 encoded images
      'https:', // Allow HTTPS images
      ...(isDevelopment ? ['http:'] : []), // HTTP images only in development
    ],
    'connect-src': [
      "'self'",
      ...(stage === 'dev' ? ['http://localhost:3000'] : []),
      ...(stage === 'staging' ? ['https://api-staging.marko.dev'] : []),
      ...(stage === 'prod' ? ['https://api.marko.dev'] : []),
    ],
    'frame-src': ["'none'"], // Prevent framing
    'object-src': ["'none'"], // Prevent object/embed/applet
    'base-uri': ["'self'"], // Restrict base tag
    'form-action': ["'self'"], // Restrict form submissions
    'frame-ancestors': ["'none'"], // Prevent framing by others
    'upgrade-insecure-requests': [], // Upgrade HTTP to HTTPS
  };

  // Convert to CSP string
  return Object.entries(csp)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// =============================================================================
// SECURITY HEADERS
// =============================================================================

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Prevent clickjacking
  'X-Frame-Options': 'DENY',

  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',

  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions policy (formerly Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
  ].join(', '),

  // Strict Transport Security (HTTPS only)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Expect-CT header for certificate transparency
  'Expect-CT': 'max-age=86400, enforce',
} as const;

/**
 * Apply security headers to a response
 * @param response - Next.js response object
 * @param stage - Environment stage
 * @returns Response with security headers applied
 */
export function applySecurityHeaders(
  response: NextResponse,
  stage: 'dev' | 'staging' | 'prod' = 'prod'
): NextResponse {
  // Apply standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply CSP header
  response.headers.set('Content-Security-Policy', generateCSP(stage));

  return response;
}

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

/**
 * Sanitize string input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/script/gi, '') // Remove script tags
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Sanitize email input
 * @param email - Email string to sanitize
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') {
    return null;
  }

  const sanitized = email.toLowerCase().trim();

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized) || sanitized.length > 254) {
    return null;
  }

  return sanitized;
}

/**
 * Sanitize and validate form data
 * @param data - Form data object
 * @returns Sanitized and validated data
 */
export function sanitizeFormData(data: Record<string, unknown>): {
  sanitized: Record<string, string>;
  errors: string[];
} {
  const sanitized: Record<string, string> = {};
  const errors: string[] = [];

  // Sanitize name field
  if (data.name && typeof data.name === 'string') {
    const name = sanitizeString(data.name);
    if (name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    } else if (name.length > 100) {
      errors.push('Name must be less than 100 characters');
    } else {
      sanitized.name = name;
    }
  } else {
    errors.push('Name is required');
  }

  // Sanitize email field
  if (data.email && typeof data.email === 'string') {
    const email = sanitizeEmail(data.email);
    if (!email) {
      errors.push('Please provide a valid email address');
    } else {
      sanitized.email = email;
    }
  } else {
    errors.push('Email is required');
  }

  // Sanitize message field
  if (data.message && typeof data.message === 'string') {
    const message = sanitizeString(data.message);
    if (message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    } else if (message.length > 2000) {
      errors.push('Message must be less than 2000 characters');
    } else {
      sanitized.message = message;
    }
  } else {
    errors.push('Message is required');
  }

  return { sanitized, errors };
}

// =============================================================================
// RATE LIMITING UTILITIES
// =============================================================================

/**
 * Simple in-memory rate limiter for client-side protection
 */
class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 5, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns True if request should be blocked
   */
  isRateLimited(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this identifier
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests
    const recentRequests = requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    return false;
  }

  /**
   * Clear old entries to prevent memory leaks
   */
  cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs * 2; // Keep some buffer

    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > cutoff);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

// Global rate limiter instance
export const clientRateLimiter = new ClientRateLimiter();

// Cleanup old entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => clientRateLimiter.cleanup(), 5 * 60 * 1000);
}

// =============================================================================
// SECURITY VALIDATION
// =============================================================================

/**
 * Validate request origin for CSRF protection
 * @param request - Next.js request object
 * @param allowedOrigins - Array of allowed origins
 * @returns True if origin is valid
 */
export function validateOrigin(request: NextRequest, allowedOrigins: string[]): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Check origin header
  if (origin && allowedOrigins.includes(origin)) {
    return true;
  }

  // Check referer header as fallback
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      return allowedOrigins.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Generate secure random token
 * @param length - Token length
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Hash sensitive data for logging/analytics
 * @param data - Data to hash
 * @returns Hashed string
 */
export function hashSensitiveData(data: string): string {
  // Simple hash function for client-side use
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}