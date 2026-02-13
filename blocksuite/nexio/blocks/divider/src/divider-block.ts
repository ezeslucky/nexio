import { CaptionedBlockComponent } from '@blocksuite/nexio-components/caption';
import type { DividerBlockModel } from '@blocksuite/nexio-model';
import { BLOCK_CHILDREN_CONTAINER_PADDING_LEFT } from '@blocksuite/nexio-shared/consts';
import { BlockSelection } from '@blocksuite/std';
import { html } from 'lit';

import { dividerBlockStyles } from './styles.js';

export class DividerBlockComponent extends CaptionedBlockComponent<DividerBlockModel> {
  static override styles = dividerBlockStyles;

  override connectedCallback() {
    super.connectedCallback();

    this.contentEditable = 'false';

    this.handleEvent('click', () => {
      this.host.selection.setGroup('note', [
        this.host.selection.create(BlockSelection, {
          blockId: this.blockId,
        }),
      ]);
    });
  }

  override renderBlock() {
    const children = html`<div
      class="nexio-block-children-container"
      style="padding-left: ${BLOCK_CHILDREN_CONTAINER_PADDING_LEFT}px"
    >
      ${this.renderChildren(this.model)}
    </div>`;

    return html`
      <div class="nexio-divider-block-container">
        <hr />

        ${children}
      </div>
    `;
  }

  override accessor useZeroWidth = true;
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-divider': DividerBlockComponent;
  }
}
