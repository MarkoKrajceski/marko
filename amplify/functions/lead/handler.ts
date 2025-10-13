import type { APIGatewayProxyHandler } from 'aws-lambda';

// Security utilities (ported from shared/security.js)
function sanitizeString(input: any, maxLength: number = 1000): string {
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

function sanitizeEmail(email: any): string | null {
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

function validateRequestSize(body: string | null, maxSize: number = 10240): boolean {
  if (!body) return true;
  
  const size = Buffer.byteLength(body, 'utf8');
  return size <= maxSize;
}

function checkForAttackPatterns(data: any): { isSafe: boolean; threats: string[] } {
  const threats: string[] = [];
  const dataString = JSON.stringify(data).toLowerCase();
  
  // SQL injection patterns
  const sqlPatterns = [
    'union select', 'drop table', 'insert into', 'delete from', 'update set',
    '1=1', 'or 1=1', 'and 1=1'
  ];
  
  // XSS patterns
  const xssPatterns = [
    '<script', 'javascript:', 'onerror=', 'onload=', 'onclick=', 'eval(', 'alert('
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

function validateLeadRequest(data: any): { isValid: boolean; sanitized: any; errors: string[] } {
  const errors: string[] = [];
  const sanitized: any = {};
  
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

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Lead function called', JSON.stringify(event, null, 2));
  
  try {
    // Validate HTTP method
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          error: true,
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Validate request size (DoS protection)
    if (!validateRequestSize(event.body)) {
      return {
        statusCode: 413,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          error: true,
          message: 'Request too large',
          code: 'REQUEST_TOO_LARGE',
          timestamp: new Date().toISOString()
        })
      };
    }

    const body = event.body ? JSON.parse(event.body) : {};
    
    // Check for attack patterns
    const securityCheck = checkForAttackPatterns(body);
    if (!securityCheck.isSafe) {
      console.warn('Security threat detected:', securityCheck.threats);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          error: true,
          message: 'Invalid request content',
          code: 'SECURITY_VIOLATION',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate and sanitize request
    const validation = validateLeadRequest(body);
    if (!validation.isValid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        body: JSON.stringify({
          error: true,
          message: validation.errors.join(', '),
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        })
      };
    }

    const { name, email, message } = validation.sanitized;
    
    // Log sanitized data (truncated for security)
    console.log('Lead captured:', { 
      name, 
      email, 
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      timestamp: new Date().toISOString()
    });
    
    // TODO: Save to DynamoDB (will be added in Batch 3)
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your message! I\'ll get back to you soon.',
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Lead function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({
        error: true,
        message: 'Failed to submit message. Please try again.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      })
    };
  }
};