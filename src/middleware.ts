/**
 * Next.js Middleware for Security and Request Processing
 * 
 * This middleware applies security headers, CSRF protection, and rate limiting
 * to all requests before they reach the application.
 */

import { NextRequest, NextResponse } from 'next/server';
import { applySecurityHeaders, validateOrigin, clientRateLimiter } from '@/lib/security';
import { getStage } from '@/lib/env';

// =============================================================================
// CONFIGURATION
// =============================================================================

const ALLOWED_ORIGINS = {
  dev: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  staging: ['https://staging.marko.dev'],
  prod: ['https://marko.dev', 'https://www.marko.dev'],
};

const RATE_LIMITED_PATHS = ['/api/pitch', '/api/lead'];
// const PROTECTED_PATHS = ['/api/']; // Reserved for future use

// =============================================================================
// MIDDLEWARE FUNCTION
// =============================================================================

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const userAgent = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  
  // Get current stage for environment-specific rules
  let stage: 'dev' | 'staging' | 'prod' = 'prod';
  try {
    stage = getStage();
  } catch {
    // Fallback to prod for security
    stage = 'prod';
  }
  
  // Create response
  let response = NextResponse.next();
  
  // =============================================================================
  // SECURITY HEADERS
  // =============================================================================
  
  // Apply security headers to all responses
  response = applySecurityHeaders(response, stage);
  
  // =============================================================================
  // CSRF PROTECTION
  // =============================================================================
  
  // Apply CSRF protection to API routes
  if (pathname.startsWith('/api/') && method !== 'GET') {
    const allowedOrigins = ALLOWED_ORIGINS[stage] || ALLOWED_ORIGINS.prod;
    
    if (!validateOrigin(request, allowedOrigins)) {
      console.warn(`CSRF protection: Invalid origin for ${pathname}`, {
        origin: request.headers.get('origin'),
        referer: request.headers.get('referer'),
        ip,
        userAgent: userAgent.substring(0, 100),
      });
      
      return new NextResponse(
        JSON.stringify({
          error: true,
          message: 'Invalid origin',
          code: 'CSRF_PROTECTION',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      );
    }
  }
  
  // =============================================================================
  // RATE LIMITING
  // =============================================================================
  
  // Apply rate limiting to specific API endpoints
  if (RATE_LIMITED_PATHS.some(path => pathname.startsWith(path))) {
    const identifier = `${ip}:${pathname}`;
    
    if (clientRateLimiter.isRateLimited(identifier)) {
      console.warn(`Rate limit exceeded for ${pathname}`, {
        ip,
        userAgent: userAgent.substring(0, 100),
        pathname,
      });
      
      return new NextResponse(
        JSON.stringify({
          error: true,
          message: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString(),
          retryAfter: 60,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      );
    }
  }
  
  // =============================================================================
  // BOT PROTECTION
  // =============================================================================
  
  // Basic bot protection for API routes
  if (pathname.startsWith('/api/') && method === 'POST') {
    // Check for suspicious user agents
    const suspiciousPatterns = [
      /curl/i,
      /wget/i,
      /python/i,
      /bot/i,
      /crawler/i,
      /spider/i,
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspicious && stage === 'prod') {
      console.warn(`Suspicious user agent blocked for ${pathname}`, {
        ip,
        userAgent,
        pathname,
      });
      
      return new NextResponse(
        JSON.stringify({
          error: true,
          message: 'Access denied',
          code: 'BOT_PROTECTION',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries()),
          },
        }
      );
    }
  }
  
  // =============================================================================
  // REQUEST LOGGING
  // =============================================================================
  
  // Log API requests for monitoring
  if (pathname.startsWith('/api/')) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message: 'API request',
      method,
      pathname,
      ip,
      userAgent: userAgent.substring(0, 200),
      stage,
    }));
  }
  
  // =============================================================================
  // HTTPS REDIRECT
  // =============================================================================
  
  // Redirect HTTP to HTTPS in production (only when behind a proxy)
  if (stage === 'prod' && request.headers.get('x-forwarded-proto') === 'http') {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    
    return NextResponse.redirect(httpsUrl, 301);
  }
  
  // =============================================================================
  // DEVELOPMENT MODE BYPASS
  // =============================================================================
  
  // In development, bypass some security checks for easier testing
  if (stage === 'dev') {
    console.log(`[DEV] Middleware processed: ${method} ${pathname}`);
  }
  
  return response;
}

// =============================================================================
// MIDDLEWARE CONFIGURATION
// =============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};