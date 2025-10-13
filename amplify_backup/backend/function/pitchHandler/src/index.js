const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');
const { marshall } = require('@aws-sdk/util-dynamodb');
const crypto = require('crypto');

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const cloudWatchClient = new CloudWatchClient({ region: process.env.AWS_REGION });

// Environment variables
const TABLE_NAME = process.env.STORAGE_PERSONALSITEDATA_NAME;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '10');
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60');

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map();

// Pitch generation templates
const PITCH_TEMPLATES = {
  recruiter: {
    ai: {
      pitch: "I'm a full-stack developer with deep expertise in applied AI and machine learning. I've built production ML pipelines, implemented LLM integrations, and automated complex workflows. I focus on practical AI solutions that deliver real business value, not just proof-of-concepts. My experience spans from data engineering to model deployment, with a strong emphasis on scalable, maintainable systems.",
      confidence: 0.95
    },
    cloud: {
      pitch: "I'm a cloud-native developer specializing in AWS serverless architectures. I design and build scalable, cost-effective solutions using Lambda, API Gateway, DynamoDB, and modern CI/CD practices. My approach emphasizes infrastructure as code, observability, and security best practices. I've helped teams migrate to cloud-first architectures and reduce operational overhead significantly.",
      confidence: 0.98
    },
    automation: {
      pitch: "I'm passionate about eliminating manual processes through intelligent automation. I build robust CI/CD pipelines, infrastructure automation, and workflow orchestration systems. My expertise includes GitHub Actions, AWS automation, monitoring systems, and creating developer-friendly tooling. I believe in shipping fast while maintaining high quality through automated testing and deployment.",
      confidence: 0.92
    }
  },
  cto: {
    ai: {
      pitch: "I architect and implement AI-driven solutions with a focus on production readiness and scalability. My experience includes building ML infrastructure, implementing vector databases, fine-tuning models, and creating AI-powered features that scale to millions of users. I understand both the technical complexity and business implications of AI integration, ensuring solutions are robust, ethical, and maintainable.",
      confidence: 0.88
    },
    cloud: {
      pitch: "I design cloud-native architectures that scale efficiently and cost-effectively. My expertise spans microservices, serverless computing, container orchestration, and multi-region deployments. I've led cloud migrations, implemented disaster recovery strategies, and built systems that handle massive scale while maintaining 99.9% uptime. I focus on architectural decisions that support long-term growth and team productivity.",
      confidence: 0.95
    },
    automation: {
      pitch: "I build automation systems that transform how engineering teams operate. From infrastructure provisioning to deployment pipelines, I create solutions that reduce manual work, improve reliability, and accelerate development cycles. My approach includes comprehensive monitoring, automated testing, and self-healing systems. I've helped teams achieve 10x faster deployment cycles while improving system reliability.",
      confidence: 0.90
    }
  },
  product: {
    ai: {
      pitch: "I translate AI capabilities into user-facing features that deliver real value. I understand how to integrate AI seamlessly into product experiences, from recommendation systems to intelligent automation. My focus is on creating AI features that feel natural and helpful, not gimmicky. I work closely with product teams to identify high-impact AI opportunities and implement them with proper user feedback loops.",
      confidence: 0.85
    },
    cloud: {
      pitch: "I build cloud infrastructure that enables rapid product iteration and global scale. My solutions support A/B testing, feature flags, real-time analytics, and seamless deployments. I understand the product implications of technical decisions and design systems that support experimentation and growth. My cloud architectures enable teams to ship features faster while maintaining reliability.",
      confidence: 0.88
    },
    automation: {
      pitch: "I create automation that accelerates product development and improves user experiences. From automated testing to deployment pipelines, I build systems that let product teams focus on features, not infrastructure. My automation solutions include user analytics, performance monitoring, and automated quality assurance. I help product teams ship with confidence and iterate quickly.",
      confidence: 0.87
    }
  },
  founder: {
    ai: {
      pitch: "I help startups leverage AI to create competitive advantages and unlock new business models. I understand both the technical implementation and business strategy of AI integration. My experience includes building AI-powered products from scratch, implementing cost-effective ML solutions, and creating AI features that drive user engagement and revenue. I focus on practical AI that solves real problems and scales with your business.",
      confidence: 0.90
    },
    cloud: {
      pitch: "I build cloud-first solutions that scale with your startup's growth while optimizing costs. My serverless-first approach means you pay only for what you use and can handle viral growth without infrastructure headaches. I've helped startups achieve 99.9% uptime, implement global CDNs, and build systems that support millions of users. My solutions are designed to grow from MVP to enterprise scale.",
      confidence: 0.93
    },
    automation: {
      pitch: "I create automation systems that let small teams punch above their weight. From automated deployments to intelligent monitoring, I build solutions that reduce operational overhead and prevent costly outages. My automation expertise helps startups move fast without breaking things, implement proper DevOps practices from day one, and scale engineering productivity as the team grows.",
      confidence: 0.89
    }
  }
};

/**
 * Hash IP address and User Agent for privacy
 */
