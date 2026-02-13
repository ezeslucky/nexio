import { ToolbarModuleExtension } from '@blocksuite/nexio-shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/std';

import { builtinInlineLinkToolbarConfig } from './link-node/configs/toolbar.js';

export const linkToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('nexio:link'),
  config: builtinInlineLinkToolbarConfig,
});
