# Amplify Gen 1 → Gen 2 Migration Checklist

## 🎯 Migration Status: IN PROGRESS

### ✅ COMPLETED
- [x] Basic Gen 2 project structure created
- [x] Auth resource configured (Cognito)
- [x] Data resource configured (GraphQL + DynamoDB)
- [x] Basic Lambda function structure
- [x] Pitch handler with full template logic and confidence scores

### ✅ COMPLETED - BATCH 1: Core Lambda Functions
- [x] **Lead Handler Security & Validation**
  - [x] Port input sanitization from `shared/security.js`
  - [x] Add email validation with XSS protection
  - [x] Add message length and content validation
  - [x] Add request size validation (DoS protection)
  - [x] Add attack pattern detection (SQL injection, XSS)
  - [x] Add comprehensive error handling
  
- [x] **Health Handler Enhancement**
  - [x] Add comprehensive system status checks
  - [x] Add memory and uptime reporting
  - [x] Add service dependency checks
  - [x] Add proper error handling
  - [x] Add system metadata reporting
  - [x] Add cache control headers

### 📋 BATCH 2: Security & Validation (CRITICAL)
- [ ] **Security Utilities Migration**
  - [ ] Port `sanitizeString()` function
  - [ ] Port `sanitizeEmail()` function  
  - [ ] Port `validatePitchRequest()` function
  - [ ] Port `validateLeadRequest()` function
  - [ ] Port `validateHttpMethod()` function
  - [ ] Port `validateRequestHeaders()` function
  - [ ] Port `validateRequestSize()` function
  - [ ] Port `checkForAttackPatterns()` function
  - [ ] Port XSS prevention utilities
  - [ ] Port SQL injection prevention

- [ ] **Data Anonymization**
  - [ ] Port `hashSensitiveData()` function
  - [ ] Port `anonymizeIP()` function
  - [ ] Port `anonymizeUserAgent()` function
  - [ ] Port privacy-preserving analytics

### 📋 BATCH 3: Data Storage & Analytics
- [ ] **DynamoDB Integration**
  - [ ] Configure DynamoDB table schema in Gen 2
  - [ ] Port pitch analytics logging
  - [ ] Port lead capture data storage
  - [ ] Add TTL configuration (7 days for analytics)
  - [ ] Add proper error handling for DB operations

- [ ] **Analytics & Metrics**
  - [ ] Port CloudWatch metrics integration
  - [ ] Add custom metrics for pitch generation
  - [ ] Add custom metrics for lead capture
  - [ ] Add error rate monitoring
  - [ ] Add performance monitoring

### 📋 BATCH 4: Rate Limiting & Performance
- [ ] **Rate Limiting System**
  - [ ] Implement in-memory rate limiting store
  - [ ] Add rate limit validation per IP
  - [ ] Add rate limit headers in responses
  - [ ] Add rate limit exceeded error handling
  - [ ] Configure rate limits per environment

- [ ] **Performance Optimizations**
  - [ ] Add response caching where appropriate
  - [ ] Optimize Lambda cold starts
  - [ ] Add request/response compression
  - [ ] Add timeout configurations

### 📋 BATCH 5: Environment & Configuration
- [ ] **Environment Variables**
  - [ ] Configure `TABLE_NAME` environment variable
  - [ ] Configure `RATE_LIMIT_MAX` environment variable
  - [ ] Configure `RATE_LIMIT_WINDOW` environment variable
  - [ ] Configure `CORS_ORIGIN` environment variable
  - [ ] Configure stage-specific variables (dev/prod)

- [ ] **Build & Deployment**
  - [ ] Port build environment injection script
  - [ ] Configure proper TypeScript compilation
  - [ ] Add proper dependency management
  - [ ] Configure Lambda layer for shared utilities

### 📋 BATCH 6: Monitoring & Observability
- [ ] **CloudWatch Integration**
  - [ ] Configure log groups with proper naming
  - [ ] Add structured logging
  - [ ] Add error alerting
  - [ ] Add performance dashboards
  - [ ] Configure log retention policies

- [ ] **Health Monitoring**
  - [ ] Add comprehensive health checks
  - [ ] Add dependency health monitoring
  - [ ] Add automated health alerts
  - [ ] Add uptime monitoring

### 📋 BATCH 7: Testing & Validation
- [ ] **Function Testing**
  - [ ] Test pitch generation with all role/focus combinations
  - [ ] Test lead capture with various input scenarios
  - [ ] Test health endpoint functionality
  - [ ] Test error handling and edge cases
  - [ ] Test rate limiting behavior

- [ ] **Security Testing**
  - [ ] Test XSS prevention
  - [ ] Test SQL injection prevention
  - [ ] Test input validation
  - [ ] Test request size limits
  - [ ] Test CORS configuration

### 📋 BATCH 8: Documentation & Cleanup
- [ ] **Documentation**
  - [ ] Update API documentation
  - [ ] Update deployment documentation
  - [ ] Update environment setup guide
  - [ ] Create migration notes

- [ ] **Cleanup**
  - [ ] Remove old amplify_backup directory
  - [ ] Remove old amplify_existing directory
  - [ ] Clean up temporary files
  - [ ] Update .gitignore if needed

---

## 🚨 CRITICAL MISSING FUNCTIONALITY (Must Complete Before Production)

1. **Security Validation** - Input sanitization, XSS/SQL injection prevention
2. **DynamoDB Storage** - Analytics and lead data persistence  
3. **Rate Limiting** - DoS protection and abuse prevention
4. **Error Handling** - Comprehensive error responses and logging
5. **Environment Config** - Proper stage management and variables

## 📊 Migration Progress: 35% Complete

**Next Action**: Complete Batch 1 (Core Lambda Functions) before testing deployment.

---
*Last Updated: 2025-10-13T18:40:00Z*