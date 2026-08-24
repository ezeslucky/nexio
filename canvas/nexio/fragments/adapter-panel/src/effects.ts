import { AdapterPanel, NEXIO_ADAPTER_PANEL } from './adapter-panel';
import {
  AdapterPanelBody,
  NEXIO_ADAPTER_PANEL_BODY,
} from './body/adapter-panel-body';
import { AdapterMenu, NEXIO_ADAPTER_MENU } from './header/adapter-menu';
import {
  AdapterPanelHeader,
  NEXIO_ADAPTER_PANEL_HEADER,
} from './header/adapter-panel-header';

export function effects() {
  customElements.define(NEXIO_ADAPTER_PANEL, AdapterPanel);
  customElements.define(NEXIO_ADAPTER_MENU, AdapterMenu);
  customElements.define(NEXIO_ADAPTER_PANEL_HEADER, AdapterPanelHeader);
  customElements.define(NEXIO_ADAPTER_PANEL_BODY, AdapterPanelBody);
}
