import { z } from 'zod';

export const supportedClient = z.enum([
  'web',
  'nexio',
  'nexio-canary',
  'nexio-beta',
  ...(BUILD_CONFIG.debug ? ['nexio-dev'] : []),
]);
