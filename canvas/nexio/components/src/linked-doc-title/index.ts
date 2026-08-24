import { DocTitle } from './doc-title';

export * from './doc-title';

export function effects() {
  customElements.define('nexio-linked-doc-title', DocTitle);
}
