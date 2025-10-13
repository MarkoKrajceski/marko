import { NextRequest, NextResponse } from 'next/server';
import { HealthResponse, ErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // Call the actual Lambda health endpoint
    const lambdaUrl = process.env.HEALTH_LAMBDA_URL;
    
    if (!lambdaUrl) {
      // Return basic health check if Lambda URL not configured
      const healthResponse: HealthResponse = {
        ok: true,
        env: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
      
      return NextResponse.json(healthResponse, { status: 200 });
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'NextJS-App',
      },
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      console.error('Lambda health check error:', errorText);
      
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Health check failed',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const healthResponse: HealthResponse = await lambdaResponse.json();
    
    return NextResponse.json(healthResponse, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: ErrorResponse = {
      error: true,
      message: 'Health check failed',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function POST() {
  const errorResponse: ErrorResponse = {
    error: true,
    message: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED',
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(errorResponse, { status: 405 });
}