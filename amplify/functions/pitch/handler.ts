import type { APIGatewayProxyHandler } from 'aws-lambda';

// Pitch generation templates with confidence scores
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
      pitch: "I build cloud-native products that scale from startup to enterprise. My experience with modern cloud architectures ensures products can handle rapid growth while maintaining performance and cost efficiency. I focus on creating resilient, observable systems that provide excellent user experiences while being economical to operate and maintain.",
      confidence: 0.92
    },
    automation: {
      pitch: "I create products that automate complex workflows and make users more productive. My approach combines deep technical knowledge with user empathy to build automation tools that are both powerful and intuitive. I believe the best automation products are invisible - they just make everything work better without users having to think about them.",
      confidence: 0.88
    }
  },
  founder: {
    ai: {
      pitch: "As someone who understands both the technical and business sides of AI, I can help you navigate the opportunities and challenges of building an AI-driven company. My experience spans from prototype to production, and I understand how to build AI solutions that create sustainable business value while managing technical debt and scaling challenges.",
      confidence: 0.82
    },
    cloud: {
      pitch: "I bring the technical expertise to help you build a cloud-first company from the ground up. My experience with scalable architectures and cost optimization can help you avoid common pitfalls and build a technical foundation that supports rapid growth. I understand the unique challenges founders face and can help you make technical decisions that align with your business goals.",
      confidence: 0.90
    },
    automation: {
      pitch: "I'm passionate about helping founders build companies that leverage automation to create competitive advantages. My experience in building automation tools and optimizing processes can help you create a more efficient, scalable business. I understand that as a founder, your time is your most valuable resource, and I can help you build systems that multiply your impact.",
      confidence: 0.87
    }
  }
};

// Input validation
function validatePitchRequest(data: any) {
  const errors: string[] = [];
  const sanitized: any = {};
  
  const allowedRoles = ['recruiter', 'cto', 'product', 'founder'];
  if (!data.role || !allowedRoles.includes(data.role)) {
    errors.push('Role must be one of: ' + allowedRoles.join(', '));
  } else {
    sanitized.role = data.role;
  }
  
  const allowedFocus = ['ai', 'cloud', 'automation'];
  if (!data.focus || !allowedFocus.includes(data.focus)) {
    errors.push('Focus must be one of: ' + allowedFocus.join(', '));
  } else {
    sanitized.focus = data.focus;
  }
  
  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Pitch function called', JSON.stringify(event, null, 2));
  
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

    const body = event.body ? JSON.parse(event.body) : {};
    
    // Validate request
    const validation = validatePitchRequest(body);
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

    const { role, focus } = validation.sanitized;
    
    // Get pitch template
    const template = PITCH_TEMPLATES[role as keyof typeof PITCH_TEMPLATES]?.[focus as keyof typeof PITCH_TEMPLATES.recruiter];
    
    if (!template) {
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
          message: 'Invalid role or focus combination',
          code: 'INVALID_COMBINATION',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Return successful response
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
        pitch: template.pitch,
        confidence: template.confidence,
        role,
        focus,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Pitch function error:', error);
    
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
        message: 'Failed to generate pitch. Please try again.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      })
    };
  }
};