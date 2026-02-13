import { ConfigExtensionFactory } from '@blocksuite/std';

import type { ToolbarMoreMenuConfig } from './types';

export const ToolbarMoreMenuConfigExtension = ConfigExtensionFactory<
  Partial<ToolbarMoreMenuConfig>
>('nexio-toolbar-more-menu');
