import {
  EDGELESS_DND_PREVIEW_ELEMENT,
  EdgelessDndPreviewElement,
} from './components/edgeless-preview/preview';
import { NEXIO_DRAG_HANDLE_WIDGET } from './consts';
import { NexioDragHandleWidget } from './drag-handle';

export function effects() {
  customElements.define(NEXIO_DRAG_HANDLE_WIDGET, NexioDragHandleWidget);
  customElements.define(
    EDGELESS_DND_PREVIEW_ELEMENT,
    EdgelessDndPreviewElement
  );
}
