import { WithDisposable } from '@canvas/global/lit';
import { type EditorHost, ShadowlessElement } from '@canvas/std';
import { baseTheme } from '@ezeslucky/theme';
import { css, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';

const styles = css`
  nexio-frame-panel {
    flex-grow: 1;
  }

  frame-panel {
    display: block;
    width: 100%;
    height: 100%;
  }

  .frame-panel-container {
    background-color: var(--nexio-background-primary-color);
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    height: 100%;
    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    padding: 8px;
  }

  .frame-panel-body {
    padding-top: 12px;
    flex-grow: 1;
    width: 100%;

    overflow: auto;
    overflow-x: hidden;
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: transparent transparent; /* For Firefox */
  }

  .frame-panel-body::-webkit-scrollbar {
    width: 4px;
  }

  .frame-panel-body::-webkit-scrollbar-thumb {
    border-radius: 2px;
  }

  .frame-panel-body:hover::-webkit-scrollbar-thumb {
    background-color: var(--nexio-black-30);
  }

  .frame-panel-body::-webkit-scrollbar-track {
    background-color: transparent;
  }

  .frame-panel-body::-webkit-scrollbar-corner {
    display: none;
  }
`;

export const NEXIO_FRAME_PANEL = 'nexio-frame-panel';

export class FramePanel extends WithDisposable(ShadowlessElement) {
  static override styles = styles;

  override render() {
    return html`<div class="frame-panel-container">
      <nexio-frame-panel-header
        .editorHost=${this.host}
      ></nexio-frame-panel-header>
      <nexio-frame-panel-body
        class="frame-panel-body"
        .editorHost=${this.host}
        .fitPadding=${this.fitPadding}
      ></nexio-frame-panel-body>
    </div>`;
  }

  @property({ attribute: false })
  accessor fitPadding: number[] = [50, 380, 50, 50];

  @property({ attribute: false })
  accessor host!: EditorHost;
}

declare global {
  interface HTMLElementTagNameMap {
    [NEXIO_FRAME_PANEL]: FramePanel;
  }
}
