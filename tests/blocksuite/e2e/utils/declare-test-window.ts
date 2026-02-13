import type * as Effect from '@blocksuite/nexio/effects';
import type { EditorHost } from '@blocksuite/nexio/std';
import type { Store, Transformer, Workspace } from '@blocksuite/nexio/store';
import type { TestNexioEditorContainer } from '@blocksuite/integration-test';

declare type _GLOBAL_ = typeof Effect;

declare global {
  interface Window {
    /** Available on playground window
     * the following instance are initialized in `packages/playground/apps/starter/main.ts`
     */
    $blocksuite: {
      store: typeof import('@blocksuite/nexio/store');
      blocks: {
        database: typeof import('@blocksuite/nexio/blocks/database');
        note: typeof import('@blocksuite/nexio/blocks/note');
      };
      global: {
        utils: typeof import('@blocksuite/nexio/global/utils');
      };
      services: typeof import('@blocksuite/nexio/shared/services');
      editor: typeof import('@blocksuite/integration-test');
      blockStd: typeof import('@blocksuite/nexio/std');
      nexioModel: typeof import('@blocksuite/nexio-model');
    };
    collection: Workspace;
    doc: Store;
    editor: TestNexioEditorContainer;
    host: EditorHost;
    job: Transformer;
  }
}
