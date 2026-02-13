import {
  NEXIO_EDGELESS_ZOOM_TOOLBAR_WIDGET,
  NexioEdgelessZoomToolbarWidget,
} from '.';
import { ZoomBarToggleButton } from './zoom-bar-toggle-button';
import { EdgelessZoomToolbar } from './zoom-toolbar';

export function effects() {
  customElements.define('edgeless-zoom-toolbar', EdgelessZoomToolbar);
  customElements.define('zoom-bar-toggle-button', ZoomBarToggleButton);
  customElements.define(
    NEXIO_EDGELESS_ZOOM_TOOLBAR_WIDGET,
    NexioEdgelessZoomToolbarWidget
  );
}
