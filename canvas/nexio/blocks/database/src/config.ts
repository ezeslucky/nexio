import { ConfigExtensionFactory } from '@canvas/std';

import type { DatabaseViewExtensionOptions } from './view';

export const DatabaseConfigExtension =
  ConfigExtensionFactory<DatabaseViewExtensionOptions>('nexio:database');
