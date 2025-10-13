# Security Configuration Guide

This document outlines the comprehensive security measures implemented in Marko's personal site to protect against common web vulnerabilities and ensure data privacy.

## Security Overview

The application implements multiple layers of security:

1. **Frontend Security**: CSP, XSS prevention, input sanitization
2. **API Security**: CORS, rate limiting, input validation
3. **Infrastructure Security**: HTTPS, security headers, monitoring
4. **Data Privacy**: Anonymization, encryption, minimal data collection

## Content Security Policy (CSP)

### Implementation

The application uses a strict Content Security Policy that varies by environment:

```typescript
// Production CSP (most restrictive)
const csp = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'font-src': ["'self'", "https://fonts.gstatic.com", "data:"],
  'img-src': ["'self'", "data:", "https:"],
  'connect-src': ["'self'", "https://api.marko.dev"],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
};
```

### Environment-Specific Rules

- **Development**: Allows `unsafe-eval` and HTTP connections
- **Staging**: Allows staging API endpoints
- **Production**: Most restrictive, HTTPS only

## Security Headers

### Applied Headers

All responses include comprehensive security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Implementation

Security headers are applied via:
- Next.js middleware for all requests
- Lambda function responses for API endpoints
- Amplify hosting configuration

## Input Validation and Sanitization

### Frontend Validation

All user inputs are validated and sanitized:

```typescript
// Example: Contact form validation
export function sanitizeFormData(data: Record<string, any>) {
  const sanitized: Record<string, string> = {};
  const errors: string[] = [];
  
  // Name validation
  if (data.name) {
    const name = sanitizeString(data.name);
    if (name.length < 2 || name.length > 100) {
      errors.push('Name must be 2-100 characters');
    } else {
      sanitized.name = name;
    }
  }
  
  // Email validation
  if (data.email) {
    const email = sanitizeEmail(data.email);
    if (!email) {
      errors.push('Invalid email format');
    } else {
      sanitized.email = email;
    }
  }
  
  return { sanitized, errors };
}
```

### Backend Validation

Lambda functions perform additional server-side validation:

```javascript
// Example: Pitch request validation
function validatePitchRequest(data) {
  const allowedRoles = ['recruiter', 'cto', 'product', 'founder'];
  const allowedFocus = ['ai', 'cloud', 'automation'];
  
  if (!allowedRoles.includes(data.role)) {
    throw new Error('Invalid role');
  }
  
  if (!allowedFocus.includes(data.focus)) {
    throw new Error('Invalid focus');
  }
  
  return { role: data.role, focus: data.focus };
}
```

## CORS Protection

### Configuration

CORS is configured at multiple levels:

1. **API Gateway**: CloudFormation template with environment-specific origins
2. **Lambda Functions**: Response headers with validated origins
3. **Next.js Middleware**: Request origin validation

### Environment-Specific Origins

```javascript
const ALLOWED_ORIGINS = {
  dev: ['http://localhost:3000'],
  staging: ['https://staging.marko.dev'],
  prod: ['https://marko.dev'],
};
```

## Rate Limiting

### Implementation Layers

1. **Client-Side**: Prevents rapid successive requests
2. **Middleware**: Request-level rate limiting
3. **Lambda Functions**: Per-IP rate limiting with DynamoDB
4. **API Gateway**: Built-in throttling

### Rate Limit Configuration

```javascript
// Development: 10 requests per minute
// Staging: 20 requests per minute  
// Production: 30 requests per minute

const rateLimits = {
  dev: { max: 10, window: 60 },
  staging: { max: 20, window: 60 },
  prod: { max: 30, window: 60 },
};
```

## Data Privacy and Anonymization

### Personal Data Handling

The application minimizes personal data collection:

- **Contact Form**: Name, email, message (30-day TTL)
- **Analytics**: Anonymized IP hashes, no personal identifiers
- **Logs**: Structured logging with correlation IDs

### Anonymization Techniques

```javascript
// IP address anonymization
function anonymizeIP(ip) {
  const today = new Date().toISOString().split('T')[0];
  return crypto
    .createHash('sha256')
    .update(ip + today)
    .digest('hex')
    .substring(0, 16);
}

// User-Agent anonymization
function anonymizeUserAgent(userAgent) {
  const basicInfo = userAgent.substring(0, 50);
  const hash = hashSensitiveData(userAgent);
  return `${basicInfo}...${hash}`;
}
```

### Data Retention

- **Pitch Analytics**: 7 days (automatic TTL)
- **Lead Captures**: 30 days (automatic TTL)
- **CloudWatch Logs**: 30 days retention
- **Rate Limiting Data**: 5 minutes (in-memory cleanup)

## Attack Prevention

### XSS Prevention

Multiple layers of XSS protection:

1. **Input Sanitization**: Remove dangerous characters
2. **Output Encoding**: Proper HTML encoding
3. **CSP Headers**: Prevent inline script execution
4. **React**: Built-in XSS protection

### SQL Injection Prevention

