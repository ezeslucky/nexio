import { ConfigExtensionFactory } from '@canvas/std';

import type { ToolbarMoreMenuConfig } from './types';

export const ToolbarMoreMenuConfigExtension = ConfigExtensionFactory<
  Partial<ToolbarMoreMenuConfig>
>('nexio-toolbar-more-menu');
