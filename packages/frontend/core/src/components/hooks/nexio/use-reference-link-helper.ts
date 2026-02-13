import type { NexioTextAttributes } from '@blocksuite/nexio/shared/types';
import {
  type DeltaInsert,
  Text,
  type Workspace,
} from '@blocksuite/nexio/store';
import { useCallback } from 'react';

export function useReferenceLinkHelper(docCollection: Workspace) {
  const addReferenceLink = useCallback(
    (pageId: string, referenceId: string) => {
      const page = docCollection?.getDoc(pageId)?.getStore();
      if (!page) {
        return;
      }
      const text = new Text([
        {
          insert: ' ',
          attributes: {
            reference: {
              type: 'Subpage',
              pageId: referenceId,
            },
          },
        },
      ] as DeltaInsert<NexioTextAttributes>[]);
      const [frame] = page.getModelsByFlavour('nexio:note');

      frame && page.addBlock('nexio:paragraph', { text }, frame.id);
    },
    [docCollection]
  );

  return {
    addReferenceLink,
  };
}
