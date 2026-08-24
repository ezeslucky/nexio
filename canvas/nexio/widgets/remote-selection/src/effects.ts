import { NEXIO_DOC_REMOTE_SELECTION_WIDGET } from './doc';
import { NexioDocRemoteSelectionWidget } from './doc/doc-remote-selection';
import {
  NEXIO_EDGELESS_REMOTE_SELECTION_WIDGET,
  EdgelessRemoteSelectionWidget,
} from './edgeless';

export function effects() {
  customElements.define(
    NEXIO_DOC_REMOTE_SELECTION_WIDGET,
    NexioDocRemoteSelectionWidget
  );
  customElements.define(
    NEXIO_EDGELESS_REMOTE_SELECTION_WIDGET,
    EdgelessRemoteSelectionWidget
  );
}
