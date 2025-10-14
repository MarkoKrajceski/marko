#!/usr/bin/env node

/**
 * Sync Lambda URLs to Local Environment
 * 
 * This script extracts Lambda function URLs from amplify_outputs.json
 * and updates the .env.local file for local development.
 * 
 * Usage:
 *   npm run sync:lambda-urls
 */

const fs = require('fs');
const path = require('path');

function syncLambdaUrls() {
  const outputsPath = path.join(process.cwd(), 'amplify_outputs.json');
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(outputsPath)) {
    console.error('❌ amplify_outputs.json not found');
    console.log('💡 Run "npx ampx generate outputs" to generate the outputs file');
    process.exit(1);
  }

  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    console.log('💡 Copy .env.local.example to .env.local first');
    process.exit(1);
  }

  try {
    // Read amplify outputs
    const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
    
    const lambdaUrls = {
      PITCH_LAMBDA_URL: outputs.custom?.pitchFunctionUrl || '',
      LEAD_LAMBDA_URL: outputs.custom?.leadFunctionUrl || '',
      HEALTH_LAMBDA_URL: outputs.custom?.healthFunctionUrl || '',
    };

    // Check if URLs are available
    const missingUrls = Object.entries(lambdaUrls).filter(([_, url]) => !url);
    if (missingUrls.length > 0) {
      console.error('❌ Some Lambda URLs are missing from amplify_outputs.json:');
      missingUrls.forEach(([name]) => console.log(`   - ${name}`));
      console.log('💡 Deploy your backend first: npx ampx pipeline-deploy');
      process.exit(1);
    }

    // Read current .env.local
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update Lambda URLs in .env.local
    for (const [name, url] of Object.entries(lambdaUrls)) {
      const regex = new RegExp(`^${name}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${name}=${url}`);
        console.log(`✅ Updated ${name}`);
      } else {
        console.warn(`⚠️  ${name} not found in .env.local`);
      }
    }

    // Write updated .env.local
    fs.writeFileSync(envPath, envContent);

    console.log('');
    console.log('🎉 Lambda URLs synced to .env.local successfully!');
    console.log('');
    console.log('🔗 Current Lambda URLs:');
    for (const [name, url] of Object.entries(lambdaUrls)) {
      console.log(`   - ${name}: ${url}`);
    }
    console.log('');
    console.log('💡 Restart your development server to use the updated URLs');

  } catch (error) {
    console.error('❌ Failed to sync Lambda URLs:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  syncLambdaUrls();
}

module.exports = { syncLambdaUrls };