import { createBlockStdScope } from '@nexio/core/blocksuite/manager/view';
import type { Store } from '@blocksuite/nexio/store';
import { useMemo } from 'react';

export function useBlockStdScope(doc: Store) {
  return useMemo(() => createBlockStdScope(doc), [doc]);
}
