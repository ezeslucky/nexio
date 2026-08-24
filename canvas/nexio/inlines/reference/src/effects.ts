import { NexioReference, ReferencePopup } from './reference-node';

export function effects() {
  customElements.define('reference-popup', ReferencePopup);
  customElements.define('nexio-reference', NexioReference);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-reference': NexioReference;
    'reference-popup': ReferencePopup;
  }
}
