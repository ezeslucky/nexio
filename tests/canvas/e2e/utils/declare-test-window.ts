import type * as Effect from '@canvas/nexio/effects';
import type { EditorHost } from '@canvas/nexio/std';
import type { Store, Transformer, Workspace } from '@canvas/nexio/store';
import type { TestNexioEditorContainer } from '@canvas/integration-test';

declare type _GLOBAL_ = typeof Effect;

declare global {
  interface Window {
    /** Available on playground window
     * the following instance are initialized in `packages/playground/apps/starter/main.ts`
     */
    $canvas: {
      store: typeof import('@canvas/nexio/store');
      blocks: {
        database: typeof import('@canvas/nexio/blocks/database');
        note: typeof import('@canvas/nexio/blocks/note');
      };
      global: {
        utils: typeof import('@canvas/nexio/global/utils');
      };
      services: typeof import('@canvas/nexio/shared/services');
      editor: typeof import('@canvas/integration-test');
      blockStd: typeof import('@canvas/nexio/std');
      nexioModel: typeof import('@canvas/nexio-model');
    };
    collection: Workspace;
    doc: Store;
    editor: TestNexioEditorContainer;
    host: EditorHost;
    job: Transformer;
  }
}
