import { OpenDocDropdownMenu } from './dropdown-menu';

export * from './dropdown-menu';

export function effects() {
  customElements.define('nexio-open-doc-dropdown-menu', OpenDocDropdownMenu);
}
