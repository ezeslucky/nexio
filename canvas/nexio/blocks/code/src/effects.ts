import { CodeBlockComponent } from './code-block';
import {
  NEXIO_CODE_TOOLBAR_WIDGET,
  NexioCodeToolbarWidget,
} from './code-toolbar';
import { NexioCodeToolbar } from './code-toolbar/components/code-toolbar';
import { LanguageListButton } from './code-toolbar/components/lang-button';
import { PreviewButton } from './code-toolbar/components/preview-button';
import { NexioCodeUnit } from './highlight/nexio-code-unit';

export function effects() {
  customElements.define('language-list-button', LanguageListButton);
  customElements.define('nexio-code-toolbar', NexioCodeToolbar);
  customElements.define(NEXIO_CODE_TOOLBAR_WIDGET, NexioCodeToolbarWidget);
  customElements.define('nexio-code-unit', NexioCodeUnit);
  customElements.define('nexio-code', CodeBlockComponent);
  customElements.define('preview-button', PreviewButton);
}

declare global {
  interface HTMLElementTagNameMap {
    'language-list-button': LanguageListButton;
    'nexio-code-toolbar': NexioCodeToolbar;
    'preview-button': PreviewButton;
    [NEXIO_CODE_TOOLBAR_WIDGET]: NexioCodeToolbarWidget;
  }
}
