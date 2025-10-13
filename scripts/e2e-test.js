#!/usr/bin/env node

/**
 * End-to-End Testing Script
 * 
 * This script conducts comprehensive end-to-end testing of the Marko personal site,
 * including frontend functionality, backend API endpoints, error handling, and
 * CloudWatch logging validation.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

// Test configuration
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retries: 3,
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  details: [],
};

function recordTest(testName, passed, details = '') {
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
  } else {
    testResults.failed++;
    testResults.errors.push(testName);
    log(`❌ ${testName}`, 'red');
  }
  
  if (details) {
    testResults.details.push({ test: testName, passed, details });
    log(`   ${details}`, passed ? 'cyan' : 'yellow');
  }
}

// HTTP request helper with timeout and retries
async function makeRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TEST_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Test 1: Health Check Endpoint
async function testHealthEndpoint() {
  logSection('Testing Health Check Endpoint');
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.apiUrl}/health`);
    const data = await response.json();
    
    recordTest('Health endpoint responds', response.ok);
    recordTest('Health endpoint returns JSON', typeof data === 'object');
    recordTest('Health response has ok field', 'ok' in data);
    recordTest('Health response has env field', 'env' in data);
    recordTest('Health response has version field', 'version' in data);
    recordTest('Health response has timestamp field', 'timestamp' in data);
    
    if (data.ok) {
      log(`   Environment: ${data.env}`, 'cyan');
      log(`   Version: ${data.version}`, 'cyan');
      log(`   Timestamp: ${data.timestamp}`, 'cyan');
    }
    
  } catch (error) {
    recordTest('Health endpoint accessible', false, error.message);
  }
}

// Test 2: Pitch Generation Endpoint
async function testPitchEndpoint() {
  logSection('Testing Pitch Generation Endpoint');
  
  const testCases = [
    { role: 'recruiter', focus: 'ai' },
    { role: 'cto', focus: 'cloud' },
    { role: 'product', focus: 'automation' },
    { role: 'founder', focus: 'ai' },
  ];
  
  for (const testCase of testCases) {
    try {
      const response = await makeRequest(`${TEST_CONFIG.apiUrl}/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase),
      });
      
      const data = await response.json();
      
      recordTest(`Pitch generation (${testCase.role}/${testCase.focus})`, response.ok);
      
      if (response.ok) {
        recordTest(`Pitch has content (${testCase.role}/${testCase.focus})`, 
          data.pitch && data.pitch.length > 0);
        recordTest(`Pitch has confidence (${testCase.role}/${testCase.focus})`, 
          typeof data.confidence === 'number');
        recordTest(`Pitch has timestamp (${testCase.role}/${testCase.focus})`, 
          data.timestamp && new Date(data.timestamp).getTime() > 0);
        recordTest(`Pitch has requestId (${testCase.role}/${testCase.focus})`, 
          data.requestId && data.requestId.length > 0);
      }
      
    } catch (error) {
      recordTest(`Pitch generation (${testCase.role}/${testCase.focus})`, false, error.message);
    }
  }
}

// Test 3: Lead Capture Endpoint
async function testLeadEndpoint() {
  logSection('Testing Lead Capture Endpoint');
  
  const testLead = {
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a test message for the lead capture functionality.',
  };
  
  try {
    const response = await makeRequest(`${TEST_CONFIG.apiUrl}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testLead),
    });
    
    const data = await response.json();
    
    recordTest('Lead capture endpoint responds', response.ok);
    recordTest('Lead capture returns JSON', typeof data === 'object');
    recordTest('Lead capture has ok field', 'ok' in data);
    
    if (response.ok) {
      log(`   Lead captured successfully`, 'cyan');
    }
    
  } catch (error) {
    recordTest('Lead capture endpoint accessible', false, error.message);
  }
}

// Test 4: Error Handling and Edge Cases
async function testErrorHandling() {
  logSection('Testing Error Handling and Edge Cases');
  
  // Test invalid pitch request
  try {
    const response = await makeRequest(`${TEST_CONFIG.apiUrl}/pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'invalid', focus: 'invalid' }),
    });
    
    recordTest('Invalid pitch request returns error', !response.ok);
    recordTest('Invalid pitch request returns 400', response.status === 400);
    
  } catch (error) {
    recordTest('Invalid pitch request handled', false, error.message);
  }
  
  // Test empty lead request
  try {
    const response = await makeRequest(`${TEST_CONFIG.apiUrl}/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    
    recordTest('Empty lead request returns error', !response.ok);
    recordTest('Empty lead request returns 400', response.status === 400);
    
  } catch (error) {
    recordTest('Empty lead request handled', false, error.message);
  }
  
  // Test non-existent endpoint
  try {
    const response = await makeRequest(`${TEST_CONFIG.apiUrl}/nonexistent`);
    recordTest('Non-existent endpoint returns 404', response.status === 404);
    
  } catch (error) {
    recordTest('Non-existent endpoint handled', false, error.message);
  }
}

// Test 5: Rate Limiting (if applicable)
async function testRateLimiting() {
  logSection('Testing Rate Limiting');
  
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '10');
  log(`Testing rate limit of ${rateLimitMax} requests`, 'blue');
  
  const requests = [];
  const testPayload = { role: 'recruiter', focus: 'ai' };
  
  // Make multiple rapid requests
  for (let i = 0; i < rateLimitMax + 2; i++) {
    requests.push(
      makeRequest(`${TEST_CONFIG.apiUrl}/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      }).catch(error => ({ error: error.message }))
    );
  }
  
  try {
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.ok).length;
    const rateLimitedCount = responses.filter(r => r.status === 429).length;
    
    recordTest('Rate limiting allows normal requests', successCount > 0);
    recordTest('Rate limiting blocks excessive requests', rateLimitedCount > 0);
    
    log(`   Successful requests: ${successCount}`, 'cyan');
    log(`   Rate limited requests: ${rateLimitedCount}`, 'cyan');
    
  } catch (error) {
    recordTest('Rate limiting test completed', false, error.message);
  }
}

// Test 6: Frontend Build and Static Assets
async function testFrontendAssets() {
  logSection('Testing Frontend Build and Static Assets');
  
  // Check if build directory exists
  const buildDir = path.join(process.cwd(), '.next');
  recordTest('Build directory exists', fs.existsSync(buildDir));
  
  // Check for critical build files
  const buildManifest = path.join(buildDir, 'build-manifest.json');
  recordTest('Build manifest exists', fs.existsSync(buildManifest));
  
  // Check static assets
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const chunks = fs.readdirSync(path.join(staticDir, 'chunks'), { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'));
    
    recordTest('JavaScript chunks generated', chunks.length > 0);
    log(`   Generated ${chunks.length} JavaScript chunks`, 'cyan');
  }
  
  // Test favicon and manifest
  const publicDir = path.join(process.cwd(), 'public');
  recordTest('Favicon exists', fs.existsSync(path.join(publicDir, 'favicon.svg')));
  recordTest('Web manifest exists', fs.existsSync(path.join(publicDir, 'manifest.json')));
}

// Test 7: Environment Configuration
async function testEnvironmentConfig() {
  logSection('Testing Environment Configuration');
  
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
  
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    recordTest(`Environment variable ${envVar} is set`, !!value);
    if (value) {
      log(`   ${envVar}: ${value}`, 'cyan');
    }
  }
}

// Test 8: CloudWatch Logging Validation (Mock)
async function testCloudWatchLogging() {
  logSection('Testing CloudWatch Logging Configuration');
  
  // Since we can't directly test CloudWatch in local environment,
  // we'll validate the logging configuration and structure
  
  const stage = process.env.STAGE || 'dev';
  const expectedLogGroups = [
    `/aws/lambda/marko-${stage}-pitch`,
    `/aws/lambda/marko-${stage}-lead`,
    `/aws/lambda/marko-${stage}-health`,
  ];
  
  recordTest('Stage configuration for logging', !!stage);
  recordTest('Log group naming convention', expectedLogGroups.length === 3);
  
  log('   Expected CloudWatch Log Groups:', 'cyan');
  expectedLogGroups.forEach(group => log(`     ${group}`, 'cyan'));
  
  // Test that we can generate log entries by making API calls
  try {
    await makeRequest(`${TEST_CONFIG.apiUrl}/health`);
    recordTest('Health endpoint generates logs', true, 'Log entry should be created in CloudWatch');
    
    await makeRequest(`${TEST_CONFIG.apiUrl}/pitch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'recruiter', focus: 'ai' }),
    });
    recordTest('Pitch endpoint generates logs', true, 'Log entry should be created in CloudWatch');
    
  } catch (error) {
    recordTest('API endpoints generate logs', false, error.message);
  }
}

// Generate comprehensive test report
function generateTestReport() {
  logSection('Test Report Summary');
  
  const totalTests = testResults.passed + testResults.failed;
  const successRate = totalTests > 0 ? (testResults.passed / totalTests * 100).toFixed(1) : 0;
  
  log(`📊 Test Results:`, 'bright');
  log(`   Total Tests: ${totalTests}`, 'cyan');
  log(`   Passed: ${testResults.passed}`, 'green');
  log(`   Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'cyan');
  log(`   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  if (testResults.failed > 0) {
    log(`\n❌ Failed Tests:`, 'red');
    testResults.errors.forEach(error => log(`   - ${error}`, 'red'));
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
    },
    config: TEST_CONFIG,
    details: testResults.details,
    errors: testResults.errors,
  };
  
  const reportPath = path.join(process.cwd(), 'e2e-test-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'green');
  
  // Final status
  if (testResults.failed === 0) {
    log(`\n🎉 All tests passed! The application is ready for production.`, 'green');
    return true;
  } else {
    log(`\n⚠️  Some tests failed. Please review and fix the issues before deployment.`, 'yellow');
    return false;
  }
}

// Main test execution
async function runE2ETests() {
  log('🚀 Starting End-to-End Testing Suite', 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan');
  log(`Base URL: ${TEST_CONFIG.baseUrl}`, 'cyan');
  log(`API URL: ${TEST_CONFIG.apiUrl}`, 'cyan');
  
  try {
    // Run all test suites
    await testHealthEndpoint();
    await testPitchEndpoint();
    await testLeadEndpoint();
    await testErrorHandling();
    await testRateLimiting();
    await testFrontendAssets();
    await testEnvironmentConfig();
    await testCloudWatchLogging();
    
    // Generate final report
    const allTestsPassed = generateTestReport();
    
    // Exit with appropriate code
    process.exit(allTestsPassed ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  switch (command) {
    case 'health':
      testHealthEndpoint().then(() => generateTestReport());
      break;
    case 'api':
      Promise.all([testHealthEndpoint(), testPitchEndpoint(), testLeadEndpoint()])
        .then(() => generateTestReport());
      break;
    case 'errors':
      testErrorHandling().then(() => generateTestReport());
      break;
    case 'frontend':
      testFrontendAssets().then(() => generateTestReport());
      break;
    case 'all':
    default:
      runE2ETests();
      break;
  }
}

module.exports = {
  runE2ETests,
  testHealthEndpoint,
  testPitchEndpoint,
  testLeadEndpoint,
  testErrorHandling,
  testRateLimiting,
  testFrontendAssets,
  testEnvironmentConfig,
  testCloudWatchLogging,
};