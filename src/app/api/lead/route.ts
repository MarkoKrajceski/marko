import { NextRequest, NextResponse } from 'next/server';
import { LeadRequest, LeadResponse, ErrorResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: LeadRequest = await request.json();

    // Validate input
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push('Valid email address is required');
    }

    if (!body.message || body.message.trim().length < 10) {
      errors.push('Message must be at least 10 characters long');
    }

    if (body.message && body.message.trim().length > 1000) {
      errors.push('Message must be less than 1000 characters');
    }

    if (errors.length > 0) {
      const errorResponse: ErrorResponse = {
        error: true,
        message: errors.join(', '),
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Call the actual Lambda function
    const lambdaUrl = process.env.LEAD_LAMBDA_URL;
    if (!lambdaUrl) {
      console.error('LEAD_LAMBDA_URL environment variable not set');
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Service temporarily unavailable',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Sanitize input data
    const sanitizedBody: LeadRequest = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      message: body.message.trim(),
    };

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'NextJS-App',
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || 
                           request.headers.get('x-real-ip') || 
                           'unknown',
      },
      body: JSON.stringify(sanitizedBody),
    });

    if (!lambdaResponse.ok) {
      const errorText = await lambdaResponse.text();
      console.error('Lambda function error:', errorText);
      
      const errorResponse: ErrorResponse = {
        error: true,
        message: 'Failed to send message. Please try again.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const leadResponse: LeadResponse = await lambdaResponse.json();
    
    // Return successful response
    return NextResponse.json(leadResponse, { 
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