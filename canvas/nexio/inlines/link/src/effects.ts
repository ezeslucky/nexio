import { NexioLink } from './link-node/nexio-link';
import { LinkPopup } from './link-node/link-popup/link-popup';

export function effects() {
  customElements.define('link-popup', LinkPopup);
  customElements.define('nexio-link', NexioLink);
}