- **No Direct SQL**: Using DynamoDB with parameterized queries
- **Input Validation**: Strict type checking
- **Pattern Detection**: Scanning for SQL injection patterns

### CSRF Protection

- **Origin Validation**: Strict origin checking
- **SameSite Cookies**: If cookies were used
- **Custom Headers**: API requests require specific headers

### Bot Protection

Basic bot detection and blocking:

```javascript
const suspiciousPatterns = [
  /curl/i, /wget/i, /python/i, 
  /bot/i, /crawler/i, /spider/i
];

if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
  return createErrorResponse(403, 'Access denied');
}
```

## HTTPS and Transport Security

### Configuration

- **Amplify Hosting**: Automatic HTTPS with AWS Certificate Manager
- **HSTS Headers**: Force HTTPS for all future requests
- **Redirect Rules**: HTTP to HTTPS redirects
- **Certificate Transparency**: Expect-CT headers

### Implementation

```javascript
// HSTS header
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'

// HTTPS redirect in middleware
if (stage === 'prod' && request.headers.get('x-forwarded-proto') === 'http') {
  const httpsUrl = new URL(request.url);
  httpsUrl.protocol = 'https:';
  return NextResponse.redirect(httpsUrl, 301);
}
```

## Monitoring and Alerting

### Security Monitoring

CloudWatch alarms for security events:

- **High Error Rate**: > 5 errors in 5 minutes
- **Rate Limit Hits**: > 10 rate limit violations in 5 minutes
- **Lambda Errors**: Any Lambda function errors
- **Suspicious Activity**: Pattern-based detection

### Log Analysis

Structured logging for security analysis:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "WARN",
  "message": "Rate limit exceeded",
  "ip": "anonymized-hash",
  "userAgent": "truncated-ua...hash",
  "endpoint": "/api/pitch",
  "correlationId": "req-123"
}
```

## Environment-Specific Security

### Development

- Relaxed CSP for development tools
- HTTP connections allowed
- Detailed error messages
- Additional debugging headers

### Staging

- Production-like security with staging origins
- Moderate rate limits
- Full logging enabled
- Test-friendly configurations

### Production

- Strictest security policies
- Minimal error information
- Aggressive rate limiting
- Full monitoring and alerting

## Security Best Practices

### Code Security

1. **Input Validation**: Always validate and sanitize inputs
2. **Output Encoding**: Properly encode all outputs
3. **Error Handling**: Don't expose sensitive information
4. **Dependency Management**: Regular security updates

### Infrastructure Security

1. **Least Privilege**: Minimal IAM permissions
2. **Network Security**: VPC and security groups
3. **Encryption**: Data at rest and in transit
4. **Monitoring**: Comprehensive logging and alerting

### Operational Security

1. **Regular Updates**: Keep dependencies current
2. **Security Scanning**: Automated vulnerability scanning
3. **Incident Response**: Clear procedures for security incidents
4. **Access Control**: Secure deployment and management access

## Security Testing

### Automated Testing

- **Dependency Scanning**: npm audit in CI/CD
- **SAST**: Static analysis security testing
- **Security Headers**: Automated header validation
- **Rate Limiting**: Automated rate limit testing

### Manual Testing

- **Penetration Testing**: Regular security assessments
- **Code Review**: Security-focused code reviews
- **Configuration Review**: Regular security configuration audits

## Incident Response

### Detection

- CloudWatch alarms for security events
- Log analysis for suspicious patterns
- Rate limiting triggers
- Error rate monitoring

### Response Procedures

1. **Immediate**: Block malicious IPs/patterns
2. **Investigation**: Analyze logs and patterns
3. **Mitigation**: Apply additional security measures
4. **Recovery**: Restore normal operations
5. **Post-Incident**: Review and improve security

## Compliance and Privacy

### Data Protection

- **Minimal Collection**: Only collect necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Retention Limits**: Automatic data expiration
- **User Rights**: Clear privacy policy and data handling

### Security Standards

- **OWASP Top 10**: Protection against common vulnerabilities
- **Security Headers**: Comprehensive header implementation
- **Encryption**: TLS 1.3 for all communications
- **Access Control**: Proper authentication and authorization

## Security Checklist

### Pre-Deployment

- [ ] All inputs validated and sanitized
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error handling doesn't expose sensitive data
- [ ] Dependencies scanned for vulnerabilities
- [ ] CSP configured for environment
- [ ] HTTPS enforced

### Post-Deployment

- [ ] Security monitoring active
- [ ] Alerts configured and tested
- [ ] Log analysis working
- [ ] Rate limiting effective
- [ ] Security headers present
- [ ] HTTPS working correctly
- [ ] No sensitive data in logs
- [ ] Incident response procedures ready

## Contact and Reporting

For security issues or questions:

- **Security Email**: security@marko.dev
- **Response Time**: 24 hours for critical issues
- **Disclosure**: Responsible disclosure preferred
- **Updates**: Security updates communicated via changelog