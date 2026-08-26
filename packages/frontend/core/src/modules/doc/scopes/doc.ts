import type { Store } from '@canvas/nexio/store';
import { Scope } from '@ezeslucky/infra';

import type { DocRecord } from '../entities/record';

export class DocScope extends Scope<{
  docId: string;
  record: DocRecord;
  canvasDoc: Store;
}> {}
