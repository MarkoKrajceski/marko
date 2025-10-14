import { defineFunction } from '@aws-amplify/backend';

export const pitchFunction = defineFunction({
  name: 'pitchHandler',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 30,
});