#!/usr/bin/env node

/**
 * Deployment Readiness Check
 * 
 * This script validates that the application is ready for production deployment
 * by checking build quality, configuration, and essential files.
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
  warningCount: 0,
  errors: [],
  warnings: [],
};

function checkPassed(name, condition, details = '') {
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
  return condition;
}

function checkWarning(name, condition, details = '') {
  if (condition) {
    results.warningCount++;
    results.warnings.push(name);
    log(`⚠️  ${name}`, 'yellow');
    if (details) log(`   ${details}`, 'yellow');
  }
  return condition;
}

// Check 1: Build Quality
function checkBuildQuality() {
  logSection('Build Quality Checks');
  
  const buildDir = path.join(process.cwd(), '.next');
  checkPassed('Build directory exists', fs.existsSync(buildDir));
  
  const buildManifest = path.join(buildDir, 'build-manifest.json');
  if (checkPassed('Build manifest exists', fs.existsSync(buildManifest))) {
    try {
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      checkPassed('Build manifest is valid JSON', typeof manifest === 'object');
      checkPassed('Build manifest has pages', manifest.pages && Object.keys(manifest.pages).length > 0);
    } catch (error) {
      checkPassed('Build manifest is readable', false, error.message);
    }
  }
  
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    const chunksDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(chunksDir)) {
      const chunks = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'));
      checkPassed('JavaScript chunks generated', chunks.length > 0, `${chunks.length} chunks found`);
      
      // Check bundle sizes
      let totalSize = 0;
      let largeChunks = 0;
      
      chunks.forEach(chunk => {
        const chunkPath = path.join(chunksDir, chunk);
        const stats = fs.statSync(chunkPath);
        const sizeKB = Math.round(stats.size / 1024);
        totalSize += sizeKB;
        
        if (sizeKB > 500) largeChunks++;
      });
      
      // Adjust limit based on Next.js framework overhead
      const sizeLimit = 5000; // 5MB is reasonable for Next.js apps with framework code
      checkPassed('Total bundle size reasonable', totalSize < sizeLimit, `${totalSize}KB total`);
      checkWarning('Large chunks detected', largeChunks > 0, `${largeChunks} chunks > 500KB`);
    }
  }
}

// Check 2: Essential Files
function checkEssentialFiles() {
  logSection('Essential Files Check');
  
  const essentialFiles = [
    { path: 'package.json', name: 'Package configuration' },
    { path: 'next.config.js', name: 'Next.js configuration' },
    { path: 'tsconfig.json', name: 'TypeScript configuration' },
    { path: 'postcss.config.mjs', name: 'PostCSS/Tailwind configuration' },
    { path: '.env.local.example', name: 'Environment example' },
    { path: 'README.md', name: 'Documentation' },
    { path: 'CHANGELOG.md', name: 'Changelog' },
    { path: 'amplify.yml', name: 'Amplify build config' },
  ];
  
  essentialFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    checkPassed(file.name, fs.existsSync(filePath), file.path);
  });
  
  // Check public assets
  const publicFiles = [
    { path: 'public/favicon.svg', name: 'Favicon' },
    { path: 'public/manifest.json', name: 'Web manifest' },
  ];
  
  publicFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    checkPassed(file.name, fs.existsSync(filePath), file.path);
  });
}

// Check 3: Environment Configuration
function checkEnvironmentConfig() {
  logSection('Environment Configuration');
  
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
    checkPassed(`${envVar} is set`, !!value, value ? `${envVar}=${value}` : 'Not set');
  });
  
  // Validate environment values
  const stage = process.env.NEXT_PUBLIC_STAGE;
  checkPassed('Valid stage', ['dev', 'staging', 'prod'].includes(stage), `Stage: ${stage}`);
  
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '0');
  checkPassed('Valid rate limit', rateLimitMax > 0 && rateLimitMax <= 100, `Rate limit: ${rateLimitMax}`);
  
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW || '0');
  checkPassed('Valid rate limit window', rateLimitWindow >= 60, `Window: ${rateLimitWindow}s`);
}

// Check 4: Code Quality
function checkCodeQuality() {
  logSection('Code Quality Checks');
  
  // Check TypeScript configuration
  const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
  if (fs.existsSync(tsconfigPath)) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      checkPassed('TypeScript strict mode', tsconfig.compilerOptions?.strict === true);
      checkPassed('TypeScript target modern', ['ES2017', 'ES2018', 'ES2019', 'ES2020', 'ES2021', 'ES2022', 'ESNext'].includes(tsconfig.compilerOptions?.target));
    } catch (error) {
      checkPassed('TypeScript config readable', false, error.message);
    }
  }
  
  // Check ESLint configuration
  const eslintConfigPath = path.join(process.cwd(), 'eslint.config.mjs');
  checkPassed('ESLint configuration exists', fs.existsSync(eslintConfigPath));
  
  // Check Prettier configuration
  const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
  checkPassed('Prettier configuration exists', fs.existsSync(prettierConfigPath));
  
  // Check for common source directories
  const srcDirs = ['src/app', 'src/components', 'src/lib', 'src/types'];
  srcDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);
    checkPassed(`${dir} directory exists`, fs.existsSync(dirPath));
  });
}

// Check 5: Security Configuration
function checkSecurityConfig() {
  logSection('Security Configuration');
  
  // Check Next.js config for security headers
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    checkPassed('Security headers configured', configContent.includes('X-Frame-Options'));
    checkPassed('Content type protection', configContent.includes('X-Content-Type-Options'));
    checkPassed('Referrer policy set', configContent.includes('Referrer-Policy'));
    checkPassed('Permissions policy set', configContent.includes('Permissions-Policy'));
    checkPassed('CORS configuration', configContent.includes('CORS_ORIGIN'));
  }
  
  // Check for security-related files
  const securityFiles = [
    { path: 'src/lib/security.ts', name: 'Security utilities' },
    { path: 'src/middleware.ts', name: 'Security middleware' },
  ];
  
  securityFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file.path);
    checkPassed(file.name, fs.existsSync(filePath), file.path);
  });
}

// Check 6: Performance Configuration
function checkPerformanceConfig() {
  logSection('Performance Configuration');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    checkPassed('Image optimization configured', configContent.includes('images:'));
    checkPassed('Compression enabled', configContent.includes('compress: true'));
    checkPassed('Cache headers configured', configContent.includes('Cache-Control'));
    checkPassed('Bundle optimization', configContent.includes('splitChunks'));
  }
  
  // Check for performance monitoring scripts
  const perfScripts = [
    'scripts/performance-audit.js',
    'scripts/e2e-test.js',
  ];
  
  perfScripts.forEach(script => {
    const scriptPath = path.join(process.cwd(), script);
    checkPassed(`${script} exists`, fs.existsSync(scriptPath));
  });
}

// Check 7: Deployment Configuration
function checkDeploymentConfig() {
  logSection('Deployment Configuration');
  
  // Check Amplify configuration
  const amplifyConfigPath = path.join(process.cwd(), 'amplify.yml');
  if (fs.existsSync(amplifyConfigPath)) {
    const amplifyConfig = fs.readFileSync(amplifyConfigPath, 'utf8');
    checkPassed('Amplify build commands configured', amplifyConfig.includes('npm run build'));
    checkPassed('Amplify environment injection', amplifyConfig.includes('build-env-injection'));
  }
  
  // Check package.json scripts
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const scripts = packageJson.scripts || {};
    
    checkPassed('Build script exists', !!scripts.build);
    checkPassed('Start script exists', !!scripts.start);
    checkPassed('Environment validation script', !!scripts['validate:env']);
    checkPassed('Performance audit script', !!scripts['perf:audit']);
  }
  
  // Check for deployment documentation
  const docsDir = path.join(process.cwd(), 'docs');
  if (fs.existsSync(docsDir)) {
    const docFiles = fs.readdirSync(docsDir);
    checkPassed('Deployment documentation exists', docFiles.some(f => f.includes('amplify') || f.includes('deploy')));
  }
}

// Generate final report
function generateReport() {
  logSection('Deployment Readiness Report');
  
  const total = results.passed + results.failed;
  const successRate = total > 0 ? (results.passed / total * 100).toFixed(1) : 0;
  
  log(`📊 Overall Results:`, 'bright');
  log(`   Total Checks: ${total}`, 'cyan');
  log(`   Passed: ${results.passed}`, 'green');
  log(`   Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'cyan');
  log(`   Warnings: ${results.warningCount}`, results.warningCount > 0 ? 'yellow' : 'cyan');
  log(`   Success Rate: ${successRate}%`, successRate >= 95 ? 'green' : successRate >= 85 ? 'yellow' : 'red');
  
  if (results.failed > 0) {
    log(`\n❌ Failed Checks:`, 'red');
    results.errors.forEach(error => log(`   - ${error}`, 'red'));
  }
  
  if (results.warnings.length > 0) {
    log(`\n⚠️  Warnings:`, 'yellow');
    results.warnings.forEach(warning => log(`   - ${warning}`, 'yellow'));
  }
  
  // Deployment readiness assessment
  const isReady = results.failed === 0 && successRate >= 90;
  
  if (isReady) {
    log(`\n🚀 DEPLOYMENT READY!`, 'green');
    log(`   The application passes all critical checks and is ready for production deployment.`, 'green');
  } else {
    log(`\n⚠️  NOT READY FOR DEPLOYMENT`, 'red');
    log(`   Please fix the failed checks before deploying to production.`, 'red');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    ready: isReady,
    summary: {
      total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warningCount,
      successRate: parseFloat(successRate),
    },
    errors: results.errors,
    warnings: results.warnings,
  };
  
  const reportPath = path.join(process.cwd(), 'deployment-readiness-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 Detailed report saved to: ${reportPath}`, 'cyan');
  
  return isReady;
}

// Main execution
function main() {
  log('🔍 Deployment Readiness Check', 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan');
  
  try {
    checkBuildQuality();
    checkEssentialFiles();
    checkEnvironmentConfig();
    checkCodeQuality();
    checkSecurityConfig();
    checkPerformanceConfig();
    checkDeploymentConfig();
    
    const isReady = generateReport();
    process.exit(isReady ? 0 : 1);
    
  } catch (error) {
    log(`\n💥 Readiness check failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };