import {
  NEXIO_VIEWPORT_OVERLAY_WIDGET,
  NexioViewportOverlayWidget,
} from './index';

export function effects() {
  customElements.define(
    NEXIO_VIEWPORT_OVERLAY_WIDGET,
    NexioViewportOverlayWidget
  );
}
