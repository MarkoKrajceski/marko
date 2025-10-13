# Requirements Document

## Introduction

This feature involves building a production-ready personal introduction website for Marko using Next.js 15 and AWS Amplify. The site will showcase cloud automation expertise through a single-page application with a live Lambda demo, clean minimalist design, and basic observability. The primary goal is to ship a professional site in one day that demonstrates the ability to build and deploy modern serverless applications on AWS.

## Requirements

### Requirement 1

**User Story:** As a visitor to Marko's site, I want to see a professional single-page introduction that clearly communicates his expertise in AI, Cloud, and Automation, so that I can quickly understand his capabilities and get in touch.

#### Acceptance Criteria

1. WHEN a user visits the homepage THEN the system SHALL display a single-page layout with Hero, What I Do, Selected Work/Logos, Live Demo, and Contact sections
2. WHEN the page loads THEN the system SHALL show the tagline "AI • CLOUD • AUTOMATION" prominently in the hero section
3. WHEN a user views the hero section THEN the system SHALL display the headline "I automate the boring and scale the bold" with subhead "Full-stack developer and cloud consultant. I ship fast, keep it simple, and instrument everything"
4. WHEN a user sees the hero section THEN the system SHALL provide two CTAs: "Try the Demo" (scrolls to Lambda widget) and "Get in Touch"
5. WHEN a user views the What I Do section THEN the system SHALL display three cards: "Cloud & Serverless", "Automation Pipelines", and "Applied AI"

### Requirement 2

**User Story:** As a potential client or recruiter, I want to interact with a live demo that generates tailored pitches based on my role and interests, so that I can see Marko's technical capabilities in action.

#### Acceptance Criteria

1. WHEN a user accesses the Live Demo section THEN the system SHALL display a compact widget with role and focus selection dropdowns
2. WHEN a user selects a role from ["recruiter", "cto", "product", "founder"] THEN the system SHALL enable the focus dropdown
3. WHEN a user selects a focus from ["ai", "cloud", "automation"] THEN the system SHALL enable the "Generate Pitch" button
4. WHEN a user clicks "Generate Pitch" THEN the system SHALL call the Lambda function and display a loading state
5. WHEN the Lambda returns a response THEN the system SHALL display the tailored pitch with copy-to-clipboard functionality
6. WHEN an error occurs THEN the system SHALL show a friendly error message with retry option
7. WHEN a user views the demo widget THEN the system SHALL include a tooltip explaining "This hits a real AWS Lambda and stores anonymized analytics for 7 days"

### Requirement 3

**User Story:** As a backend system, I want to process pitch generation requests through a serverless Lambda function, so that I can provide fast, deterministic responses while logging analytics.

#### Acceptance Criteria

1. WHEN a POST request is made to /pitch with valid role and focus THEN the Lambda SHALL return a JSON response with pitch, confidence, timestamp, and requestId
2. WHEN a request is received THEN the Lambda SHALL validate the input schema and return 400 with helpful errors for invalid data
3. WHEN processing a request THEN the Lambda SHALL log the request with anonymized UA/IP hash to DynamoDB with 7-day TTL
4. WHEN processing requests THEN the Lambda SHALL implement rate limiting (per-IP per minute) and return 429 for exceeded limits
5. WHEN a request is processed THEN the Lambda SHALL emit CloudWatch metrics for request count and latency
6. WHEN a GET request is made to /health THEN the Lambda SHALL return status with ok: true, env, version, and timestamp

### Requirement 4

**User Story:** As a potential lead, I want to submit my contact information through a simple form, so that Marko can get back to me about potential collaboration.

#### Acceptance Criteria

1. WHEN a user views the Contact section THEN the system SHALL display a minimal form with name, email, and message fields
2. WHEN a user submits the contact form THEN the system SHALL validate the input and call the /lead endpoint
3. WHEN the form is submitted successfully THEN the system SHALL show a confirmation message
4. WHEN form submission fails THEN the system SHALL display an appropriate error message
5. WHEN a user views the form THEN the system SHALL display privacy text: "Your info is used only to get back to you"

