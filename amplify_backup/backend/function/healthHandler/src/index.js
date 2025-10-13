const { DynamoDBClient, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// Environment variables
const TABLE_NAME = process.env.STORAGE_PERSONALSITEDATA_NAME;
const VERSION = process.env.VERSION || '1.0.0';
const ENV = process.env.ENV || 'dev';

// Track Lambda start time for uptime calculation
const LAMBDA_START_TIME = Date.now();

/**
 * Check DynamoDB table health
 */
async function checkDynamoDBHealth() {
  try {
    const command = new DescribeTableCommand({
      TableName: TABLE_NAME
    });
    
    const response = await dynamoClient.send(command);
    
    return {
      status: 'healthy',
      tableName: TABLE_NAME,
      tableStatus: response.Table.TableStatus,
      itemCount: response.Table.ItemCount || 0,
      responseTime: Date.now()
    };
  } catch (error) {
    console.error('DynamoDB health check failed:', error);
    return {
      status: 'unhealthy',
      tableName: TABLE_NAME,
      error: error.message,
      responseTime: Date.now()
    };
  }
}

/**
 * Check memory usage
 */
function getMemoryUsage() {
  const memoryUsage = process.memoryUsage();
  const memoryLimitMB = parseInt(process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE || '128');
  
  return {
    used: Math.round(memoryUsage.rss / 1024 / 1024), // MB
    limit: memoryLimitMB,
    percentage: Math.round((memoryUsage.rss / 1024 / 1024 / memoryLimitMB) * 100)
  };
}

/**
 * Get system uptime
 */
function getUptime() {
  const uptimeMs = Date.now() - LAMBDA_START_TIME;
  return {
    milliseconds: uptimeMs,
    seconds: Math.floor(uptimeMs / 1000),
    minutes: Math.floor(uptimeMs / 1000 / 60),
    hours: Math.floor(uptimeMs / 1000 / 60 / 60)
  };
}

/**
 * Perform comprehensive health checks
 */
async function performHealthChecks() {
  const startTime = Date.now();
  
  // Basic system info
  const systemInfo = {
    timestamp: new Date().toISOString(),
    environment: ENV,
    version: VERSION,
    region: process.env.AWS_REGION,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    runtime: process.version,
    architecture: process.arch,
    platform: process.platform
  };
  
  // Memory usage
  const memory = getMemoryUsage();
  
  // Uptime
  const uptime = getUptime();
  
  // DynamoDB health check
  const dynamoHealth = await checkDynamoDBHealth();
  
  // Overall health status
  const isHealthy = dynamoHealth.status === 'healthy' && memory.percentage < 90;
  
  const healthData = {
    ok: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    env: ENV,
    version: VERSION,
    uptime: uptime.seconds,
    checks: {
      database: dynamoHealth,
      memory: memory,
      system: systemInfo
    },
    responseTime: Date.now() - startTime
  };
  
  return healthData;
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
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...headers
    },
    body: JSON.stringify(body, null, 2)
  };
}

/**
 * Main Lambda handler
 */
exports.handler = async (event, context) => {
  const requestId = context.awsRequestId;
  
  console.log('Health check request:', {
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
    
    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
      return createResponse(405, {
        error: true,
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    // Perform health checks
    const healthData = await performHealthChecks();
    
    // Add request context
    healthData.requestId = requestId;
    healthData.requestTimestamp = new Date().toISOString();
    
    // Determine response status code based on health
    const statusCode = healthData.ok ? 200 : 503;
    
    console.log('Health check completed:', {
      requestId,
      status: healthData.status,
      responseTime: healthData.responseTime,
      timestamp: new Date().toISOString()
    });
    
    return createResponse(statusCode, healthData);
    
  } catch (error) {
    console.error('Error during health check:', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    const errorResponse = {
      ok: false,
      status: 'error',
      error: true,
      message: 'Health check failed',
      code: 'HEALTH_CHECK_ERROR',
      timestamp: new Date().toISOString(),
      requestId,
      env: ENV,
      version: VERSION,
      uptime: getUptime().seconds
    };
    
    return createResponse(500, errorResponse);
  }
};