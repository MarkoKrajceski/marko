import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Lead function called', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { name, email, message } = body;
    
    // Validate input
    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          error: true,
          message: 'Name, email, and message are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          error: true,
          message: 'Please provide a valid email address',
          code: 'INVALID_EMAIL',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Validate message length
    if (message.length < 10) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
          error: true,
          message: 'Message must be at least 10 characters long',
          code: 'MESSAGE_TOO_SHORT',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // In a real implementation, you would save this to DynamoDB
    // For now, we'll just log it and return success
    console.log('Lead captured:', { name, email, message: message.substring(0, 100) + '...' });
    
    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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