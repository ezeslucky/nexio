import { NEXIO_OUTLINE_NOTICE, OutlineNotice } from './body/outline-notice';
import {
  NEXIO_OUTLINE_PANEL_BODY,
  OutlinePanelBody,
} from './body/outline-panel-body';
import { NEXIO_OUTLINE_NOTE_CARD, OutlineNoteCard } from './card/outline-card';
import {
  NEXIO_OUTLINE_BLOCK_PREVIEW,
  OutlineBlockPreview,
} from './card/outline-preview';
import {
  NEXIO_OUTLINE_PANEL_HEADER,
  OutlinePanelHeader,
} from './header/outline-panel-header';
import {
  NEXIO_OUTLINE_NOTE_PREVIEW_SETTING_MENU,
  OutlineNotePreviewSettingMenu,
} from './header/outline-setting-menu';
import {
  NEXIO_MOBILE_OUTLINE_MENU,
  MobileOutlineMenu,
} from './mobile-outline-panel';
import { NEXIO_OUTLINE_PANEL, OutlinePanel } from './outline-panel';
import { NEXIO_OUTLINE_VIEWER, OutlineViewer } from './outline-viewer';

export function effects() {
  customElements.define(
    NEXIO_OUTLINE_NOTE_PREVIEW_SETTING_MENU,
    OutlineNotePreviewSettingMenu
  );
  customElements.define(NEXIO_OUTLINE_NOTICE, OutlineNotice);
  customElements.define(NEXIO_OUTLINE_PANEL, OutlinePanel);
  customElements.define(NEXIO_OUTLINE_PANEL_HEADER, OutlinePanelHeader);
  customElements.define(NEXIO_OUTLINE_NOTE_CARD, OutlineNoteCard);
  customElements.define(NEXIO_OUTLINE_VIEWER, OutlineViewer);
  customElements.define(NEXIO_MOBILE_OUTLINE_MENU, MobileOutlineMenu);
  customElements.define(NEXIO_OUTLINE_BLOCK_PREVIEW, OutlineBlockPreview);
  customElements.define(NEXIO_OUTLINE_PANEL_BODY, OutlinePanelBody);
}
