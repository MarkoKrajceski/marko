import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { pitchFunction } from './functions/pitch/resource';
import { leadFunction } from './functions/lead/resource';
import { healthFunction } from './functions/health/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  auth,
  data,
  pitchFunction,
  leadFunction,
  healthFunction,
});

// Add function URLs for direct invocation and capture them for outputs
const pitchFunctionUrl = backend.pitchFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});

const leadFunctionUrl = backend.leadFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});

const healthFunctionUrl = backend.healthFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});

// Add SES permissions to the lead function
backend.leadFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'ses:SendEmail',
      'ses:SendRawEmail',
    ],
    resources: ['*'], // In production, you'd want to restrict this to specific email addresses
  })
);

// Add Bedrock permissions to the pitch function
backend.pitchFunction.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      'bedrock:RetrieveAndGenerate',
      'bedrock:Retrieve',
      'bedrock:InvokeModel',
      'bedrock:GetInferenceProfile', // Required for inference profiles
    ],
    resources: [
      // Knowledge Base
      `arn:aws:bedrock:eu-south-1:*:knowledge-base/PE8ZSDZHWZ`,
      
      // Inference Profiles
      `arn:aws:bedrock:eu-south-1:859472853365:inference-profile/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-south-1:859472853365:inference-profile/eu.anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-south-1:859472853365:inference-profile/eu.anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-south-1:859472853365:inference-profile/eu.anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-south-1:859472853365:inference-profile/*`,
      
      // Foundation Models (inference profiles route to these across EU regions)
      `arn:aws:bedrock:eu-north-1::foundation-model/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-west-3::foundation-model/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-south-1::foundation-model/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-south-2::foundation-model/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-west-1::foundation-model/eu.amazon.nova-lite-v1:0`,
      `arn:aws:bedrock:eu-central-1::foundation-model/eu.amazon.nova-lite-v1:0`,

      `arn:aws:bedrock:eu-north-1::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-west-3::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-south-1::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-south-2::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      `arn:aws:bedrock:eu-central-1::foundation-model/anthropic.claude-sonnet-4-5-20250929-v1:0`,
      
      `arn:aws:bedrock:eu-north-1::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-west-3::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-south-1::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-south-2::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      `arn:aws:bedrock:eu-central-1::foundation-model/anthropic.claude-sonnet-4-20250514-v1:0`,
      
      `arn:aws:bedrock:eu-north-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-west-3::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-south-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-south-2::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-west-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      `arn:aws:bedrock:eu-central-1::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0`,
      
      // Wildcard for any other models
      `arn:aws:bedrock:*::foundation-model/*`,
    ],
  })
);

// Add environment variables to the lead function
// This will be set via Amplify Console environment variables in production
// For local testing, make sure NOTIFICATION_EMAIL is set in your environment
backend.leadFunction.addEnvironment('NOTIFICATION_EMAIL', process.env.NOTIFICATION_EMAIL || 'test@example.com');

// Add outputs for the function URLs so they can be used in environment variables
backend.addOutput({
  custom: {
    pitchFunctionUrl: pitchFunctionUrl.url,
    leadFunctionUrl: leadFunctionUrl.url,
    healthFunctionUrl: healthFunctionUrl.url,
  },
});
