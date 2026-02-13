import { NEXIO_TOOLBAR_WIDGET, NexioToolbarWidget } from './toolbar';

export function effects() {
  customElements.define(NEXIO_TOOLBAR_WIDGET, NexioToolbarWidget);
}

declare global {
  interface HTMLElementTagNameMap {
    [NEXIO_TOOLBAR_WIDGET]: NexioToolbarWidget;
  }
}
