import {
  DEFAULT_PAGE_BLOCK_HEIGHT,
  DEFAULT_PAGE_BLOCK_WIDTH,
} from '@canvas/nexio-model';
import type { Workspace } from '@canvas/store';
import { Text } from '@canvas/store';

export function createDefaultDoc(
  collection: Workspace,
  options: { id?: string; title?: string } = {}
) {
  const doc = collection.createDoc(options.id);
  doc.load();

  const store = doc.getStore();
  const title = options.title ?? '';
  const rootId = store.addBlock('nexio:page', {
    title: new Text(title),
  });
  collection.meta.setDocMeta(doc.id, {
    title,
  });

  store.addBlock('nexio:surface', {}, rootId);
  const noteId = store.addBlock(
    'nexio:note',
    {
      xywh: `[0, 0, ${DEFAULT_PAGE_BLOCK_WIDTH}, ${DEFAULT_PAGE_BLOCK_HEIGHT}]`,
    },
    rootId
  );
  store.addBlock('nexio:paragraph', {}, noteId);
  // To make sure the content of new doc would not be clear
  // By undo operation for the first time
  store.resetHistory();

  return store;
}