function hashString(str) {
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Generate request ID
 */
function generateRequestId() {
  return crypto.randomUUID();
}

/**
 * Check rate limiting
 */
function checkRateLimit(ipHash) {
  const now = Date.now();
  const windowStart = now - (RATE_LIMIT_WINDOW * 1000);
  
  // Clean old entries
  for (const [key, timestamps] of rateLimitStore.entries()) {
    const validTimestamps = timestamps.filter(ts => ts > windowStart);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, validTimestamps);
    }
  }
  
  // Check current IP
  const ipTimestamps = rateLimitStore.get(ipHash) || [];
  const recentRequests = ipTimestamps.filter(ts => ts > windowStart);
  
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  // Add current request
  recentRequests.push(now);
  rateLimitStore.set(ipHash, recentRequests);
  
  return true;
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
  
  const validRoles = ['recruiter', 'cto', 'product', 'founder'];
  const validFocuses = ['ai', 'cloud', 'automation'];
  
  if (!data.role || !validRoles.includes(data.role)) {
    errors.push({ 
      field: 'role', 
      message: `Role must be one of: ${validRoles.join(', ')}`, 
      code: 'INVALID_ROLE' 
    });
  }
  
  if (!data.focus || !validFocuses.includes(data.focus)) {
    errors.push({ 
      field: 'focus', 
      message: `Focus must be one of: ${validFocuses.join(', ')}`, 
      code: 'INVALID_FOCUS' 
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : null
  };
}

/**
 * Generate pitch based on role and focus
 */
function generatePitch(role, focus) {
  const template = PITCH_TEMPLATES[role]?.[focus];
  if (!template) {
    throw new Error(`No template found for role: ${role}, focus: ${focus}`);
  }
  
  return {
    pitch: template.pitch,
    confidence: template.confidence
  };
}

/**
 * Log analytics to DynamoDB
 */
async function logAnalytics(requestId, role, focus, ipHash, userAgentHash, confidence) {
  const timestamp = new Date().toISOString();
  const ttl = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  
  const item = {
    pk: `pitch#${requestId}`,
    sk: `time#${timestamp}`,
    role,
    focus,
    ipHash,
    userAgentHash,
    timestamp,
    confidence,
    ttl
  };
  
  try {
    await dynamoClient.send({
      TableName: TABLE_NAME,
      Item: marshall(item)
    });
  } catch (error) {
    console.error('Failed to log analytics:', error);
    // Don't fail the request if analytics logging fails
  }
}

/**
 * Emit CloudWatch metrics
 */
async function emitMetrics(requestId, startTime, statusCode) {
  const duration = Date.now() - startTime;
  
  const params = {
    Namespace: 'PersonalSite/API',
    MetricData: [
      {
        MetricName: 'PitchRequests',
        Value: 1,
        Unit: 'Count',
        Dimensions: [
          {
            Name: 'StatusCode',
            Value: statusCode.toString()
          }
        ]
      },
      {
        MetricName: 'PitchLatency',
        Value: duration,
        Unit: 'Milliseconds'
      }
    ]
  };
  
  try {
    await cloudWatchClient.send(new PutMetricDataCommand(params));
  } catch (error) {
    console.error('Failed to emit metrics:', error);
    // Don't fail the request if metrics emission fails
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
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  console.log('Pitch generation request:', {
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
      await emitMetrics(requestId, startTime, 405);
      return createResponse(405, {
        error: true,
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    // Get client info for rate limiting
    const clientIp = event.requestContext?.identity?.sourceIp || 'unknown';
    const userAgent = event.headers?.['User-Agent'] || 'unknown';
    const ipHash = hashString(clientIp);
    const userAgentHash = hashString(userAgent);
    
    // Check rate limiting
    if (!checkRateLimit(ipHash)) {
      await emitMetrics(requestId, startTime, 429);
      return createResponse(429, {
        error: true,
        message: 'Rate limit exceeded. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
    
    // Validate input
    const validation = validateInput(event.body);
    if (!validation.isValid) {
      await emitMetrics(requestId, startTime, 400);
      return createResponse(400, {
        error: true,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        requestId,
        details: validation.errors
      });
    }
    
    const { role, focus } = validation.data;
    
    // Generate pitch
    const { pitch, confidence } = generatePitch(role, focus);
    
    // Log analytics (async, don't wait)
    logAnalytics(requestId, role, focus, ipHash, userAgentHash, confidence);
    
    // Prepare response
    const response = {
      pitch,
      confidence,
      timestamp: new Date().toISOString(),
      requestId
    };
    
    // Emit metrics (async, don't wait)
    emitMetrics(requestId, startTime, 200);
    
    console.log('Pitch generated successfully:', {
      requestId,
      role,
      focus,
      confidence,
      duration: Date.now() - startTime
    });
    
    return createResponse(200, response);
    
  } catch (error) {
    console.error('Error processing pitch request:', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    
    await emitMetrics(requestId, startTime, 500);
    
    return createResponse(500, {
      error: true,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId
    });
  }
};