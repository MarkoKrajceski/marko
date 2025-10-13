#!/usr/bin/env node

/**
 * CloudWatch Monitoring Setup Script
 * 
 * This script sets up CloudWatch monitoring resources including:
 * - Log groups with proper retention
 * - Custom metrics and alarms
 * - CloudWatch dashboard
 * - SNS alerts
 */

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Initialize AWS services
const cloudFormation = new AWS.CloudFormation();
const cloudWatch = new AWS.CloudWatch();
const logs = new AWS.CloudWatchLogs();

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  stackName: (env) => `personal-site-monitoring-${env}`,
  dashboardStackName: (env) => `personal-site-dashboard-${env}`,
  region: process.env.AWS_REGION || 'us-east-1',
  alertEmail: process.env.ALERT_EMAIL || 'alerts@marko.dev'
};

// =============================================================================
// CLOUDFORMATION DEPLOYMENT
// =============================================================================

/**
 * Deploy CloudFormation stack
 * @param {string} stackName - Name of the stack
 * @param {string} templatePath - Path to CloudFormation template
 * @param {Object} parameters - Stack parameters
 */
async function deployStack(stackName, templatePath, parameters = {}) {
  console.log(`📦 Deploying stack: ${stackName}`);
  
  try {
    // Read template
    const template = fs.readFileSync(templatePath, 'utf8');
    
    // Prepare parameters
    const stackParameters = Object.entries(parameters).map(([key, value]) => ({
      ParameterKey: key,
      ParameterValue: value
    }));
    
    // Check if stack exists
    let stackExists = false;
    try {
      await cloudFormation.describeStacks({ StackName: stackName }).promise();
      stackExists = true;
    } catch (error) {
      if (error.code !== 'ValidationError') {
        throw error;
      }
    }
    
    // Create or update stack
    const operation = stackExists ? 'updateStack' : 'createStack';
    const params = {
      StackName: stackName,
      TemplateBody: template,
      Parameters: stackParameters,
      Capabilities: ['CAPABILITY_IAM']
    };
    
    console.log(`   ${stackExists ? 'Updating' : 'Creating'} stack...`);
    await cloudFormation[operation](params).promise();
    
    // Wait for completion
    console.log('   Waiting for stack operation to complete...');
    const waiter = stackExists ? 'stackUpdateComplete' : 'stackCreateComplete';
    await cloudFormation.waitFor(waiter, { StackName: stackName }).promise();
    
    console.log(`   ✅ Stack ${stackName} deployed successfully`);
    
    // Get stack outputs
    const stackInfo = await cloudFormation.describeStacks({ StackName: stackName }).promise();
    const outputs = stackInfo.Stacks[0].Outputs || [];
    
    return outputs.reduce((acc, output) => {
      acc[output.OutputKey] = output.OutputValue;
      return acc;
    }, {});
    
  } catch (error) {
    console.error(`   ❌ Failed to deploy stack ${stackName}:`, error.message);
    throw error;
  }
}

// =============================================================================
// LOG GROUP SETUP
// =============================================================================

/**
 * Ensure log groups exist with proper configuration
 * @param {Array} functionNames - List of Lambda function names
 */
async function setupLogGroups(functionNames) {
  console.log('📋 Setting up CloudWatch log groups...');
  
  for (const functionName of functionNames) {
    const logGroupName = `/aws/lambda/${functionName}`;
    
    try {
      // Check if log group exists
      await logs.describeLogGroups({ logGroupNamePrefix: logGroupName }).promise();
      console.log(`   ✅ Log group exists: ${logGroupName}`);
    } catch (error) {
      // Create log group if it doesn't exist
      try {
        await logs.createLogGroup({
          logGroupName,
          retentionInDays: 30
        }).promise();
        console.log(`   ✅ Created log group: ${logGroupName}`);
      } catch (createError) {
        if (createError.code !== 'ResourceAlreadyExistsException') {
          console.error(`   ❌ Failed to create log group ${logGroupName}:`, createError.message);
        }
      }
    }
  }
}

// =============================================================================
// CUSTOM METRICS SETUP
// =============================================================================

/**
 * Create custom metric filters for log groups
 * @param {Array} functionNames - List of Lambda function names
 * @param {string} stage - Environment stage
 */
