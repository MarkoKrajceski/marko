import type { APIGatewayProxyHandler } from 'aws-lambda';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

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

// Email sending functionality
async function sendNotificationEmail(leadData: { name: string; email: string; message: string }) {
  const sesClient = new SESClient({ region: process.env.AWS_REGION || 'eu-south-1' });
  
  // Your email address (you'll need to verify this in SES)
  const fromEmail = process.env.NOTIFICATION_EMAIL || 'your-email@example.com';
  const toEmail = process.env.NOTIFICATION_EMAIL || 'your-email@example.com';
  
  const emailParams = {
    Source: fromEmail,
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Subject: {
        Data: `New Contact Form Submission from ${leadData.name}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <html>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                    New Contact Form Submission
                  </h2>
                  
                  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #374151;">Contact Details</h3>
                    <p><strong>Name:</strong> ${leadData.name}</p>
                    <p><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
                  </div>
                  
                  <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h3 style="margin-top: 0; color: #374151;">Message</h3>
                    <p style="white-space: pre-wrap;">${leadData.message}</p>
                  </div>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                    <p>This email was sent automatically from your personal website contact form.</p>
                    <p>Timestamp: ${new Date().toISOString()}</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
        Text: {
          Data: `
New Contact Form Submission

Name: ${leadData.name}
Email: ${leadData.email}

Message:
${leadData.message}

---
Timestamp: ${new Date().toISOString()}
This email was sent automatically from your personal website contact form.
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(emailParams);
    const result = await sesClient.send(command);
    console.log('Email sent successfully:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Lead function called', JSON.stringify(event, null, 2));
  
  try {
    // Handle both API Gateway and Lambda Function URL events
    const httpMethod = event.httpMethod || (event.requestContext as any)?.http?.method;
    
    // Validate HTTP method
    if (httpMethod !== 'POST') {
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
    
    // Send notification email
    const emailResult = await sendNotificationEmail({ name, email, message });
    if (!emailResult.success) {
      console.warn('Failed to send notification email:', emailResult.error);
      // Don't fail the request if email fails - the lead is still captured
    } else {
      console.log('Notification email sent successfully:', emailResult.messageId);
    }
    
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
        ok: true,
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