const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const crypto = require('crypto');

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// Environment variables
const TABLE_NAME = process.env.STORAGE_PERSONALSITEDATA_NAME;

/**
 * Generate request ID
 */
function generateRequestId() {
  return crypto.randomUUID();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate request input
 */
function validateInput(body) {
  const errors = [];
  
  if (!body) {
    errors.push({ field: 'body', message: 'Request body is required', code: 'MISSING_BODY' });
    return { isValid: false, errors };
  }
  
  let data;
  try {
    data = typeof body === 'string' ? JSON.parse(body) : body;
  } catch (e) {
    errors.push({ field: 'body', message: 'Invalid JSON format', code: 'INVALID_JSON' });
    return { isValid: false, errors };
  }
  
  // Validate name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ 
      field: 'name', 
      message: 'Name is required and must be a non-empty string', 
      code: 'INVALID_NAME' 
    });
  } else if (data.name.trim().length > 100) {
    errors.push({ 
      field: 'name', 
      message: 'Name must be 100 characters or less', 
      code: 'NAME_TOO_LONG' 
    });
  }
  
  // Validate email
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push({ 
      field: 'email', 
      message: 'Email is required and must be a non-empty string', 
      code: 'INVALID_EMAIL' 
    });
  } else if (!isValidEmail(data.email.trim())) {
    errors.push({ 
      field: 'email', 
      message: 'Email must be a valid email address', 
      code: 'INVALID_EMAIL_FORMAT' 
    });
  } else if (data.email.trim().length > 254) {
    errors.push({ 
      field: 'email', 
      message: 'Email must be 254 characters or less', 
      code: 'EMAIL_TOO_LONG' 
    });
  }
  
  // Validate message
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push({ 
      field: 'message', 
      message: 'Message is required and must be a non-empty string', 
      code: 'INVALID_MESSAGE' 
    });
  } else if (data.message.trim().length > 2000) {
    errors.push({ 
      field: 'message', 
      message: 'Message must be 2000 characters or less', 
      code: 'MESSAGE_TOO_LONG' 
    });
  }
  
  // Clean and prepare data if valid
  const cleanData = errors.length === 0 ? {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    message: data.message.trim()
  } : null;
  
  return {
    isValid: errors.length === 0,
    errors,
    data: cleanData
  };
}

/**
 * Store lead data to DynamoDB
 */
async function storeLead(name, email, message) {
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60); // 30 days
  
  const item = {
    pk: `lead#${email}`,
    sk: `time#${timestamp}`,
    name,
    email,
    message,
    timestamp,
    source: 'contact-form',
    ttl
  };
  
  try {
    await dynamoClient.send({
      TableName: TABLE_NAME,
      Item: marshall(item)
    });
    
    console.log('Lead stored successfully:', {
      email,
      timestamp,
      source: 'contact-form'
    });
    
    return true;
  } catch (error) {
    console.error('Failed to store lead:', {
      error: error.message,
      email,
      timestamp
    });
    throw error;
  }
}

/**
 * Create API Gateway response
 */
function createResponse(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      ...headers
    },
    body: JSON.stringify(body)
  };
}

/**
 * Main Lambda handler
 */
exports.handler = async (event, context) => {
  const requestId = generateRequestId();
  
  console.log('Lead capture request:', {
    requestId,
    method: event.httpMethod,
    path: event.path,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return createResponse(200, { message: 'OK' });
    }
    
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
      return createResponse(405, {
        error: true,
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    // Validate input
    const validation = validateInput(event.body);
    if (!validation.isValid) {
      return createResponse(400, {
        error: true,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        requestId,
        details: validation.errors
      });
    }
    
    const { name, email, message } = validation.data;
    
    // Store lead data
    await storeLead(name, email, message);
    
    // Prepare success response
    const response = {
      ok: true,
      message: 'Thank you for your message! I\'ll get back to you soon.',
      timestamp: new Date().toISOString(),
      requestId
    };
    
    console.log('Lead captured successfully:', {
      requestId,
      email,
      timestamp: new Date().toISOString()
    });
    
    return createResponse(200, response);
    
  } catch (error) {
    console.error('Error processing lead capture:', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    // Check if it's a DynamoDB error
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(409, {
        error: true,
        message: 'A submission with this email already exists',
        code: 'DUPLICATE_EMAIL',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    return createResponse(500, {
      error: true,
      message: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId
    });
  }
};