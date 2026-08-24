import { ViewDropdownMenu } from './dropdown-menu';

export * from './dropdown-menu';

export function effects() {
  customElements.define('nexio-view-dropdown-menu', ViewDropdownMenu);
}
