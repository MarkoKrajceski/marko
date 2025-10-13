#!/usr/bin/env node

/**
 * Implementation Validation Script
 * 
 * This script validates that all required functionality is properly implemented
 * by checking code structure, API routes, components, and configurations.
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${title}`, 'bright');
  log(`${'='.repeat(60)}`, 'cyan');
}

// Validation results
const results = {
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
};

function validateImplementation(name, condition, details = '') {
  if (condition) {
    results.passed++;
    log(`✅ ${name}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else {
    results.failed++;
    results.errors.push(name);
    log(`❌ ${name}`, 'red');
    if (details) log(`   ${details}`, 'yellow');
  }
  results.details.push({ name, passed: condition, details });
  return condition;
}

// Validate API Routes Implementation
function validateApiRoutes() {
  logSection('API Routes Implementation Validation');
  
  const apiRoutes = [
    { path: 'src/app/api/health/route.ts', name: 'Health API Route' },
    { path: 'src/app/api/pitch/route.ts', name: 'Pitch API Route' },
    { path: 'src/app/api/lead/route.ts', name: 'Lead API Route' },
  ];
  
  apiRoutes.forEach(route => {
    const routePath = path.join(process.cwd(), route.path);
    if (validateImplementation(`${route.name} exists`, fs.existsSync(routePath))) {
      const content = fs.readFileSync(routePath, 'utf8');
      
      // Check for proper exports
      validateImplementation(`${route.name} has GET/POST exports`, 
        content.includes('export async function'));
      
      // Check for error handling
      validateImplementation(`${route.name} has error handling`, 
        content.includes('try {') && content.includes('catch'));
      
      // Check for proper response types
      validateImplementation(`${route.name} uses proper response types`, 
        content.includes('NextResponse.json'));
      
      // Check for input validation
      if (route.path.includes('pitch') || route.path.includes('lead')) {
        validateImplementation(`${route.name} has input validation`, 
          content.includes('validate') || content.includes('errors'));
      }
    }
  });
}

// Validate Component Implementation
function validateComponents() {
  logSection('Component Implementation Validation');
  
  const components = [
    { path: 'src/components/Hero.tsx', name: 'Hero Component', required: ['CTA', 'scroll'] },
    { path: 'src/components/WhatIDo.tsx', name: 'What I Do Component', required: ['service', 'card'] },
    { path: 'src/components/LiveDemo.tsx', name: 'Live Demo Component', required: ['form', 'pitch', 'loading'] },
    { path: 'src/components/Contact.tsx', name: 'Contact Component', required: ['form', 'validation', 'submit'] },
    { path: 'src/components/ErrorBoundary.tsx', name: 'Error Boundary', required: ['componentDidCatch', 'error'] },
  ];
  
  components.forEach(component => {
    const componentPath = path.join(process.cwd(), component.path);
    if (validateImplementation(`${component.name} exists`, fs.existsSync(componentPath))) {
      const content = fs.readFileSync(componentPath, 'utf8');
      
      // Check for required functionality
      component.required.forEach(requirement => {
        validateImplementation(`${component.name} has ${requirement} functionality`, 
          content.toLowerCase().includes(requirement.toLowerCase()));
      });
      
      // Check for TypeScript
      validateImplementation(`${component.name} is TypeScript`, 
        content.includes('interface') || content.includes('type'));
      
      // Check for proper exports
      validateImplementation(`${component.name} has default export`, 
        content.includes('export default'));
    }
  });
}

// Validate Types and Interfaces
function validateTypes() {
  logSection('Types and Interfaces Validation');
  
  const typesPath = path.join(process.cwd(), 'src/types/index.ts');
  if (validateImplementation('Types file exists', fs.existsSync(typesPath))) {
    const content = fs.readFileSync(typesPath, 'utf8');
    
    const requiredTypes = [
      'PitchRequest',
      'PitchResponse', 
      'LeadRequest',
      'LeadResponse',
      'HealthResponse',
      'ErrorResponse',
      'ServiceCard',
      'ContactForm',
    ];
    
    requiredTypes.forEach(type => {
      validateImplementation(`${type} type defined`, 
        content.includes(`interface ${type}`) || content.includes(`type ${type}`));
    });
    
    // Check for API client
    validateImplementation('API Client implemented', 
      content.includes('class ApiClient') || content.includes('ApiClient'));
  }
}

// Validate Configuration Files
function validateConfiguration() {
  logSection('Configuration Files Validation');
  
  const configFiles = [
    { path: 'next.config.js', name: 'Next.js Config', checks: ['headers', 'images', 'compress'] },
    { path: 'tsconfig.json', name: 'TypeScript Config', checks: ['strict', 'paths'] },
    { path: 'amplify.yml', name: 'Amplify Config', checks: ['build', 'env'] },
    { path: '.env.local.example', name: 'Environment Example', checks: ['NEXT_PUBLIC', 'STAGE'] },
  ];
  
  configFiles.forEach(config => {
    const configPath = path.join(process.cwd(), config.path);
    if (validateImplementation(`${config.name} exists`, fs.existsSync(configPath))) {
      const content = fs.readFileSync(configPath, 'utf8');
      
      config.checks.forEach(check => {
        validateImplementation(`${config.name} has ${check} configuration`, 
          content.toLowerCase().includes(check.toLowerCase()));
      });
    }
  });
}

// Validate Security Implementation
function validateSecurity() {
  logSection('Security Implementation Validation');
  
  const securityPath = path.join(process.cwd(), 'src/lib/security.ts');
  if (validateImplementation('Security utilities exist', fs.existsSync(securityPath))) {
    const content = fs.readFileSync(securityPath, 'utf8');
    
    validateImplementation('Input sanitization implemented', 
      content.includes('sanitize') || content.includes('escape'));
    validateImplementation('Rate limiting utilities', 
      content.includes('rate') || content.includes('limit'));
  }
  
  const middlewarePath = path.join(process.cwd(), 'src/middleware.ts');
  if (validateImplementation('Middleware exists', fs.existsSync(middlewarePath))) {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    
    validateImplementation('Security middleware implemented', 
      content.includes('security') || content.includes('headers'));
  }
}

// Validate Environment Configuration
function validateEnvironment() {
  logSection('Environment Configuration Validation');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_STAGE',
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_SITE_URL',
    'STAGE',
    'TABLE_NAME',
    'RATE_LIMIT_MAX',
    'RATE_LIMIT_WINDOW',
    'AWS_REGION',
    'CORS_ORIGIN',
  ];
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    validateImplementation(`${envVar} is configured`, !!value, value || 'Not set');
  });
  
  // Validate environment utilities
  const envPath = path.join(process.cwd(), 'src/lib/env.ts');
  if (validateImplementation('Environment utilities exist', fs.existsSync(envPath))) {
    const content = fs.readFileSync(envPath, 'utf8');
    
    validateImplementation('Environment validation implemented', 
      content.includes('validate'));
    validateImplementation('Stage detection implemented', 
      content.includes('getStage'));
  }
}

// Validate Build and Performance
function validateBuildAndPerformance() {
  logSection('Build and Performance Validation');
  
  // Check build directory
  const buildDir = path.join(process.cwd(), '.next');
  validateImplementation('Build directory exists', fs.existsSync(buildDir));
  
  // Check performance scripts
  const perfScripts = [
    'scripts/performance-audit.js',
    'scripts/e2e-test.js',
    'scripts/deployment-readiness.js',
  ];
  
  perfScripts.forEach(script => {
    const scriptPath = path.join(process.cwd(), script);
    validateImplementation(`${script} exists`, fs.existsSync(scriptPath));
  });
  
  // Check package.json scripts
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    const requiredScripts = ['build', 'start', 'dev', 'validate:env', 'perf:audit', 'test:e2e'];
    requiredScripts.forEach(script => {
      validateImplementation(`${script} script exists`, !!scripts[script]);
    });
  }
}

// Validate Documentation
function validateDocumentation() {
  logSection('Documentation Validation');
  
  const docFiles = [
    { path: 'README.md', name: 'README', checks: ['setup', 'install', 'deploy'] },
    { path: 'CHANGELOG.md', name: 'Changelog', checks: ['version', '1.0.0'] },
    { path: 'docs/environment-setup.md', name: 'Environment Setup', checks: ['amplify', 'env'] },
  ];
  
  docFiles.forEach(doc => {
    const docPath = path.join(process.cwd(), doc.path);
    if (validateImplementation(`${doc.name} exists`, fs.existsSync(docPath))) {
      const content = fs.readFileSync(docPath, 'utf8');
      
      doc.checks.forEach(check => {
        validateImplementation(`${doc.name} includes ${check} information`, 
          content.toLowerCase().includes(check.toLowerCase()));
      });
    }
  });
}

// Test API Route Logic (without server)
function validateApiLogic() {
  logSection('API Route Logic Validation');
  
  // Test pitch API validation logic
  const pitchPath = path.join(process.cwd(), 'src/app/api/pitch/route.ts');
  if (fs.existsSync(pitchPath)) {
    const content = fs.readFileSync(pitchPath, 'utf8');
    
    validateImplementation('Pitch API validates role', 
      content.includes('validRoles') && content.includes('recruiter'));
    validateImplementation('Pitch API validates focus', 
      content.includes('validFocuses') && content.includes('ai'));
    validateImplementation('Pitch API handles Lambda URL', 
      content.includes('PITCH_LAMBDA_URL'));
    validateImplementation('Pitch API handles rate limiting', 
      content.includes('429'));
  }
  
  // Test lead API validation logic
  const leadPath = path.join(process.cwd(), 'src/app/api/lead/route.ts');
  if (fs.existsSync(leadPath)) {
    const content = fs.readFileSync(leadPath, 'utf8');
    
    validateImplementation('Lead API validates name', 
      content.includes('name') && content.includes('2'));
    validateImplementation('Lead API validates email', 
      content.includes('email') && content.includes('@'));
    validateImplementation('Lead API validates message length', 
      content.includes('message') && content.includes('10'));
    validateImplementation('Lead API sanitizes input', 
      content.includes('trim') && content.includes('toLowerCase'));
  }
  
  // Test health API
  const healthPath = path.join(process.cwd(), 'src/app/api/health/route.ts');
  if (fs.existsSync(healthPath)) {
    const content = fs.readFileSync(healthPath, 'utf8');
    
    validateImplementation('Health API returns version', 
      content.includes('version'));
    validateImplementation('Health API returns timestamp', 
      content.includes('timestamp'));
    validateImplementation('Health API handles fallback', 
      content.includes('!lambdaUrl'));
  }
}

// Generate comprehensive report
function generateReport() {
  logSection('Implementation Validation Report');
  
  const total = results.passed + results.failed;
  const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
  
  log(`📊 Implementation Results:`, 'bright');
  log(`   Total Checks: ${total}`, 'cyan');
  log(`   Passed: ${results.passed}`, 'green');
  log(`   Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'cyan');
  log(`   Success Rate: ${successRate}%`, successRate >= 95 ? 'green' : successRate >= 85 ? 'yellow' : 'red');
  
  if (results.failed > 0) {
    log(`\n❌ Failed Checks:`, 'red');
    results.errors.forEach(error => log(`   - ${error}`, 'red'));
  }
  
  // Implementation completeness assessment
  const isComplete = results.failed === 0 && successRate >= 90;
  
  if (isComplete) {
    log(`\n🎉 IMPLEMENTATION COMPLETE!`, 'green');
    log(`   All required functionality is properly implemented.`, 'green');
  } else {
    log(`\n⚠️  IMPLEMENTATION INCOMPLETE`, 'red');
    log(`   Some required functionality is missing or incomplete.`, 'red');
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    complete: isComplete,
    summary: {
      total,
      passed: results.passed,
      failed: results.failed,
      successRate: parseFloat(successRate),
    },
    errors: results.errors,
    details: results.details,
  };
  
  const reportPath = path.join(process.cwd(), 'implementation-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  
  return isComplete;
}

// Main execution
function main() {
  log('🔍 Implementation Validation Check', 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan');
  
  try {
    validateApiRoutes();
    validateComponents();
    validateTypes();
    validateConfiguration();
    validateSecurity();
    validateEnvironment();
    validateBuildAndPerformance();
    validateDocumentation();
    validateApiLogic();
    
    const isComplete = generateReport();
    process.exit(isComplete ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Validation failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };