import type { APIGatewayProxyHandler } from 'aws-lambda';

// Health check utilities
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
  };
}

function getSystemInfo() {
  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: Math.round(process.uptime()),
    pid: process.pid,
  };
}

async function checkServiceHealth() {
  const services = {
    lambda: 'operational',
    api_gateway: 'operational',
    dynamodb: 'unknown', // Will be updated when we add DynamoDB
    cloudwatch: 'operational',
  };

  // TODO: Add actual service health checks in Batch 6
  // For now, assume all services are operational
  
  return services;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Health function called', JSON.stringify(event, null, 2));
  
  try {
    // Support both GET and POST for health checks
    if (!['GET', 'POST'].includes(event.httpMethod)) {
      const errorHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      return {
        statusCode: 405,
        headers: errorHeaders,
        body: JSON.stringify({
          error: true,
          message: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
          timestamp: new Date().toISOString()
        })
      };
    }

    const timestamp = new Date().toISOString();
    const memory = getMemoryUsage();
    const system = getSystemInfo();
    const services = await checkServiceHealth();
    
    // Determine overall health status
    const allServicesHealthy = Object.values(services).every(status => 
      status === 'operational' || status === 'unknown'
    );
    
    const overallStatus = allServicesHealthy ? 'healthy' : 'degraded';
    const statusCode = allServicesHealthy ? 200 : 503;
    
    // Build comprehensive health response
    const healthData = {
      status: overallStatus,
      timestamp,
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      stage: process.env.STAGE || 'unknown',
      region: process.env.AWS_REGION || 'unknown',
      system,
      memory,
      services,
      checks: {
        memory_usage_ok: memory.heapUsed < 100, // Less than 100MB
        uptime_ok: system.uptime > 0,
        services_ok: allServicesHealthy,
      },
      metadata: {
        function_name: process.env.AWS_LAMBDA_FUNCTION_NAME || 'healthHandler',
        function_version: process.env.AWS_LAMBDA_FUNCTION_VERSION || '$LATEST',
        request_id: event.requestContext?.requestId || 'unknown',
      }
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    return {
      statusCode,
      headers,
      body: JSON.stringify(healthData, null, 2)
    };
    
  } catch (error) {
    console.error('Health function error:', error);
    
    const errorHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    return {
      statusCode: 500,
      headers: errorHeaders,
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error',
        message: 'Health check failed due to internal error',
        code: 'HEALTH_CHECK_FAILED'
      })
    };
  }
};