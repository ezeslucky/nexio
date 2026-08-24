import { Container } from '@canvas/global/di';

import { testStoreExtensions } from './store';

export function getProvider() {
  const container = new Container();
  const exts = testStoreExtensions;
  exts.forEach(ext => {
    ext.setup(container);
  });
  return container.provider();
}
