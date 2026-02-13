import { LinkPreview } from './link';

export * from './link';

export function effects() {
  customElements.define('nexio-link-preview', LinkPreview);
}
