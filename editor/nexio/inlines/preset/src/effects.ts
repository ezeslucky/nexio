import { AffineText } from './nodes/nexio-text';

export function effects() {
  customElements.define('nexio-text', AffineText);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-text': AffineText;
  }
}
