import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Health function called', JSON.stringify(event, null, 2));
  
  try {
    const timestamp = new Date().toISOString();
    
    // Return health status
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        status: 'healthy',
        timestamp,
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'production',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
          lambda: 'operational',
          dynamodb: 'operational',
          api_gateway: 'operational'
        }
      })
    };
    
  } catch (error) {
    console.error('Health function error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Internal server error'
      })
    };
  }
};