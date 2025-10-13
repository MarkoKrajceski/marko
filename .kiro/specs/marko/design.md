# Design Document

## Overview

The personal intro site will be built as a modern, serverless single-page application using Next.js 15 with AWS Amplify. The architecture follows a JAMstack approach with server-side rendering for SEO, backed by AWS Lambda functions for dynamic functionality. The design emphasizes performance, observability, and maintainability while showcasing cloud-native development practices.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  Amplify Hosting │───▶│   CloudFront    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Next.js 15     │    │   Static Assets │
                       │   (App Router)   │    │   (Images, CSS) │
                       └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   API Gateway    │
                       └──────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
            │ Pitch Lambda │ │ Lead Lambda  │ │Health Lambda │
            │  (Node 22)   │ │  (Node 22)   │ │  (Node 22)   │
            └──────────────┘ └──────────────┘ └──────────────┘
                    │           │
                    └───────────┼───────────┐
                                ▼           ▼
                       ┌──────────────────┐ ┌──────────────────┐
                       │    DynamoDB      │ │   CloudWatch     │
                       │   (Analytics)    │ │   (Logs/Metrics) │
                       └──────────────────┘ └──────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: AWS Lambda (Node.js 22.x)
- **Database**: DynamoDB with TTL
- **Hosting**: AWS Amplify Hosting with SSR
- **API**: AWS API Gateway (REST)
- **Monitoring**: CloudWatch Logs and Metrics
- **CI/CD**: Amplify CI/CD with GitHub integration

## Components and Interfaces

### Frontend Components

#### 1. Page Layout (`app/page.tsx`)
- Single-page application with sections: Hero, WhatIDo, LiveDemo, Contact
- Server-side rendered for SEO optimization
- Responsive design with mobile-first approach

#### 2. Hero Section (`components/Hero.tsx`)
```typescript
interface HeroProps {
  onDemoClick: () => void;
  onContactClick: () => void;
}
```
- Displays main headline and tagline
- Two primary CTAs with smooth scroll functionality
- Subtle animations on load and hover

#### 3. What I Do Section (`components/WhatIDo.tsx`)
```typescript
interface ServiceCard {
  title: string;
  description: string;
  icon: React.ReactNode;
}
```
- Three service cards with icons and descriptions
- Hover animations and responsive grid layout

#### 4. Live Demo Widget (`components/LiveDemo.tsx`)
```typescript
interface DemoState {
  role: 'recruiter' | 'cto' | 'product' | 'founder' | '';
  focus: 'ai' | 'cloud' | 'automation' | '';
  loading: boolean;
  result: PitchResponse | null;
  error: string | null;
}

interface PitchResponse {
  pitch: string;
  confidence: number;
  timestamp: string;
  requestId: string;
}
```
- Controlled form with validation
- Loading states and error handling
- Copy-to-clipboard functionality
- Accessibility features (ARIA labels, keyboard navigation)

#### 5. Contact Form (`components/Contact.tsx`)
```typescript
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

interface ContactState {
  form: ContactForm;
  loading: boolean;
  success: boolean;
  error: string | null;
}
```
- Form validation with real-time feedback
- Privacy notice display
- Success/error state management

### Backend Services

#### 1. Pitch Generation Service (`amplify/functions/pitch/handler.ts`)
```typescript
interface PitchRequest {
  role: 'recruiter' | 'cto' | 'product' | 'founder';
  focus: 'ai' | 'cloud' | 'automation';
}

interface PitchResponse {
  pitch: string;
  confidence: number;
  timestamp: string;
  requestId: string;
}
```

**Pitch Generation Logic:**
- Rule-based system with predefined templates
- Role-specific messaging (recruiter: career focus, CTO: technical depth, etc.)
- Focus-specific content (AI: ML/automation, Cloud: scalability, Automation: efficiency)
- Confidence scoring based on role-focus combinations

#### 2. Lead Capture Service (`amplify/functions/lead/handler.ts`)
```typescript
interface LeadRequest {
  name: string;
  email: string;
  message: string;
}

interface LeadResponse {
  ok: boolean;
  message?: string;
}
```

