import {
  NEXIO_KEYBOARD_TOOLBAR_WIDGET,
  NexioKeyboardToolbarWidget,
} from './index.js';
import {
  NEXIO_KEYBOARD_TOOL_PANEL,
  NexioKeyboardToolPanel,
} from './keyboard-tool-panel.js';
import {
  NEXIO_KEYBOARD_TOOLBAR,
  NexioKeyboardToolbar,
} from './keyboard-toolbar.js';

export function effects() {
  customElements.define(
    NEXIO_KEYBOARD_TOOLBAR_WIDGET,
    NexioKeyboardToolbarWidget
  );
  customElements.define(NEXIO_KEYBOARD_TOOLBAR, NexioKeyboardToolbar);
  customElements.define(NEXIO_KEYBOARD_TOOL_PANEL, NexioKeyboardToolPanel);
}

declare global {
  interface HTMLElementTagNameMap {
    [NEXIO_KEYBOARD_TOOLBAR]: NexioKeyboardToolbar;
    [NEXIO_KEYBOARD_TOOL_PANEL]: NexioKeyboardToolPanel;
  }
}
