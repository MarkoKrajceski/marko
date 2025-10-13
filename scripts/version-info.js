#!/usr/bin/env node

/**
 * Version Information Script
 * 
 * This script provides version information for the application,
 * including build metadata and deployment information.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read package.json for version information
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get Git information
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const shortHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const lastCommitDate = execSync('git log -1 --format=%ci', { encoding: 'utf8' }).trim();
    const lastCommitMessage = execSync('git log -1 --format=%s', { encoding: 'utf8' }).trim();
    
    return {
      commitHash,
      shortHash,
      branch,
      lastCommitDate,
      lastCommitMessage
    };
  } catch (error) {
    console.warn('Warning: Could not retrieve Git information:', error.message);
    return {
      commitHash: 'unknown',
      shortHash: 'unknown',
      branch: 'unknown',
      lastCommitDate: 'unknown',
      lastCommitMessage: 'unknown'
    };
  }
}

// Get build information
function getBuildInfo() {
  const buildTime = new Date().toISOString();
  const nodeVersion = process.version;
  const platform = process.platform;
  const arch = process.arch;
  
  return {
    buildTime,
    nodeVersion,
    platform,
    arch
  };
}

// Get environment information
function getEnvironmentInfo() {
  const stage = process.env.STAGE || process.env.NEXT_PUBLIC_STAGE || 'development';
  const amplifyAppId = process.env.AMPLIFY_APP_ID || 'local';
  const amplifyBranch = process.env.AMPLIFY_BRANCH || 'local';
  const amplifyCommitId = process.env.AMPLIFY_COMMIT_ID || 'local';
  
  return {
    stage,
    amplifyAppId,
    amplifyBranch,
    amplifyCommitId
  };
}

// Generate version information object
function generateVersionInfo() {
  const gitInfo = getGitInfo();
  const buildInfo = getBuildInfo();
  const envInfo = getEnvironmentInfo();
  
  return {
    version: packageJson.version,
    name: packageJson.name,
    description: packageJson.description || 'Marko Personal Introduction Site',
    git: gitInfo,
    build: buildInfo,
    environment: envInfo,
    timestamp: new Date().toISOString()
  };
}

// Main function
function main() {
  const command = process.argv[2];
  const versionInfo = generateVersionInfo();
  
  switch (command) {
    case 'json':
      console.log(JSON.stringify(versionInfo, null, 2));
      break;
      
    case 'compact':
      console.log(`${versionInfo.name} v${versionInfo.version} (${versionInfo.git.shortHash})`);
      break;
      
    case 'build':
      console.log(`Build: ${versionInfo.version}-${versionInfo.git.shortHash} (${versionInfo.build.buildTime})`);
      break;
      
    case 'env':
      console.log(`Environment: ${versionInfo.environment.stage} (${versionInfo.environment.amplifyBranch})`);
      break;
      
    case 'git':
      console.log(`Git: ${versionInfo.git.branch}@${versionInfo.git.shortHash} (${versionInfo.git.lastCommitDate})`);
      console.log(`Last commit: ${versionInfo.git.lastCommitMessage}`);
      break;
      
    case 'health':
      // Format for health endpoint
      const healthInfo = {
        version: versionInfo.version,
        build: `${versionInfo.version}-${versionInfo.git.shortHash}`,
        environment: versionInfo.environment.stage,
        buildTime: versionInfo.build.buildTime,
        commitHash: versionInfo.git.shortHash
      };
      console.log(JSON.stringify(healthInfo, null, 2));
      break;
      
    case 'save':
      // Save version info to file for runtime access
      const outputPath = path.join(__dirname, '..', 'version-info.json');
      fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
      console.log(`Version information saved to: ${outputPath}`);
      break;
      
    default:
      // Default: human-readable format
      console.log('='.repeat(50));
      console.log(`${versionInfo.name.toUpperCase()} VERSION INFORMATION`);
      console.log('='.repeat(50));
      console.log(`Version: ${versionInfo.version}`);
      console.log(`Environment: ${versionInfo.environment.stage}`);
      console.log(`Build Time: ${versionInfo.build.buildTime}`);
      console.log(`Node Version: ${versionInfo.build.nodeVersion}`);
      console.log(`Platform: ${versionInfo.build.platform} (${versionInfo.build.arch})`);
      console.log('');
      console.log('Git Information:');
      console.log(`  Branch: ${versionInfo.git.branch}`);
      console.log(`  Commit: ${versionInfo.git.commitHash}`);
      console.log(`  Short Hash: ${versionInfo.git.shortHash}`);
      console.log(`  Last Commit: ${versionInfo.git.lastCommitDate}`);
      console.log(`  Message: ${versionInfo.git.lastCommitMessage}`);
      console.log('');
      console.log('Amplify Information:');
      console.log(`  App ID: ${versionInfo.environment.amplifyAppId}`);
      console.log(`  Branch: ${versionInfo.environment.amplifyBranch}`);
      console.log(`  Commit ID: ${versionInfo.environment.amplifyCommitId}`);
      console.log('='.repeat(50));
      break;
  }
}

// Export for use in other modules
module.exports = {
  generateVersionInfo,
  getGitInfo,
  getBuildInfo,
  getEnvironmentInfo
};

// Run if called directly
if (require.main === module) {
  main();
}