#### 3. Health Check Service (`amplify/functions/health/handler.ts`)
```typescript
interface HealthResponse {
  ok: boolean;
  env: string;
  version: string;
  timestamp: string;
  uptime: number;
}
```

### API Endpoints

#### REST API Structure
- `POST /pitch` - Generate tailored pitch
- `POST /lead` - Capture contact information
- `GET /health` - System health check

#### Request/Response Schemas
All endpoints return consistent JSON responses with proper HTTP status codes and error handling.

## Data Models

### DynamoDB Table Structure

**Table Name**: `personal-site-data`

**Primary Key Design**:
- Partition Key (pk): Entity type and identifier
- Sort Key (sk): Timestamp or additional identifier

**Item Types**:

#### 1. Pitch Analytics
```typescript
{
  pk: "pitch#${requestId}",
  sk: "time#${isoTimestamp}",
  role: string,
  focus: string,
  ipHash: string,
  userAgentHash: string,
  timestamp: string,
  ttl: number, // 7 days from creation
  confidence: number
}
```

#### 2. Lead Captures
```typescript
{
  pk: "lead#${email}",
  sk: "time#${isoTimestamp}",
  name: string,
  email: string,
  message: string,
  timestamp: string,
  ttl: number, // 30 days from creation
  source: "contact-form"
}
```

#### 3. Analytics Counters (Optional)
```typescript
{
  pk: "counter#page-views",
  sk: "daily#${date}",
  count: number,
  lastUpdated: string
}
```

### TTL Configuration
- Pitch analytics: 7 days (604800 seconds)
- Lead captures: 30 days (2592000 seconds)
- Page view counters: 90 days (7776000 seconds)

## Error Handling

### Frontend Error Handling
- Network errors: Retry mechanism with exponential backoff
- Validation errors: Real-time form validation with helpful messages
- API errors: User-friendly error messages with fallback content
- Loading states: Skeleton loaders and progress indicators

### Backend Error Handling
- Input validation: Joi/Zod schema validation with detailed error messages
- Rate limiting: Per-IP rate limiting with 429 responses
- Database errors: Graceful degradation with CloudWatch logging
- CORS errors: Proper CORS configuration for security

### Error Response Format
```typescript
interface ErrorResponse {
  error: true;
  message: string;
  code: string;
  timestamp: string;
  requestId?: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration testing with MSW (Mock Service Worker)
- **E2E Tests**: Critical user flows with Playwright (optional)
- **Accessibility Tests**: Automated a11y testing with jest-axe

### Backend Testing
- **Unit Tests**: Lambda handler testing with Jest
- **Integration Tests**: DynamoDB integration with local DynamoDB
- **Contract Tests**: API schema validation
- **Load Tests**: Basic performance testing for rate limiting

### Test Coverage Targets
- Frontend components: 80%+ coverage
- Backend handlers: 90%+ coverage
- Critical paths: 100% coverage

## Performance Optimization

### Frontend Performance
- **Bundle Optimization**: Tree shaking and code splitting
- **Image Optimization**: Next.js Image component with WebP
- **CSS Optimization**: TailwindCSS purging and critical CSS
- **Caching**: Static asset caching with CloudFront
- **Prefetching**: Link prefetching for smooth navigation

### Backend Performance
- **Cold Start Optimization**: Minimal dependencies and lazy loading
- **Connection Pooling**: DynamoDB connection reuse
- **Caching**: Response caching where appropriate
- **Monitoring**: CloudWatch metrics for latency tracking

### Lighthouse Targets
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

## Security Considerations

### Frontend Security
- **Content Security Policy**: Strict CSP headers
- **HTTPS Only**: Force HTTPS redirects
- **Input Sanitization**: XSS prevention
- **Rate Limiting**: Client-side request throttling

### Backend Security
- **Input Validation**: Strict schema validation
- **CORS Configuration**: Origin-specific CORS rules
- **Rate Limiting**: Per-IP rate limiting
- **Data Privacy**: IP/UA hashing for analytics
- **Environment Variables**: Secure secret management

### AWS Security
- **IAM Roles**: Least privilege access
- **VPC Configuration**: Network isolation where needed
- **Encryption**: Data encryption at rest and in transit
- **Monitoring**: CloudTrail logging for audit

## Environment Configuration

### Environment Variable Flow
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Amplify Console │───▶│   Build Process  │───▶│   Lambda Env    │
│   (Variables)   │    │  (Next.js Build) │    │   (Runtime)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  .env.local     │    │ NEXT_PUBLIC_*    │    │ Process.env     │
│ (Development)   │    │ (Client Bundle)  │    │ (Server Only)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Environment Variable Configuration by Stage

#### Development (.env.local)
```bash
STAGE=dev
TABLE_NAME=personalSiteData-dev
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_STAGE=dev
```

#### Production (Amplify Console)
```bash
STAGE=prod
TABLE_NAME=personalSiteData-prod
RATE_LIMIT_MAX=30
RATE_LIMIT_WINDOW=60
AWS_REGION=us-east-1
NEXT_PUBLIC_API_URL=https://api.marko.dev
NEXT_PUBLIC_SITE_URL=https://marko.dev
NEXT_PUBLIC_STAGE=prod
CORS_ORIGIN=https://marko.dev
```

### Environment Variable Validation
- Runtime validation for required environment variables
- Build-time checks to ensure all NEXT_PUBLIC variables are set
- Lambda function startup validation with clear error messages
- Type-safe environment variable access through utility functions

## Deployment Strategy

### Amplify Configuration
```yaml
# amplify.yml
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: .next
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
          - .next/cache/**/*
