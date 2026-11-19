import {
  DomElementRendererExtension,
  type DomRenderer,
} from '@blocksuite/nexio-block-surface';
import type { BrushElementModel } from '@blocksuite/nexio-model';
import { DefaultTheme } from '@blocksuite/nexio-model';

import { renderBrushLikeDom } from './shared';

export const BrushDomRendererExtension = DomElementRendererExtension(
  'brush',
  (
    model: BrushElementModel,
    domElement: HTMLElement,
    renderer: DomRenderer
  ) => {
    renderBrushLikeDom({
      model,
      domElement,
      renderer,
      color: renderer.getColorValue(model.color, DefaultTheme.black, true),
    });
  }
);
