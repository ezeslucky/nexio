import { Tooltip } from './tooltip.js';

export function effects() {
  if (!customElements.get('nexio-tooltip')) {
    customElements.define('nexio-tooltip', Tooltip);
  }
}
