#!/usr/bin/env node

/**
 * Performance Audit Script
 * 
 * This script runs various performance checks and optimizations
 * for the Marko personal site project.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`${title}`, 'bright');
  log(`${'='.repeat(50)}`, 'cyan');
}

function checkBundleSize() {
  logSection('Bundle Size Analysis');
  
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    log('❌ Build directory not found. Run "npm run build" first.', 'red');
    return false;
  }

  try {
    // Check if build was successful
    const buildManifest = path.join(buildDir, 'build-manifest.json');
    if (fs.existsSync(buildManifest)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));
      log('✅ Build manifest found', 'green');
      
      // Analyze bundle sizes
      const staticDir = path.join(buildDir, 'static');
      if (fs.existsSync(staticDir)) {
        const chunks = fs.readdirSync(path.join(staticDir, 'chunks'), { withFileTypes: true })
          .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
          .map(dirent => {
            const filePath = path.join(staticDir, 'chunks', dirent.name);
            const stats = fs.statSync(filePath);
            return {
              name: dirent.name,
              size: stats.size,
              sizeKB: Math.round(stats.size / 1024 * 100) / 100
            };
          })
          .sort((a, b) => b.size - a.size);

        log('\n📦 Largest JavaScript chunks:', 'yellow');
        chunks.slice(0, 10).forEach(chunk => {
          const sizeColor = chunk.sizeKB > 100 ? 'red' : chunk.sizeKB > 50 ? 'yellow' : 'green';
          log(`  ${chunk.name}: ${chunk.sizeKB}KB`, sizeColor);
        });

        const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
        const totalSizeKB = Math.round(totalSize / 1024 * 100) / 100;
        log(`\n📊 Total JavaScript size: ${totalSizeKB}KB`, totalSizeKB > 500 ? 'red' : 'green');
      }
    }
    
    return true;
  } catch (error) {
    log(`❌ Error analyzing bundle: ${error.message}`, 'red');
    return false;
  }
}

function checkImageOptimization() {
  logSection('Image Optimization Check');
  
  const publicDir = path.join(process.cwd(), 'public');
  
  if (!fs.existsSync(publicDir)) {
    log('❌ Public directory not found', 'red');
    return false;
  }

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  const images = [];

  function scanDirectory(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (imageExtensions.some(ext => item.name.toLowerCase().endsWith(ext))) {
        const stats = fs.statSync(fullPath);
        images.push({
          name: item.name,
          path: path.relative(publicDir, fullPath),
          size: stats.size,
          sizeKB: Math.round(stats.size / 1024 * 100) / 100,
          extension: path.extname(item.name).toLowerCase()
        });
      }
    }
  }

  scanDirectory(publicDir);

  if (images.length === 0) {
    log('ℹ️  No images found in public directory', 'yellow');
    return true;
  }

  log(`\n🖼️  Found ${images.length} images:`, 'blue');
  
  images.sort((a, b) => b.size - a.size).forEach(image => {
    const sizeColor = image.sizeKB > 500 ? 'red' : image.sizeKB > 100 ? 'yellow' : 'green';
    const formatColor = ['.webp', '.avif'].includes(image.extension) ? 'green' : 'yellow';
    log(`  ${image.path}: ${image.sizeKB}KB (${image.extension})`, sizeColor);
  });

  const totalImageSize = images.reduce((sum, img) => sum + img.size, 0);
  const totalImageSizeKB = Math.round(totalImageSize / 1024 * 100) / 100;
  log(`\n📊 Total image size: ${totalImageSizeKB}KB`, totalImageSize > 1024 * 1024 ? 'red' : 'green');

  // Check for modern formats
  const modernFormats = images.filter(img => ['.webp', '.avif'].includes(img.extension));
  const legacyFormats = images.filter(img => ['.jpg', '.jpeg', '.png'].includes(img.extension));
  
  if (legacyFormats.length > 0 && modernFormats.length === 0) {
    log('⚠️  Consider using modern image formats (WebP, AVIF) for better compression', 'yellow');
  } else if (modernFormats.length > 0) {
    log('✅ Using modern image formats', 'green');
  }

  return true;
}

function checkCacheHeaders() {
  logSection('Cache Configuration Check');
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    log('❌ next.config.js not found', 'red');
    return false;
  }

  try {
    const configContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Check for cache headers
    if (configContent.includes('Cache-Control')) {
      log('✅ Cache-Control headers configured', 'green');
    } else {
      log('⚠️  Cache-Control headers not found', 'yellow');
    }

    // Check for static asset caching
    if (configContent.includes('max-age=31536000')) {
      log('✅ Long-term caching for static assets configured', 'green');
    } else {
      log('⚠️  Long-term caching for static assets not configured', 'yellow');
    }

    // Check for compression
    if (configContent.includes('compress: true')) {
      log('✅ Compression enabled', 'green');
    } else {
      log('⚠️  Compression not explicitly enabled', 'yellow');
    }

    return true;
  } catch (error) {
    log(`❌ Error reading next.config.js: ${error.message}`, 'red');
    return false;
  }
}

function runLighthouseAudit() {
  logSection('Lighthouse Performance Audit');
  
  log('ℹ️  To run Lighthouse audit:', 'blue');
  log('  1. Start the production server: npm run build && npm start', 'cyan');
  log('  2. Run Lighthouse: npx lighthouse http://localhost:3000 --output=html --output-path=./lighthouse-report.html', 'cyan');
  log('  3. Or use Chrome DevTools > Lighthouse tab', 'cyan');
  
  return true;
}

function generatePerformanceReport() {
  logSection('Performance Report Summary');
  
  const report = {
    timestamp: new Date().toISOString(),
    checks: {
      bundleSize: checkBundleSize(),
      imageOptimization: checkImageOptimization(),
      cacheHeaders: checkCacheHeaders(),
    }
  };

  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📄 Performance report saved to: ${reportPath}`, 'green');
  
  const passedChecks = Object.values(report.checks).filter(Boolean).length;
  const totalChecks = Object.keys(report.checks).length;
  
  log(`\n📊 Performance Score: ${passedChecks}/${totalChecks} checks passed`, 
    passedChecks === totalChecks ? 'green' : 'yellow');

  if (passedChecks === totalChecks) {
    log('🎉 All performance checks passed!', 'green');
  } else {
    log('⚠️  Some performance optimizations needed', 'yellow');
  }

  return report;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  log('🚀 Marko Site Performance Audit', 'bright');
  log(`Timestamp: ${new Date().toISOString()}`, 'cyan');

  switch (command) {
    case 'bundle':
      checkBundleSize();
      break;
    case 'images':
      checkImageOptimization();
      break;
    case 'cache':
      checkCacheHeaders();
      break;
    case 'lighthouse':
      runLighthouseAudit();
      break;
    case 'all':
    default:
      generatePerformanceReport();
      runLighthouseAudit();
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkBundleSize,
  checkImageOptimization,
  checkCacheHeaders,
  runLighthouseAudit,
  generatePerformanceReport,
};