import { defineFunction } from '@aws-amplify/backend';

export const pitchFunction = defineFunction({
  name: 'pitchHandler',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 30,
  environment: {
    KNOWLEDGE_BASE_ID: 'PE8ZSDZHWZ',
    BEDROCK_REGION: 'eu-south-1'
  }
});