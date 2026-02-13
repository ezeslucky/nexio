import {
  NEXIO_SCROLL_ANCHORING_WIDGET,
  NexioScrollAnchoringWidget,
} from './scroll-anchoring.js';

export function effects() {
  customElements.define(
    NEXIO_SCROLL_ANCHORING_WIDGET,
    NexioScrollAnchoringWidget
  );
}

declare global {
  interface HTMLElementTagNameMap {
    [NEXIO_SCROLL_ANCHORING_WIDGET]: NexioScrollAnchoringWidget;
  }
}
