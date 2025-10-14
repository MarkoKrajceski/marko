#!/usr/bin/env node

/**
 * Lambda URL Extraction Script
 * 
 * This script extracts Lambda function URLs from amplify_outputs.json
 * and sets them as environment variables during the build process.
 * 
 * Usage:
 *   node scripts/extract-lambda-urls.js
 */

const fs = require('fs');
const path = require('path');

function extractLambdaUrls() {
  const outputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  
  if (!fs.existsSync(outputsPath)) {
    console.log('⚠️  amplify_outputs.json not found - Lambda URLs will not be available');
    return {};
  }

  try {
    const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
    
    const lambdaUrls = {
      PITCH_LAMBDA_URL: outputs.custom?.pitchFunctionUrl || '',
      LEAD_LAMBDA_URL: outputs.custom?.leadFunctionUrl || '',
      HEALTH_LAMBDA_URL: outputs.custom?.healthFunctionUrl || '',
    };

    console.log('🔗 Extracted Lambda URLs:');
    for (const [name, url] of Object.entries(lambdaUrls)) {
      if (url) {
        console.log(`   - ${name}: ${url}`);
      } else {
        console.log(`   - ${name}: Not available`);
      }
    }

    return lambdaUrls;
  } catch (error) {
    console.error('❌ Failed to extract Lambda URLs:', error.message);
    return {};
  }
}

// Export environment variables if running as main script
if (require.main === module) {
  const urls = extractLambdaUrls();
  
  // Output as shell export commands for use in build scripts
  for (const [name, url] of Object.entries(urls)) {
    if (url) {
      console.log(`export ${name}="${url}"`);
    }
  }
}

module.exports = { extractLambdaUrls };