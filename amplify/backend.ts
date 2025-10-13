import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { pitchFunction } from './functions/pitch/resource';
import { leadFunction } from './functions/lead/resource';
import { healthFunction } from './functions/health/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
  pitchFunction,
  leadFunction,
  healthFunction,
});