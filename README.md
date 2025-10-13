# Marko's Personal Introduction Site

A production-ready personal introduction website built with Next.js 15 and AWS Amplify, showcasing cloud automation expertise through a single-page application with live Lambda demos and clean minimalist design.

## Architecture Overview

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

## Features

- **Single-page application** with Hero, What I Do, Live Demo, and Contact sections
- **Live Lambda demo** that generates tailored pitches based on role and focus
- **Contact form** with lead capture and DynamoDB storage
- **Real-time analytics** with anonymized data collection and 7-day TTL
- **Rate limiting** and comprehensive error handling
- **CloudWatch monitoring** with custom metrics and structured logging
- **Responsive design** with TailwindCSS and micro-animations
- **SEO optimized** with proper meta tags and server-side rendering

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS
- **Backend**: AWS Lambda (Node.js 22.x)
- **Database**: DynamoDB with TTL
- **Hosting**: AWS Amplify Hosting with SSR
- **API**: AWS API Gateway (REST)
- **Monitoring**: CloudWatch Logs and Metrics
- **CI/CD**: Amplify CI/CD with GitHub integration

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS CLI configured with appropriate permissions
- Amplify CLI installed globally: `npm install -g @aws-amplify/cli`

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marko
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional for local development)**
   ```bash
   # Optional: Copy example file if you want to customize local settings
   cp .env.local.example .env.local
   # The app works out-of-the-box without any environment variables!
   ```

4. **Validate environment setup (optional)**
   ```bash
   npm run validate:env
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run validate:env` - Validate all environment variables
- `npm run validate:env:frontend` - Validate frontend environment variables
- `npm run validate:env:backend` - Validate backend environment variables
- `npm run setup:monitoring` - Set up CloudWatch monitoring

## AWS Amplify Deployment

### Initial Setup

1. **Initialize Amplify project**
   ```bash
   amplify init
   ```
   
   Configuration:
   - Project name: `marko-personal-site`
   - Environment name: `dev` (or `staging`/`prod`)
   - Default editor: Your preferred editor
   - App type: `javascript`
   - Framework: `react`
   - Source directory: `src`
   - Build directory: `.next`
   - Build command: `npm run build`
   - Start command: `npm run start`

2. **Add hosting**
   ```bash
   amplify add hosting
   ```
   
   Choose:
   - Hosting with Amplify Console
   - Manual deployment (for initial setup)

3. **Add API and Functions**
   ```bash
   amplify add api
   ```
   
   Configuration:
   - REST API
   - API name: `personalSiteApi`
   - Path: `/pitch`, `/lead`, `/health`
   - Lambda functions: Create new functions for each endpoint

4. **Add storage (DynamoDB)**
   ```bash
   amplify add storage
   ```
   
   Configuration:
   - NoSQL Database
   - Table name: `personalSiteData`
   - Partition key: `pk` (String)
   - Sort key: `sk` (String)
   - Add TTL attribute: `ttl` (Number)

### Environment Variable Configuration

**🚀 AUTOMATIC CONFIGURATION**: Environment variables are automatically generated during the Amplify build process! The build script detects your API Gateway URLs and generates all required variables.

**You don't need to manually set these variables in the Amplify Console unless you want to override the defaults.**

#### Auto-Generated Variables
The following variables are automatically generated during build:

```bash
# Auto-generated from branch name
STAGE=dev|staging|prod              # Based on git branch (main=prod, staging=staging, others=dev)

# Auto-generated from Amplify backend
NEXT_PUBLIC_API_URL=https://...     # Detected from API Gateway configuration
NEXT_PUBLIC_SITE_URL=https://...    # Generated from Amplify domain or custom domain
TABLE_NAME=personalSiteData-{stage} # Auto-generated with stage suffix
AWS_REGION=us-east-1               # Auto-detected from Amplify environment
CORS_ORIGIN=https://...            # Matches the site URL

# Auto-generated defaults (can be overridden)
RATE_LIMIT_MAX=10|30               # 10 for dev/staging, 30 for prod
RATE_LIMIT_WINDOW=60               # 60 seconds default
```

