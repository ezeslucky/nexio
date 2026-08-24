import { ViewExtensionManager } from '@canvas/nexio/ext-loader';
import { getInternalViewExtensions } from '@canvas/nexio/extensions/view';

const manager = new ViewExtensionManager(getInternalViewExtensions());

export function getTestViewManager() {
  return manager;
}
