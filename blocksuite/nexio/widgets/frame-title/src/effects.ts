import {
  NEXIO_FRAME_TITLE_WIDGET,
  NexioFrameTitleWidget,
} from './nexio-frame-title-widget.js';
import { EdgelessFrameTitleEditor } from './edgeless-frame-title-editor.js';
import { NEXIO_FRAME_TITLE, NexioFrameTitle } from './frame-title.js';

export function effects() {
  customElements.define(NEXIO_FRAME_TITLE_WIDGET, NexioFrameTitleWidget);
  customElements.define(NEXIO_FRAME_TITLE, NexioFrameTitle);
  customElements.define(
    'edgeless-frame-title-editor',
    EdgelessFrameTitleEditor
  );
}
