import { Text, type Workspace } from '@canvas/nexio/store';

import type { InitFn } from './utils.js';

export const embed: InitFn = (collection: Workspace, id: string) => {
  const doc = collection.getDoc(id) ?? collection.createDoc(id);
  const store = doc.getStore();
  doc.clear();

  doc.load(() => {
    // Add root block and surface block at root level
    const rootId = store.addBlock('nexio:page', {
      title: new Text(),
    });

    const surfaceId = store.addBlock('nexio:surface', {}, rootId);

    // Add note block inside root block
    const noteId = store.addBlock('nexio:note', {}, rootId);
    // Add paragraph block inside note block
    store.addBlock('nexio:paragraph', {}, noteId);

    store.addBlock(
      'nexio:embed-github',
      {
        url: 'https://github.com/ezeslucky/nexio/pull/5453',
      },
      noteId
    );
    store.addBlock(
      'nexio:embed-github',
      {
        url: 'https://www.github.com/toeverything/blocksuite/pull/5927',
        style: 'vertical',
        xywh: '[0, 400, 364, 390]',
      },
      surfaceId
    );
    store.addBlock(
      'nexio:embed-github',
      {
        url: 'https://github.com/Milkdown/milkdown/pull/1215',
        xywh: '[500, 400, 752, 116]',
      },
      surfaceId
    );
    store.addBlock('nexio:paragraph', {}, noteId);
  });

  store.resetHistory();
};

embed.id = 'embed';
embed.displayName = 'Example for embed blocks';
embed.description = 'Example for embed blocks';
