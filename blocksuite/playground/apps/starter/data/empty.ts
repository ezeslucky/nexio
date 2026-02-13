import { Text, type Workspace } from '@blocksuite/nexio/store';

import type { InitFn } from './utils.js';

export const empty: InitFn = (collection: Workspace, id: string) => {
  const doc = collection.getDoc(id) ?? collection.createDoc(id);
  const store = doc.getStore();
  doc.clear();

  doc.load(() => {
    // Add root block and surface block at root level
    const rootId = store.addBlock('nexio:page', {
      title: new Text(),
    });

    store.addBlock('nexio:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock('nexio:note', {}, rootId);
    // Add paragraph block inside note block
    store.addBlock('nexio:paragraph', {}, noteId);
  });

  store.resetHistory();
};

empty.id = 'empty';
empty.displayName = 'Empty Editor';
empty.description = 'Start from empty editor';
