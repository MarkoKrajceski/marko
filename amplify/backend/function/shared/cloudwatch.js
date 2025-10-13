/**
 * CloudWatch Logging and Metrics Utilities for Lambda Functions
 * 
 * This module provides structured logging and custom metrics for AWS Lambda functions
 * with correlation IDs, performance tracking, and error monitoring.
 */

const AWS = require('aws-sdk');

// Initialize CloudWatch client
const cloudWatch = new AWS.CloudWatch();

// =============================================================================
// CORRELATION ID MANAGEMENT
// =============================================================================

/**
 * Generate a unique correlation ID for request tracking
 * @returns {string} Correlation ID
 */
function generateCorrelationId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract correlation ID from event or generate new one
 * @param {Object} event - Lambda event object
 * @returns {string} Correlation ID
 */
function getCorrelationId(event) {
  // Try to get correlation ID from headers
  if (event.headers && event.headers['x-correlation-id']) {
    return event.headers['x-correlation-id'];
  }
  
  // Try to get from query parameters
  if (event.queryStringParameters && event.queryStringParameters.correlationId) {
    return event.queryStringParameters.correlationId;
  }
  
  // Generate new correlation ID
  return generateCorrelationId();
}

// =============================================================================
// STRUCTURED LOGGING
// =============================================================================

/**
 * Create structured log entry
 * @param {string} level - Log level (INFO, WARN, ERROR)
 * @param {string} message - Log message
 * @param {Object} metadata - Additional metadata
 * @param {string} correlationId - Request correlation ID
 * @returns {Object} Structured log entry
 */
function createLogEntry(level, message, metadata = {}, correlationId = null) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    correlationId,
    functionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    functionVersion: process.env.AWS_LAMBDA_FUNCTION_VERSION,
    stage: process.env.STAGE || 'dev',
    ...metadata
  };
}

/**
 * Log info message with structured format
 */
function logInfo(message, metadata = {}, correlationId = null) {
  const logEntry = createLogEntry('INFO', message, metadata, correlationId);
  console.log(JSON.stringify(logEntry));
}

/**
 * Log warning message with structured format
 */
function logWarn(message, metadata = {}, correlationId = null) {
  const logEntry = createLogEntry('WARN', message, metadata, correlationId);
  console.warn(JSON.stringify(logEntry));
}

/**
 * Log error message with structured format
 */
function logError(message, error = null, metadata = {}, correlationId = null) {
  const errorMetadata = error ? {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  } : {};
  
  const logEntry = createLogEntry('ERROR', message, { ...metadata, ...errorMetadata }, correlationId);
  console.error(JSON.stringify(logEntry));
}//
 =============================================================================
// CUSTOM METRICS
// =============================================================================

/**
 * Put custom metric to CloudWatch
 * @param {string} metricName - Name of the metric
 * @param {number} value - Metric value
 * @param {string} unit - Metric unit (Count, Milliseconds, etc.)
 * @param {Object} dimensions - Metric dimensions
 * @param {string} namespace - CloudWatch namespace
 */
async function putMetric(metricName, value, unit = 'Count', dimensions = {}, namespace = 'PersonalSite') {
  try {
    const params = {
      Namespace: namespace,
      MetricData: [
        {
          MetricName: metricName,
          Value: value,
          Unit: unit,
          Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({ Name, Value })),
          Timestamp: new Date()
        }
      ]
    };

    await cloudWatch.putMetricData(params).promise();
  } catch (error) {
    logError('Failed to put CloudWatch metric', error, { metricName, value, unit });
  }
}

/**
 * Track request count metric
 * @param {string} endpoint - API endpoint name
 * @param {string} method - HTTP method
 * @param {string} stage - Environment stage
 */
async function trackRequestCount(endpoint, method, stage) {
  await putMetric('RequestCount', 1, 'Count', {
    Endpoint: endpoint,
    Method: method,
    Stage: stage
  });
}

/**
 * Track request latency metric
 * @param {string} endpoint - API endpoint name
 * @param {number} latency - Request latency in milliseconds
 * @param {string} stage - Environment stage
 */
async function trackLatency(endpoint, latency, stage) {
  await putMetric('RequestLatency', latency, 'Milliseconds', {
    Endpoint: endpoint,
    Stage: stage
  });
}

/**
 * Track error count metric
 * @param {string} endpoint - API endpoint name
 * @param {string} errorType - Type of error
 * @param {string} stage - Environment stage
 */
async function trackError(endpoint, errorType, stage) {
  await putMetric('ErrorCount', 1, 'Count', {
    Endpoint: endpoint,
    ErrorType: errorType,
    Stage: stage
  });
}

/**
 * Track rate limit hits
 * @param {string} endpoint - API endpoint name
 * @param {string} stage - Environment stage
 */
async function trackRateLimit(endpoint, stage) {
  await putMetric('RateLimitHits', 1, 'Count', {
    Endpoint: endpoint,
    Stage: stage
  });
}

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

/**
 * Performance monitor class for tracking request performance
 */
class PerformanceMonitor {
  constructor(endpoint, correlationId) {
    this.endpoint = endpoint;
    this.correlationId = correlationId;
    this.startTime = Date.now();
    this.stage = process.env.STAGE || 'dev';
  }

  /**
   * Mark the end of request processing and emit metrics
   * @param {boolean} success - Whether the request was successful
   * @param {string} errorType - Type of error if unsuccessful
   */
  async finish(success = true, errorType = null) {
    const endTime = Date.now();
    const latency = endTime - this.startTime;

    // Log performance info
    logInfo('Request completed', {
      endpoint: this.endpoint,
      latency,
      success,
      errorType
    }, this.correlationId);

    // Track metrics
    await Promise.all([
      trackRequestCount(this.endpoint, 'POST', this.stage),
      trackLatency(this.endpoint, latency, this.stage),
      ...(success ? [] : [trackError(this.endpoint, errorType || 'Unknown', this.stage)])
    ]);
  }
}

// =============================================================================
// LAMBDA WRAPPER WITH MONITORING
// =============================================================================

/**
 * Wrap Lambda handler with monitoring and structured logging
 * @param {Function} handler - Original Lambda handler function
 * @param {string} endpoint - Endpoint name for metrics
 * @returns {Function} Wrapped handler with monitoring
 */
function withMonitoring(handler, endpoint) {
  return async (event, context) => {
    const correlationId = getCorrelationId(event);
    const monitor = new PerformanceMonitor(endpoint, correlationId);

    // Log request start
    logInfo('Request started', {
      endpoint,
      httpMethod: event.httpMethod,
      path: event.path,
      userAgent: event.headers ? event.headers['User-Agent'] : null,
      sourceIp: event.requestContext ? event.requestContext.identity.sourceIp : null
    }, correlationId);

    try {
      // Execute the original handler
      const result = await handler(event, context, correlationId);
      
      // Log successful completion
      await monitor.finish(true);
      
      return result;
    } catch (error) {
      // Log error and track metrics
      logError('Request failed', error, { endpoint }, correlationId);
      await monitor.finish(false, error.name);
      
      // Re-throw the error
      throw error;
    }
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  // Correlation ID management
  generateCorrelationId,
  getCorrelationId,
  
  // Structured logging
  logInfo,
  logWarn,
  logError,
  createLogEntry,
  
  // Custom metrics
  putMetric,
  trackRequestCount,
  trackLatency,
  trackError,
  trackRateLimit,
  
  // Performance monitoring
  PerformanceMonitor,
  withMonitoring
};