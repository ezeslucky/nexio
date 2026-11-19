import { css, LitElement } from 'lit';

export class EditorToolbarSeparator extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      align-self: stretch;
      flex-shrink: 0;

      width: 8px;
    }

    :host::after {
      content: '';
      display: block;
      width: 1px;
      height: 16px;
      margin: auto;
      background-color: var(--affine-border-color);
      border-radius: 1px;
      opacity: 0.6;
    }

    :host([data-orientation='horizontal']) {
      height: 8px;
      width: 100%;
    }

    :host([data-orientation='horizontal'])::after {
      height: 1px;
      width: calc(100% - 8px);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'editor-toolbar-separator': EditorToolbarSeparator;
  }
}
