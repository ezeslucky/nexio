import type { BlockFlavourIdentifier } from '@canvas/std';

import type { ToolbarModuleConfig } from './config';

export type ToolbarModule = {
  readonly id: ReturnType<typeof BlockFlavourIdentifier>;

  readonly config: ToolbarModuleConfig;
};
