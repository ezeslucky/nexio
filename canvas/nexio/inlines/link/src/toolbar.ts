import { ToolbarModuleExtension } from '@canvas/nexio-shared/services';
import { BlockFlavourIdentifier } from '@canvas/std';

import { builtinInlineLinkToolbarConfig } from './link-node/configs/toolbar.js';

export const linkToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('nexio:link'),
  config: builtinInlineLinkToolbarConfig,
});
