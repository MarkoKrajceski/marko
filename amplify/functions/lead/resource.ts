import { defineFunction } from '@aws-amplify/backend';

export const leadFunction = defineFunction({
  name: 'leadHandler',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 30,
});