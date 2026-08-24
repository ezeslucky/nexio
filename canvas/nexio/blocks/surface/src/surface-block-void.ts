import { BlockComponent } from '@canvas/std';
import { nothing } from 'lit';

import type { SurfaceBlockModel } from './surface-model.js';

export class SurfaceBlockVoidComponent extends BlockComponent<SurfaceBlockModel> {
  override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-surface-void': SurfaceBlockVoidComponent;
  }
}
