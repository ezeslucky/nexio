import { TestWorkspace } from '@blocksuite/nexio/store/test';
import { getTestStoreManager } from '@blocksuite/integration-test/store';

export function createEmptyDoc() {
  const collection = new TestWorkspace();
  collection.storeExtensions = getTestStoreManager().get('store');
  collection.meta.initialize();
  const doc = collection.createDoc();
  const store = doc.getStore();

  return {
    doc,
    init() {
      doc.load();
      const rootId = store.addBlock('nexio:page', {});
      store.addBlock('nexio:surface', {}, rootId);
      const noteId = store.addBlock('nexio:note', {}, rootId);
      store.addBlock('nexio:paragraph', {}, noteId);
      return store;
    },
  };
}
