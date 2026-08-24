import { StoreExtensionManager } from '@canvas/nexio/ext-loader';
import { getInternalStoreExtensions } from '@canvas/nexio/extensions/store';

const manager = new StoreExtensionManager(getInternalStoreExtensions());

export function getTestStoreManager() {
  return manager;
}