async function setupMetricFilters(functionNames, stage) {
  console.log('📊 Setting up custom metric filters...');
  
  const metricFilters = [
    {
      filterName: 'ErrorCount',
      filterPattern: '{ $.level = "ERROR" }',
      metricName: 'ErrorCount',
      metricNamespace: 'PersonalSite',
      metricValue: '1',
      defaultValue: 0
    },
    {
      filterName: 'RequestCount',
      filterPattern: '{ $.message = "Request started" }',
      metricName: 'RequestCount',
      metricNamespace: 'PersonalSite',
      metricValue: '1',
      defaultValue: 0
    }
  ];
  
  for (const functionName of functionNames) {
    const logGroupName = `/aws/lambda/${functionName}`;
    
    for (const filter of metricFilters) {
      try {
        await logs.putMetricFilter({
          logGroupName,
          filterName: `${functionName}-${filter.filterName}`,
          filterPattern: filter.filterPattern,
          metricTransformations: [
            {
              metricName: filter.metricName,
              metricNamespace: filter.metricNamespace,
              metricValue: filter.metricValue,
              defaultValue: filter.defaultValue,
              dimensions: {
                Stage: stage,
                Function: functionName
              }
            }
          ]
        }).promise();
        
        console.log(`   ✅ Created metric filter: ${functionName}-${filter.filterName}`);
      } catch (error) {
        if (error.code !== 'ResourceAlreadyExistsException') {
          console.error(`   ❌ Failed to create metric filter:`, error.message);
        }
      }
    }
  }
}

// =============================================================================
// MAIN SETUP FUNCTION
// =============================================================================

/**
 * Main monitoring setup function
 * @param {string} stage - Environment stage (dev, staging, prod)
 * @param {Object} functionNames - Object with Lambda function names
 */
async function setupMonitoring(stage, functionNames) {
  console.log('🚀 Setting up CloudWatch monitoring...');
  console.log(`   Stage: ${stage}`);
  console.log(`   Functions: ${Object.values(functionNames).join(', ')}`);
  console.log('');
  
  try {
    // 1. Setup log groups
    await setupLogGroups(Object.values(functionNames));
    console.log('');
    
    // 2. Deploy monitoring CloudFormation stack
    const monitoringTemplatePath = path.join(__dirname, '../amplify/backend/monitoring/cloudwatch-template.json');
    const monitoringOutputs = await deployStack(
      config.stackName(stage),
      monitoringTemplatePath,
      {
        env: stage,
        functionpitchHandlerName: functionNames.pitch,
        functionleadHandlerName: functionNames.lead,
        functionhealthHandlerName: functionNames.health,
        alertEmail: config.alertEmail
      }
    );
    console.log('');
    
    // 3. Deploy dashboard CloudFormation stack
    const dashboardTemplatePath = path.join(__dirname, '../amplify/backend/monitoring/dashboard-template.json');
    const dashboardOutputs = await deployStack(
      config.dashboardStackName(stage),
      dashboardTemplatePath,
      {
        env: stage,
        functionpitchHandlerName: functionNames.pitch,
        functionleadHandlerName: functionNames.lead,
        functionhealthHandlerName: functionNames.health
      }
    );
    console.log('');
    
    // 4. Setup custom metric filters
    await setupMetricFilters(Object.values(functionNames), stage);
    console.log('');
    
    // 5. Display summary
    console.log('🎉 CloudWatch monitoring setup completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   Alert Topic: ${monitoringOutputs.AlertTopicArn || 'Created'}`);
    console.log(`   Dashboard: ${dashboardOutputs.DashboardURL || 'Created'}`);
    console.log(`   Log Groups: ${Object.values(functionNames).length} created`);
    console.log(`   Metric Filters: ${Object.values(functionNames).length * 2} created`);
    console.log('');
    console.log('💡 Next Steps:');
    console.log('   - Confirm SNS subscription via email');
    console.log('   - Check CloudWatch dashboard for metrics');
    console.log('   - Test alarms by triggering errors');
    console.log('');
    
    return {
      monitoring: monitoringOutputs,
      dashboard: dashboardOutputs
    };
    
  } catch (error) {
    console.error('💥 Monitoring setup failed:', error.message);
    throw error;
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

if (require.main === module) {
  const args = process.argv.slice(2);
  const stage = args[0] || process.env.STAGE || 'dev';
  
  // Default function names (would be replaced with actual names in production)
  const functionNames = {
    pitch: process.env.PITCH_FUNCTION_NAME || `pitchHandler-${stage}`,
    lead: process.env.LEAD_FUNCTION_NAME || `leadHandler-${stage}`,
    health: process.env.HEALTH_FUNCTION_NAME || `healthHandler-${stage}`
  };
  
  setupMonitoring(stage, functionNames)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = {
  setupMonitoring,
  deployStack,
  setupLogGroups,
  setupMetricFilters
};