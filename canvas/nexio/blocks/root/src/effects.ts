import {
  EdgelessRootBlockComponent,
  EdgelessRootPreviewBlockComponent,
  PageRootBlockComponent,
  PreviewRootBlockComponent,
} from './index.js';

export function effects() {
  // Register components by category
  registerRootComponents();
}

function registerRootComponents() {
  customElements.define('nexio-page-root', PageRootBlockComponent);
  customElements.define('nexio-preview-root', PreviewRootBlockComponent);
  customElements.define('nexio-edgeless-root', EdgelessRootBlockComponent);
  customElements.define(
    'nexio-edgeless-root-preview',
    EdgelessRootPreviewBlockComponent
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-edgeless-root': EdgelessRootBlockComponent;
    'nexio-page-root': PageRootBlockComponent;
  }
}
