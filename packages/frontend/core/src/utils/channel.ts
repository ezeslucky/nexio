import { z } from 'zod';

export const appSchemes = z.enum([
  'nexio',
  'nexio-canary',
  'nexio-beta',
  'nexio-internal',
  'nexio-dev',
]);

export type Scheme = z.infer<typeof appSchemes>;
export type Channel = 'stable' | 'canary' | 'beta' | 'internal';

export const schemeToChannel = {
  nexio: 'stable',
  'nexio-canary': 'canary',
  'nexio-beta': 'beta',
  'nexio-internal': 'internal',
  'nexio-dev': 'canary', // dev does not have a dedicated app. use canary as the placeholder.
} as Record<Scheme, Channel>;

export const channelToScheme = {
  stable: 'nexio',
  canary: BUILD_CONFIG.debug ? 'nexio-dev' : 'nexio-canary',
  beta: 'nexio-beta',
  internal: 'nexio-internal',
} as Record<Channel, Scheme>;

export const appIconMap = {
  stable: '/imgs/app-icon-stable.ico',
  canary: '/imgs/app-icon-canary.ico',
  beta: '/imgs/app-icon-beta.ico',
  internal: '/imgs/app-icon-internal.ico',
} satisfies Record<Channel, string>;

export const appNames = {
  stable: 'NEXIO',
  canary: 'NEXIO Canary',
  beta: 'NEXIO Beta',
  internal: 'NEXIO Internal',
} satisfies Record<Channel, string>;

export const appSchemaUrl = z.custom<string>(
  (url: string) => {
    try {
      return appSchemes.safeParse(new URL(url).protocol.replace(':', ''))
        .success;
    } catch {
      return false;
    }
  },
  { message: 'Invalid URL or protocol' }
);
