import { SurfaceBlockComponent } from './surface-block.js';
import { SurfaceBlockVoidComponent } from './surface-block-void.js';

export function effects() {
  customElements.define('nexio-surface-void', SurfaceBlockVoidComponent);
  customElements.define('nexio-surface', SurfaceBlockComponent);
}
