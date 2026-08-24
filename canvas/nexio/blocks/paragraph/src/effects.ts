import { effects as ParagraphHeadingIconEffects } from './heading-icon.js';
import { ParagraphBlockComponent } from './paragraph-block.js';

export function effects() {
  ParagraphHeadingIconEffects();
  customElements.define('nexio-paragraph', ParagraphBlockComponent);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-paragraph': ParagraphBlockComponent;
  }
}
