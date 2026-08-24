import { ToolbarModuleExtension } from '@canvas/nexio-shared/services';
import { BlockFlavourIdentifier } from '@canvas/std';

import { builtinInlineReferenceToolbarConfig } from './reference-node/configs/toolbar';

export const referenceNodeToolbar = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('nexio:reference'),
  config: builtinInlineReferenceToolbarConfig,
});
