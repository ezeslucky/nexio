import {
  NEXIO_FRAME_PANEL_BODY,
  FramePanelBody,
} from './body/frame-panel-body';
import { NEXIO_FRAME_CARD, FrameCard } from './card/frame-card';
import {
  NEXIO_FRAME_CARD_TITLE,
  FrameCardTitle,
} from './card/frame-card-title';
import {
  NEXIO_FRAME_TITLE_EDITOR,
  FrameCardTitleEditor,
} from './card/frame-card-title-editor';
import { NEXIO_FRAME_PREVIEW, FramePreview } from './card/frame-preview';
import { NEXIO_FRAME_PANEL, FramePanel } from './frame-panel';
import {
  NEXIO_FRAME_PANEL_HEADER,
  FramePanelHeader,
} from './header/frame-panel-header';
import {
  NEXIO_FRAMES_SETTING_MENU,
  FramesSettingMenu,
} from './header/frames-setting-menu';

export function effects() {
  customElements.define(NEXIO_FRAME_PANEL, FramePanel);
  customElements.define(NEXIO_FRAME_TITLE_EDITOR, FrameCardTitleEditor);
  customElements.define(NEXIO_FRAME_CARD, FrameCard);
  customElements.define(NEXIO_FRAME_CARD_TITLE, FrameCardTitle);
  customElements.define(NEXIO_FRAME_PANEL_BODY, FramePanelBody);
  customElements.define(NEXIO_FRAME_PANEL_HEADER, FramePanelHeader);
  customElements.define(NEXIO_FRAMES_SETTING_MENU, FramesSettingMenu);
  customElements.define(NEXIO_FRAME_PREVIEW, FramePreview);
}