```

### Environment Variables

#### Backend Environment Variables (Lambda Functions)
- `STAGE`: Environment identifier (dev/staging/prod)
- `TABLE_NAME`: DynamoDB table name with stage suffix
- `RATE_LIMIT_MAX`: Maximum requests per window (default: 10)
- `RATE_LIMIT_WINDOW`: Rate limit window in seconds (default: 60)
- `AWS_REGION`: AWS region for services (auto-set by Amplify)
- `CORS_ORIGIN`: Allowed CORS origin for API security

#### Frontend Environment Variables (Next.js)
- `NEXT_PUBLIC_API_URL`: Base URL for API endpoints
- `NEXT_PUBLIC_SITE_URL`: Site URL for canonical links and OG tags
- `NEXT_PUBLIC_STAGE`: Environment stage for client-side logic
- `API_ENDPOINT`: Internal API endpoint (server-side only)

#### Build-time Environment Variables
- `AMPLIFY_APP_ID`: Amplify application ID
- `AMPLIFY_BRANCH`: Current branch being deployed
- `AMPLIFY_COMMIT_ID`: Git commit hash for versioning

#### Environment Variable Management Strategy
1. **Amplify Console Configuration**: All environment variables are managed through Amplify's environment variable interface
2. **Stage-specific Variables**: Variables are suffixed with stage (e.g., `TABLE_NAME=personalSiteData-${STAGE}`)
3. **Automatic Injection**: Amplify automatically injects variables into both build process and Lambda functions
4. **Local Development**: `.env.local` file for local development with example provided
5. **Security**: Sensitive variables are server-side only, public variables use `NEXT_PUBLIC_` prefix

### CI/CD Pipeline
1. **Source**: GitHub repository with main branch
2. **Build**: Amplify build with Next.js 15 support
3. **Test**: Automated testing in build pipeline
4. **Deploy**: Automatic deployment to Amplify Hosting
5. **Monitor**: CloudWatch alerts for errors and performance

## Monitoring and Observability

### CloudWatch Metrics
- **Custom Metrics**:
  - `PitchRequests`: Count of pitch generation requests
  - `PitchLatency`: Response time for pitch generation
  - `LeadCaptures`: Count of lead form submissions
  - `ErrorRate`: Percentage of failed requests

### CloudWatch Logs
- **Structured Logging**: JSON format with correlation IDs
- **Log Groups**: Separate log groups per Lambda function
- **Log Retention**: 30 days for cost optimization
- **Error Alerting**: CloudWatch alarms for error rates

### Health Monitoring
- **Health Endpoint**: Comprehensive system status
- **Uptime Monitoring**: External monitoring service integration
- **Performance Monitoring**: Real User Monitoring (RUM) with CloudWatch

This design provides a solid foundation for building a production-ready personal intro site that demonstrates modern serverless architecture while maintaining simplicity and performance.