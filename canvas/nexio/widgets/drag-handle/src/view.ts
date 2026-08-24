import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';

import { dragHandleWidget } from '.';
import { effects } from './effects';

export class DragHandleViewExtension extends ViewExtensionProvider {
  override name = 'nexio-drag-handle-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register(dragHandleWidget);
  }
}
