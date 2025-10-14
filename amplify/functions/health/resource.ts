import { defineFunction } from '@aws-amplify/backend';

export const healthFunction = defineFunction({
  name: 'healthHandler',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 30,
});