import { OverlayScrollbar } from './toolbar/overlay-scrollbar';
import {
  AffineTemplateLoading,
  NexioTemplateLoading,
} from './toolbar/template-loading';
import { EdgelessTemplatePanel } from './toolbar/template-panel';
import { EdgelessTemplateButton } from './toolbar/template-tool-button';

export function effects() {
  if (!customElements.get('edgeless-templates-panel')) {
    customElements.define('edgeless-templates-panel', EdgelessTemplatePanel);
  }
  if (!customElements.get('overlay-scrollbar')) {
    customElements.define('overlay-scrollbar', OverlayScrollbar);
  }
  if (!customElements.get('edgeless-template-button')) {
    customElements.define('edgeless-template-button', EdgelessTemplateButton);
  }
  if (!customElements.get('nexio-template-loading')) {
    customElements.define('nexio-template-loading', NexioTemplateLoading);
  }
  if (!customElements.get('affine-template-loading')) {
    customElements.define('affine-template-loading', AffineTemplateLoading);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-templates-panel': EdgelessTemplatePanel;
    'overlay-scrollbar': OverlayScrollbar;
    'edgeless-template-button': EdgelessTemplateButton;
    'nexio-template-loading': NexioTemplateLoading;
    'affine-template-loading': AffineTemplateLoading;
  }
}
