import { NextRequest, NextResponse } from 'next/server';
import { PitchRequest, PitchResponse, ErrorResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: PitchRequest = await request.json();

    // Validate input
    if (!body.role || !body.focus) {
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Role and focus are required',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate role and focus values
    const validRoles = ['recruiter', 'cto', 'product', 'founder'];
    const validFocuses = ['ai', 'cloud', 'automation'];

    if (!validRoles.includes(body.role)) {
      const errorResponse: ErrorResponse = {
        error: true,
        message: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!validFocuses.includes(body.focus)) {
      const errorResponse: ErrorResponse = {
        error: true,
        message: `Invalid focus. Must be one of: ${validFocuses.join(', ')}`,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Call the actual Lambda function
    const lambdaUrl = process.env.PITCH_LAMBDA_URL;
    
    if (!lambdaUrl) {
      console.error('PITCH_LAMBDA_URL environment variable not set');
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Service temporarily unavailable',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'NextJS-App',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown',
      },
      body: JSON.stringify(body),
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      console.error('Lambda function error:', errorText);
      
      // Handle rate limiting
      if (lambdaResponse.status === 429) {
        const errorResponse: ErrorResponse = {
          error: true,
          message: 'Too many requests. Please try again in a minute.',
          code: 'RATE_LIMIT_EXCEEDED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 429 });
      }

      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Failed to generate pitch. Please try again.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const pitchResponse: PitchResponse = await lambdaResponse.json();
    
    // Return successful response
    return NextResponse.json(pitchResponse, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    
    const errorResponse: ErrorResponse = {
      error: true,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Handle unsupported methods
export async function GET() {
  const errorResponse: ErrorResponse = {
    error: true,
    message: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED',
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(errorResponse, { status: 405 });
}