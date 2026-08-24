import { NexioFootnoteNode } from './footnote-node/footnote-node';
import { FootNotePopup } from './footnote-node/footnote-popup';
import { FootNotePopupChip } from './footnote-node/footnote-popup-chip';

export function effects() {
  customElements.define('nexio-footnote-node', NexioFootnoteNode);
  customElements.define('footnote-popup', FootNotePopup);
  customElements.define('footnote-popup-chip', FootNotePopupChip);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-footnote-node': NexioFootnoteNode;
    'footnote-popup': FootNotePopup;
    'footnote-popup-chip': FootNotePopupChip;
  }
}
