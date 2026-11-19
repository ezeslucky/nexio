import { AffineMention } from './nexio-mention';

export function effects() {
  customElements.define('nexio-mention', AffineMention);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-mention': AffineMention;
  }
}
