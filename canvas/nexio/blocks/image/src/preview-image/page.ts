import type { ImageBlockModel } from '@canvas/nexio-model';
import { unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { ImageIcon } from '@blocksuite/icons/lit';
import { BlockComponent } from '@canvas/std';
import { css, html } from 'lit';

export class ImagePlaceholderBlockComponent extends BlockComponent<ImageBlockModel> {
  static override styles = css`
    .nexio-placeholder-preview-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      padding: 4px;
      box-sizing: border-box;

      border-radius: 8px;
      background-color: ${unsafeCSSVarV2(
        'layer/background/overlayPanel',
        '#FBFBFC'
      )};
    }

    .placeholder-preview-content {
      padding: 4px 16px;
      display: flex;
      gap: 8px;
    }

    .placeholder-preview-content > svg {
      color: ${unsafeCSSVarV2('icon/primary', '#77757D')};
    }

    .placeholder-preview-content > .text {
      color: var(--nexio-text-primary-color);
      color: ${unsafeCSSVarV2('text/primary', '#121212')};
      font-size: 14px;
      line-height: 24px;
    }
  `;

  override renderBlock() {
    return html`<div
      class="nexio-placeholder-preview-container"
      contenteditable="false"
    >
      <div class="placeholder-preview-content">
        ${ImageIcon({ width: '24px', height: '24px' })}
        <span class="text">Image Block</span>
      </div>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-placeholder-preview-image': ImagePlaceholderBlockComponent;
  }
}
