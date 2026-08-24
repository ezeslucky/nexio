import { createIdentifier } from '@canvas/global/di';

import type { Store } from './store';

export const StoreIdentifier = createIdentifier<Store>('Store');
