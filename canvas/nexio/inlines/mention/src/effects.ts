import { NexioMention } from './nexio-mention';

export function effects() {
  customElements.define('nexio-mention', NexioMention);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-mention': NexioMention;
  }
}
