import { defineFunction } from '@aws-amplify/backend';

export const healthFunction = defineFunction({
  name: 'healthHandler',
  entry: './handler.ts'
});