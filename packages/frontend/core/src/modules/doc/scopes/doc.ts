import type { Store } from '@blocksuite/nexio/store';
import { Scope } from '@ezeslucky/infra';

import type { DocRecord } from '../entities/record';

export class DocScope extends Scope<{
  docId: string;
  record: DocRecord;
  blockSuiteDoc: Store;
}> {}
