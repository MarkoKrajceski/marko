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
