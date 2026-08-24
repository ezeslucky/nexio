import { ListBlockComponent } from './list-block.js';

export function effects() {
  customElements.define('nexio-list', ListBlockComponent);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-list': ListBlockComponent;
  }
}
