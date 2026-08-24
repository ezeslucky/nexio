import {
  NEXIO_EDGELESS_AUTO_CONNECT_WIDGET,
  EdgelessAutoConnectWidget,
} from '.';

export function effects() {
  customElements.define(
    NEXIO_EDGELESS_AUTO_CONNECT_WIDGET,
    EdgelessAutoConnectWidget
  );
}