#### Manual Overrides (Optional)
Only set these in the Amplify Console if you need custom values:

```bash
# Override rate limiting (optional)
RATE_LIMIT_MAX=50                  # Custom rate limit
RATE_LIMIT_WINDOW=120              # Custom window

# Override URLs (optional - not recommended)
NEXT_PUBLIC_API_URL=https://custom-api.example.com
CORS_ORIGIN=https://custom-domain.com
```

### Deployment Steps

1. **Deploy backend resources**
   ```bash
   amplify push
   ```

2. **Set up CI/CD with GitHub**
   ```bash
   amplify console
   ```
   
   In the Amplify Console:
   - Connect your GitHub repository
   - Configure build settings (use provided `amplify.yml`)
   - Set environment variables for your stage
   - Enable automatic deployments on push to main branch

3. **Configure custom domain (optional)**
   ```bash
   amplify add hosting
   ```
   
   Choose Amazon CloudFront and S3, then configure your custom domain in the Amplify Console.

### Stage-Specific Deployment

#### Development Environment
```bash
amplify env add dev
amplify push --env dev
```

#### Production Environment
```bash
amplify env add prod
amplify push --env prod
```

Set stage-specific environment variables in the Amplify Console for each environment.

## Local Testing

### Frontend Testing
```bash
# Run development server
npm run dev

# Test build process
npm run build
npm run start
```

### Backend Testing (Lambda Functions)
```bash
# Test Lambda functions locally (requires Amplify CLI)
amplify mock api

# Test specific endpoints
curl -X POST http://localhost:20002/pitch \
  -H "Content-Type: application/json" \
  -d '{"role": "cto", "focus": "cloud"}'

curl -X GET http://localhost:20002/health
```

### Environment Variable Testing
```bash
# Validate all environment variables
npm run validate:env

# Validate specific environments
npm run validate:env:frontend
npm run validate:env:backend
```

## API Endpoints

### POST /pitch
Generate a tailored pitch based on role and focus.

**Request:**
```json
{
  "role": "recruiter" | "cto" | "product" | "founder",
  "focus": "ai" | "cloud" | "automation"
}
```

**Response:**
```json
{
  "pitch": "Generated pitch text...",
  "confidence": 0.95,
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "uuid-string"
}
```

### POST /lead
Capture contact form submissions.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Interested in collaboration..."
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Lead captured successfully"
}
```

### GET /health
System health check endpoint.

**Response:**
```json
{
  "ok": true,
  "env": "dev",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

## Monitoring and Observability

### CloudWatch Metrics
- `PitchRequests`: Count of pitch generation requests
- `PitchLatency`: Response time for pitch generation
- `LeadCaptures`: Count of lead form submissions
- `ErrorRate`: Percentage of failed requests

### CloudWatch Logs
- Structured JSON logging with correlation IDs
- Separate log groups per Lambda function
- 30-day log retention for cost optimization

### Setting Up Monitoring
```bash
# Set up monitoring for development
npm run setup:monitoring:dev

# Set up monitoring for production
npm run setup:monitoring:prod
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Verify `.env.local` exists and has correct values
   - Run `npm run validate:env` to check configuration
   - Ensure `NEXT_PUBLIC_` prefix for client-side variables

2. **Lambda Functions Not Deploying**
   - Check Amplify CLI version: `amplify --version`
   - Verify AWS credentials: `aws sts get-caller-identity`
   - Review CloudFormation stack in AWS Console

3. **CORS Errors**
   - Verify `CORS_ORIGIN` environment variable matches your domain
   - Check API Gateway CORS configuration in AWS Console
   - Ensure proper headers in Lambda responses

4. **DynamoDB Access Issues**
   - Verify IAM roles have proper DynamoDB permissions
   - Check table name matches `TABLE_NAME` environment variable
   - Review CloudWatch logs for detailed error messages

### Debug Commands
```bash
# Check Amplify status
amplify status

# View Amplify logs
amplify console

# Test API endpoints
curl -X GET https://your-api-url/health

# Check environment variables
npm run validate:env
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Run linting and formatting: `npm run lint:fix && npm run format`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review CloudWatch logs for detailed error information
- Contact the development team for additional support
