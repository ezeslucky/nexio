import { getViewManager } from '@nexio/core/blocksuite/manager/view';
import { DebugLogger } from '@nexio/debug';
import { BlockStdScope } from '@blocksuite/nexio/std';
import type { Store } from '@blocksuite/nexio/store';
import { useMemo } from 'react';

const logger = new DebugLogger('doc-info');
// todo(pengx17): use rc pool?
export function createBlockStdScope(doc: Store) {
  logger.debug('createBlockStdScope', doc.id);
  const std = new BlockStdScope({
    store: doc,
    extensions: getViewManager().config.init().value.get('page'),
  });
  return std;
}

export function useBlockStdScope(doc: Store) {
  return useMemo(() => createBlockStdScope(doc), [doc]);
}
