import { createTextActions } from '@canvas/nexio-gfx-text';
import { EdgelessTextBlockModel } from '@canvas/nexio-model';
import {
  type ToolbarModuleConfig,
  ToolbarModuleExtension,
} from '@canvas/nexio-shared/services';
import { BlockFlavourIdentifier } from '@canvas/std';

export const edgelessTextToolbarConfig = {
  // No need to adjust element bounds, which updates itself using ResizeObserver
  actions: createTextActions(EdgelessTextBlockModel, 'edgeless-text'),

  when: ctx => ctx.getSurfaceModelsByType(EdgelessTextBlockModel).length > 0,
} as const satisfies ToolbarModuleConfig;

export const edgelessTextToolbarExtension = ToolbarModuleExtension({
  id: BlockFlavourIdentifier('nexio:surface:edgeless-text'),
  config: edgelessTextToolbarConfig,
});
