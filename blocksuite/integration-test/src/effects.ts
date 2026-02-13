import '@blocksuite/nexio/effects';

import { TestNexioEditorContainer } from './editors/index.js';

export function effects() {
  customElements.define('affine-editor-container', TestNexioEditorContainer);
}
