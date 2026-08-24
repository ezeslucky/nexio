import type { NoteBlockModel } from '@canvas/nexio-model';
import { BlockComponent } from '@canvas/std';
import { css, html } from 'lit';

export class NoteBlockComponent extends BlockComponent<NoteBlockModel> {
  static override styles = css`
    .nexio-note-block-container {
      display: flow-root;
    }
    .nexio-note-block-container.selected {
      background-color: var(--nexio-hover-color);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
  }

  override renderBlock() {
    return html`
      <div class="nexio-note-block-container">
        <div class="nexio-block-children-container">
          ${this.renderChildren(this.model)}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-note': NoteBlockComponent;
  }
}
