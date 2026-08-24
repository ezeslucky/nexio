import { ToolbarModuleExtension } from '@canvas/nexio-shared/services';
import { BlockFlavourIdentifier } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';

import { builtinLockedToolbarConfig, builtinMiscToolbarConfig } from './misc';

export const EdgelessElementToolbarExtension: ExtensionType[] = [
  ToolbarModuleExtension({
    id: BlockFlavourIdentifier('nexio:surface:*'),
    config: builtinMiscToolbarConfig,
  }),

  // Special Scenarios
  // Only display the `unlock` button when the selection includes a locked element.
  ToolbarModuleExtension({
    id: BlockFlavourIdentifier('nexio:surface:locked'),
    config: builtinLockedToolbarConfig,
  }),
];