### Requirement 5

**User Story:** As a developer, I want the site to be built with modern technologies and best practices, so that it demonstrates technical competence and is maintainable.

#### Acceptance Criteria

1. WHEN the project is built THEN the system SHALL use Next.js 15 with App Router and TypeScript
2. WHEN styling is applied THEN the system SHALL use TailwindCSS with the specified color palette (bg #0a0a0a, accent #facc15, secondary #f7dce6, text #fff/#d4d4d8)
3. WHEN the Lambda is deployed THEN the system SHALL use Node.js 22.x runtime
4. WHEN animations are added THEN the system SHALL include tasteful micro-animations on hover/scroll without heavy libraries
5. WHEN the site is built THEN the system SHALL achieve Lighthouse scores of 90+ for performance
6. WHEN SEO is implemented THEN the system SHALL include proper title, description, OG tags, and favicon

### Requirement 6

**User Story:** As a site owner, I want the application to be deployed on AWS Amplify with proper CI/CD, so that updates are automatically deployed and the infrastructure is managed.

#### Acceptance Criteria

1. WHEN code is pushed to the main branch THEN Amplify SHALL automatically build and deploy the site
2. WHEN the Amplify project is configured THEN it SHALL include Hosting, Functions, API Gateway, and DynamoDB resources
3. WHEN environment variables are needed THEN they SHALL be configured in Amplify (STAGE, TABLE_NAME, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)
4. WHEN CORS is configured THEN it SHALL be limited to the site origin for security
5. WHEN the API is deployed THEN it SHALL be accessible through Amplify's managed API Gateway

### Requirement 7

**User Story:** As a system administrator, I want comprehensive observability and data management, so that I can monitor the application and understand user interactions.

#### Acceptance Criteria

1. WHEN requests are processed THEN the system SHALL log all interactions to CloudWatch with appropriate detail levels
2. WHEN metrics are collected THEN the system SHALL track request counts and latency in CloudWatch
3. WHEN data is stored in DynamoDB THEN it SHALL use appropriate partition and sort keys (pk: "pitch#<REQUEST_ID>", sk: "time#<ISO>")
4. WHEN data is stored THEN it SHALL include TTL settings for automatic cleanup after 7 days
5. WHEN the health endpoint is called THEN it SHALL return comprehensive system status information

### Requirement 8

**User Story:** As a developer setting up the project, I want comprehensive environment variable management and configuration, so that the application can be deployed across different environments securely and consistently.

#### Acceptance Criteria

1. WHEN environment variables are defined THEN the system SHALL include a complete .env.local.example file with all required variables and descriptions
2. WHEN the build process runs THEN it SHALL automatically export and inject environment variables from Amplify into the application
3. WHEN deploying to different environments THEN the system SHALL support stage-specific environment variables (dev, staging, prod)
4. WHEN Lambda functions are deployed THEN they SHALL receive environment variables through Amplify's managed environment configuration
5. WHEN the frontend is built THEN it SHALL access API endpoints through environment-specific NEXT_PUBLIC variables
6. WHEN environment variables are missing THEN the system SHALL provide clear error messages indicating which variables are required
7. WHEN sensitive variables are used THEN they SHALL be properly secured and not exposed to the client-side bundle

### Requirement 9

**User Story:** As a developer setting up the project, I want clear documentation and setup instructions, so that I can easily deploy and maintain the application.

#### Acceptance Criteria

1. WHEN the repository is created THEN it SHALL include a comprehensive README with setup instructions
2. WHEN documentation is provided THEN it SHALL include Amplify deploy steps, environment variables, and local testing instructions
3. WHEN the README is written THEN it SHALL include a minimal ASCII architecture diagram
4. WHEN tests are included THEN they SHALL cover Lambda handlers with validation and happy/edge path scenarios
5. WHEN configuration examples are provided THEN they SHALL include .env.local and Amplify build settings
6. WHEN the project is documented THEN it SHALL include a Changelog section with version and date information