import { StoreExtensionManager } from '@blocksuite/nexio/ext-loader';
import { getInternalStoreExtensions } from '@blocksuite/nexio/extensions/store';

const manager = new StoreExtensionManager(getInternalStoreExtensions());

export function getTestStoreManager() {
  return manager;
}
