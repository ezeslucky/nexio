import { NEXIO_SLASH_MENU_WIDGET } from './consts';
import { InnerSlashMenu, SlashMenu } from './slash-menu-popover';
import { NexioSlashMenuWidget } from './widget';

export function effects() {
  customElements.define(NEXIO_SLASH_MENU_WIDGET, NexioSlashMenuWidget);
  customElements.define('nexio-slash-menu', SlashMenu);
  customElements.define('inner-slash-menu', InnerSlashMenu);
}

declare global {
  interface HTMLElementTagNameMap {
    [NEXIO_SLASH_MENU_WIDGET]: NexioSlashMenuWidget;
  }
}
