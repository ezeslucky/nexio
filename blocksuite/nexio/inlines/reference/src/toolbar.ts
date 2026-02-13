import { ToolbarModuleExtension } from '@blocksuite/nexio-shared/services';
import { BlockFlavourIdentifier } from '@blocksuite/std';

import { builtinInlineReferenceToolbarConfig } from './reference-node/configs/toolbar';

export const referenceNodeToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('nexio:reference'),
  config: builtinInlineReferenceToolbarConfig,
});
