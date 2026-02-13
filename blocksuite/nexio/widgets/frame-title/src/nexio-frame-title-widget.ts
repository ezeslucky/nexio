import { type FrameBlockModel } from '@blocksuite/nexio-model';
import { WidgetComponent, WidgetViewExtension } from '@blocksuite/std';
import { html } from 'lit';
import { literal, unsafeStatic } from 'lit/static-html.js';

export const NEXIO_FRAME_TITLE_WIDGET = 'nexio-frame-title-widget';

export class NexioFrameTitleWidget extends WidgetComponent<FrameBlockModel> {
  override render() {
    return html`<nexio-frame-title
      .model=${this.model}
      data-id=${this.model.id}
    ></nexio-frame-title>`;
  }
}

export const frameTitleWidget = WidgetViewExtension(
  'nexio:frame',
  NEXIO_FRAME_TITLE_WIDGET,
  literal`${unsafeStatic(NEXIO_FRAME_TITLE_WIDGET)}`
);
