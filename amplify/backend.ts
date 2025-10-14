import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Duration } from 'aws-cdk-lib';
import { HttpMethod } from 'aws-cdk-lib/aws-lambda';
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

// Add outputs for the function URLs so they can be used in environment variables
backend.addOutput({
  custom: {
    pitchFunctionUrl: pitchFunctionUrl.url,
    leadFunctionUrl: leadFunctionUrl.url,
    healthFunctionUrl: healthFunctionUrl.url,
  },
});
