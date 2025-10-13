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

// Add function URLs for direct invocation
backend.pitchFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});

backend.leadFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});

backend.healthFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowCredentials: false,
    allowedHeaders: ['content-type'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST],
    allowedOrigins: ['*'],
    maxAge: Duration.seconds(300),
  },
});
