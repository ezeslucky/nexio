import { NexioText } from './nodes/nexio-text';

export function effects() {
  customElements.define('nexio-text', NexioText);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-text': NexioText;
  }
}
