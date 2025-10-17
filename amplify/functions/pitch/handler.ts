import type { APIGatewayProxyHandler } from 'aws-lambda';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime';

// Initialize Bedrock client
const BEDROCK_REGION = process.env.BEDROCK_REGION || 'eu-south-1';
const bedrockClient = new BedrockAgentRuntimeClient({
  region: BEDROCK_REGION
});

const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID || 'PE8ZSDZHWZ';
// Try multiple inference profiles in order of preference (Claude models only for now)
const MODELS = [
  `arn:aws:bedrock:${BEDROCK_REGION}:859472853365:inference-profile/eu.amazon.nova-lite-v1:0`,
  `arn:aws:bedrock:${BEDROCK_REGION}:859472853365:inference-profile/eu.anthropic.claude-sonnet-4-5-20250929-v1:0`, // Claude Sonnet 4.5
  `arn:aws:bedrock:${BEDROCK_REGION}:859472853365:inference-profile/eu.anthropic.claude-sonnet-4-20250514-v1:0`, // Claude Sonnet 4
  `arn:aws:bedrock:${BEDROCK_REGION}:859472853365:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0`, // Claude Haiku 4.5
];

console.log('Available models:', MODELS);

// Input validation
function validatePitchRequest(data: unknown) {
  const errors: string[] = [];
  const sanitized: { role?: string; query?: string } = {};

  // Type guard for data
  if (!data || typeof data !== 'object') {
    errors.push('Invalid request body');
    return { isValid: false, sanitized, errors };
  }

  const requestData = data as Record<string, unknown>;

  const allowedRoles = ['recruiter', 'cto', 'product', 'founder', 'other'];
  if (!requestData.role || typeof requestData.role !== 'string' || !allowedRoles.includes(requestData.role)) {
    errors.push('Role must be one of: ' + allowedRoles.join(', '));
  } else {
    sanitized.role = requestData.role;
  }

  if (!requestData.query || typeof requestData.query !== 'string' || requestData.query.trim().length === 0) {
    errors.push('Query is required and must be a non-empty string');
  } else if (requestData.query.trim().length > 1000) {
    errors.push('Query must be less than 1000 characters');
  } else {
    sanitized.query = requestData.query.trim();
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
}

// Generate AI response using Bedrock Knowledge Base
async function generateAIResponse(role: string, query: string): Promise<{ pitch: string; confidence: number }> {
  console.log(`Generating AI response for role: ${role}, query: ${query}`);
  console.log(`Using Knowledge Base ID: ${KNOWLEDGE_BASE_ID}`);

  // Check if user is asking for email drafting (which we should avoid)
  const emailRequestPatterns = [
    /^(draft|write|compose).*(email|message|outreach)/i,
    /subject line/i,
    /email template/i,
    /write.*to/i
  ];
  
  const isEmailRequest = emailRequestPatterns.some(pattern => pattern.test(query));
  
  if (isEmailRequest) {
    console.log('Detected email drafting request, providing direct response instead');
    return {
      pitch: `I don't draft emails or outreach messages. Instead, I can tell you about my technical experience and skills directly. Feel free to ask me about specific technologies, projects, or areas of expertise you're interested in.`,
      confidence: 0.8
    };
  }

  // Try each model in order
  for (let i = 0; i < MODELS.length; i++) {
    const modelArn = MODELS[i];
    console.log(`Trying model ${i + 1}/${MODELS.length}: ${modelArn}`);

    try {
      // More direct prompt that emphasizes first-person response
      const prompt = `Someone with the role of "${role}" is asking me: "${query}". I need to respond directly to them in first person about my technical experience and capabilities.`;

      console.log(`Sending prompt to Bedrock: ${prompt}`);

      const command = new RetrieveAndGenerateCommand({
        input: {
          text: prompt
        },
        retrieveAndGenerateConfiguration: {
          type: 'KNOWLEDGE_BASE',
          knowledgeBaseConfiguration: {
            knowledgeBaseId: KNOWLEDGE_BASE_ID,
            modelArn: modelArn,
            retrievalConfiguration: {
              vectorSearchConfiguration: {
                numberOfResults: 8,
                overrideSearchType: 'HYBRID'
              }
            },
            generationConfiguration: {
              promptTemplate: {
                textPromptTemplate: `You are Marko, replying directly to the person who asked the question. Use first person ("I"). Do NOT greet by name, write emails, or include placeholders like [Founder], {{name}}, or "feel free to adjust." Do NOT invent employers, titles, dates, stacks, or metrics. Use ONLY the context below. If a detail is missing, say so briefly and move on—do not speculate.

Style:
- Answer the question first, concisely (3–8 sentences).
- If you mention concrete facts (company, year, role, stack, numbers), append bracket citations like [1], [2] that correspond to the context snippets.
- No meta-language about being an AI. No sign-offs. No filler.

Context snippets (retrieved):
$search_results$

User question: $query$

Write the answer in first person as Marko.`
              }
            },
            orchestrationConfiguration: {
              promptTemplate: {
                textPromptTemplate: `Retrieve only HIGHLY RELEVANT, TECHNICAL passages that can answer the user's question about Marko's background, skills, projects, roles, dates, stacks, or measurable outcomes.

Rules:
- Prefer passages with specific nouns (project names, tech stacks, employers, dates, metrics).
- Exclude generic cover letters, motivational text, or non-technical chats.
- If multiple similar snippets exist, prefer the most recent and most specific.
- Keep results diverse (different projects/companies) and minimal (only what's needed).

Conversation so far (may be empty):
$conversation_history$

User question: $query$

$output_format_instructions$`
              }
            }
          }
        }
      });

      const response = await bedrockClient.send(command);

      console.log('Bedrock response:', JSON.stringify(response, null, 2));

      if (!response.output?.text) {
        throw new Error('No response generated from Knowledge Base');
      }

      // Check if it's the generic "unable to assist" response
      if (response.output.text.includes('unable to assist') || response.output.text.includes('cannot help')) {
        console.log('Received generic response, trying next model or falling back');
        throw new Error('Generic response received');
      }

      // Check for email-like patterns that shouldn't be there
      const emailPatterns = [
        /Hello,?\s*\[.*?\]/i,
        /Dear\s+\[.*?\]/i,
        /feel free to adjust/i,
        /\{\{.*?\}\}/,
        /\[.*?name.*?\]/i,
        /Best regards/i,
        /Sincerely/i
      ];

      let responseText = response.output.text;
      const hasEmailPatterns = emailPatterns.some(pattern => pattern.test(responseText));
      
      if (hasEmailPatterns) {
        console.log('Detected email-like patterns, cleaning response');
        // Clean up common email artifacts
        responseText = responseText
          .replace(/Hello,?\s*\[.*?\]\s*/gi, '')
          .replace(/Dear\s+\[.*?\]\s*/gi, '')
          .replace(/feel free to adjust.*$/gi, '')
          .replace(/\{\{.*?\}\}/g, '')
          .replace(/\[.*?name.*?\]/gi, '')
          .replace(/Best regards.*$/gi, '')
          .replace(/Sincerely.*$/gi, '')
          .trim();
      }

      // Check if response has citations but no concrete facts (potential hallucination indicator)
      const hasCitations = response.citations && response.citations.length > 0;
      const hasConcreteDetails = /\b(20\d{2}|years?|months?|company|project|built|developed)\b/i.test(responseText);
      
      if (!hasCitations && hasConcreteDetails) {
        console.log('Warning: Response contains specific details but no citations');
        responseText = "(Note: Some details may not be fully verified from my knowledge base.) " + responseText;
      }

      // Success! Calculate confidence and return
      const responseLength = responseText.length;
      const confidence = Math.min(0.95, Math.max(0.75, responseLength / 800));

      console.log(`Successfully generated response with model: ${modelArn}`);
      console.log(`Citations available: ${hasCitations ? 'Yes' : 'No'}`);
      
      return {
        pitch: responseText,
        confidence: Math.round(confidence * 100) / 100
      };

    } catch (error) {
      console.error(`Model ${modelArn} failed:`, error);

      // If this is the last model, fall back to custom response
      if (i === MODELS.length - 1) {
        console.log('All models failed, using fallback response');
        const fallbackResponse = generateFallbackResponse(query);
        return {
          pitch: fallbackResponse,
          confidence: 0.7
        };
      }

      // Otherwise, try the next model
      console.log('Trying next model...');
      continue;
    }
  }

  // This should never be reached, but just in case
  const fallbackResponse = generateFallbackResponse(query);
  return {
    pitch: fallbackResponse,
    confidence: 0.7
  };
}

// Generate contextual fallback responses
function generateFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  // AI/ML related
  if (lowerQuery.includes('ai') || lowerQuery.includes('machine learning') || lowerQuery.includes('ml')) {
    return "I have extensive experience in AI and machine learning, including building production ML pipelines, implementing LLM integrations, and creating AI-powered features. I've worked with various ML frameworks and have experience deploying models at scale using cloud-native architectures.";
  }

  // Cloud/Infrastructure
  if (lowerQuery.includes('cloud') || lowerQuery.includes('aws') || lowerQuery.includes('serverless')) {
    return "I specialize in cloud-native architectures, particularly AWS serverless solutions. I've built scalable systems using Lambda, API Gateway, DynamoDB, and other AWS services. My approach emphasizes infrastructure as code, cost optimization, and security best practices.";
  }

  // Full-stack development
  if (lowerQuery.includes('full-stack') || lowerQuery.includes('development') || lowerQuery.includes('frontend') || lowerQuery.includes('backend')) {
    return "I'm a full-stack developer with experience across the entire technology stack. I work with modern frameworks like React and Next.js on the frontend, Node.js and serverless functions on the backend, and have strong experience with databases, APIs, and cloud infrastructure.";
  }

  // Startup/Strategy
  if (lowerQuery.includes('startup') || lowerQuery.includes('strategy') || lowerQuery.includes('technical strategy')) {
    return "I have experience helping startups build their technical foundation from the ground up. I understand the unique challenges of early-stage companies and can help with technical architecture decisions, team building, and creating scalable solutions that grow with your business.";
  }

  // Automation/DevOps
  if (lowerQuery.includes('automation') || lowerQuery.includes('devops') || lowerQuery.includes('ci/cd')) {
    return "I'm passionate about automation and have built robust CI/CD pipelines, infrastructure automation, and monitoring systems. I believe in eliminating manual processes to improve reliability and team productivity, using tools like GitHub Actions, AWS automation services, and infrastructure as code.";
  }

  // Default response
  return `Thank you for your question about "${query}". I'm a full-stack developer with deep expertise in AI, cloud architectures, and automation. I focus on building scalable, maintainable solutions that deliver real business value. I'd be happy to discuss how my experience might align with your specific needs and requirements.`;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Pitch function called', JSON.stringify(event, null, 2));

  try {
    // Handle both API Gateway and Lambda Function URL events
    const httpMethod = event.httpMethod || (event.requestContext as { http?: { method?: string } })?.http?.method;

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

    const { role, query } = validation.sanitized;

    // Type guard to ensure role and query are defined
    if (!role || !query) {
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
          message: 'Role and query are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Generate AI response using Bedrock Knowledge Base
    const aiResponse = await generateAIResponse(role, query);

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
        pitch: aiResponse.pitch,
        confidence: aiResponse.confidence,
        role,
        query,
        timestamp: new Date().toISOString(),
        requestId: event.requestContext?.requestId || 'unknown'
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