import '@canvas/nexio/effects';

import { TestNexioEditorContainer } from './editors/index.js';

export function effects() {
  customElements.define('nexio-editor-container', TestNexioEditorContainer);
}
