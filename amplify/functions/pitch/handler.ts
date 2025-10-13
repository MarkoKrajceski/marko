import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Pitch function called', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = event.body ? JSON.parse(event.body) : {};
    const { role, focus } = body;
    
    // Validate input
    if (!role || !focus) {
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
          message: 'Role and focus are required',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString()
        })
      };
    }
    
    // Generate pitch based on role and focus
    const pitches = {
      'recruiter-ai': "I'm Marko, a seasoned developer who's passionate about leveraging AI to solve real-world problems. With my experience in machine learning and full-stack development, I can help your team build intelligent applications that drive business value. I'm particularly excited about opportunities where I can combine my technical expertise with AI innovation to create solutions that make a meaningful impact.",
      'recruiter-cloud': "I'm Marko, a cloud-native developer with extensive experience in AWS, serverless architectures, and scalable system design. I specialize in building robust, cost-effective solutions that can handle enterprise-scale workloads. My expertise in DevOps and infrastructure-as-code ensures that the systems I build are not only performant but also maintainable and secure.",
      'recruiter-automation': "I'm Marko, a developer who thrives on automating complex processes and building efficient workflows. My experience spans from CI/CD pipeline optimization to creating intelligent automation tools that save teams countless hours. I believe in the power of automation to eliminate repetitive tasks and allow developers to focus on what they do best - creating innovative solutions.",
      'cto-ai': "As a technical leader, I understand the strategic importance of AI in today's competitive landscape. I bring both the technical depth to implement sophisticated AI solutions and the business acumen to ensure they align with your company's objectives. My approach focuses on building AI systems that are not just technically impressive, but also practical, scalable, and deliver measurable ROI.",
      'cto-cloud': "I'm Marko, and I specialize in architecting cloud-native solutions that scale with your business. My expertise in AWS, microservices, and serverless computing enables me to design systems that are both cost-effective and highly available. I understand the challenges of cloud migration and can help your team navigate the complexities while maximizing the benefits of cloud adoption.",
      'cto-automation': "I believe that strategic automation is key to maintaining competitive advantage in today's fast-paced market. My experience in building automation frameworks and optimizing development workflows can help your team increase velocity while maintaining quality. I focus on creating automation solutions that not only solve immediate problems but also provide a foundation for future growth.",
      'product-ai': "I'm passionate about creating AI-powered products that users love. My technical background combined with a user-centric approach allows me to build AI features that are both powerful and intuitive. I understand how to balance technical capabilities with user experience to create products that truly solve user problems and drive engagement.",
      'product-cloud': "I specialize in building cloud-native products that can scale from startup to enterprise. My experience with modern cloud architectures ensures that the products I build can handle rapid growth while maintaining performance and reliability. I focus on creating solutions that provide excellent user experiences while being cost-effective to operate.",
      'product-automation': "I'm excited about building products that automate complex workflows and make users more productive. My approach combines deep technical knowledge with user empathy to create automation tools that are both powerful and easy to use. I believe the best automation products are those that users don't even realize they're using - they just make everything work better.",
      'founder-ai': "As someone who understands both the technical and business sides of AI, I can help you navigate the opportunities and challenges of building an AI-driven company. My experience spans from prototype to production, and I understand how to build AI solutions that not only work technically but also create sustainable business value. I'm passionate about using AI to solve meaningful problems and create positive impact.",
      'founder-cloud': "I bring the technical expertise to help you build a cloud-first company from the ground up. My experience with scalable architectures and cost optimization can help you avoid common pitfalls and build a technical foundation that supports rapid growth. I understand the unique challenges that founders face and can help you make technical decisions that align with your business goals.",
      'founder-automation': "I'm passionate about helping founders build companies that leverage automation to create competitive advantages. My experience in building automation tools and optimizing processes can help you create a more efficient, scalable business. I understand that as a founder, your time is your most valuable resource, and I can help you build systems that multiply your impact."
    };
    
    const pitchKey = `${role}-${focus}`;
    const pitch = pitches[pitchKey as keyof typeof pitches];
    
    if (!pitch) {
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
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        pitch,
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
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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