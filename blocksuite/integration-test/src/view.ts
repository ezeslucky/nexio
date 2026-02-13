import { ViewExtensionManager } from '@blocksuite/nexio/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/nexio/extensions/view';

const manager = new ViewExtensionManager(getInternalViewExtensions());

export function getTestViewManager() {
  return manager;
}
