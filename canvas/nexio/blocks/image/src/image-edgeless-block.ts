import type { BlockCaptionEditor } from '@canvas/nexio-components/caption';
import { LoadingIcon } from '@canvas/nexio-components/icons';
import { Peekable } from '@canvas/nexio-components/peek';
import { ResourceController } from '@canvas/nexio-components/resource';
import {
  type ImageBlockModel,
  ImageBlockSchema,
} from '@canvas/nexio-model';
import { cssVarV2, unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { formatSize } from '@canvas/nexio-shared/utils';
import { BrokenImageIcon, ImageIcon } from '@blocksuite/icons/lit';
import { GfxBlockComponent } from '@canvas/std';
import { GfxViewInteractionExtension } from '@canvas/std/gfx';
import { computed } from '@preact/signals-core';
import { css, html } from 'lit';
import { query } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';

import {
  copyImageBlob,
  downloadImageBlob,
  refreshData,
  turnImageIntoCardView,
} from './utils';

@Peekable()
export class ImageEdgelessBlockComponent extends GfxBlockComponent<ImageBlockModel> {
  static override styles = css`
    nexio-edgeless-image {
      position: relative;
    }

    nexio-edgeless-image .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 4px;
      right: 4px;
      width: 36px;
      height: 36px;
      padding: 5px;
      border-radius: 8px;
      background: ${unsafeCSSVarV2(
        'loading/imageLoadingBackground',
        '#92929238'
      )};

      & > svg {
        font-size: 25.71px;
      }
    }

    nexio-edgeless-image .nexio-image-status {
      position: absolute;
      left: 18px;
      bottom: 18px;
    }

    nexio-edgeless-image .resizable-img,
    nexio-edgeless-image .resizable-img img {
      width: 100%;
      height: 100%;
    }
  `;

  resourceController = new ResourceController(
    computed(() => this.model.props.sourceId$.value),
    'Image'
  );

  get blobUrl() {
    return this.resourceController.blobUrl$.value;
  }

  convertToCardView = () => {
    turnImageIntoCardView(this).catch(console.error);
  };

  copy = () => {
    copyImageBlob(this).catch(console.error);
  };

  download = () => {
    downloadImageBlob(this).catch(console.error);
  };

  refreshData = () => {
    refreshData(this).catch(console.error);
  };

  private _handleError() {
    this.resourceController.updateState({
      errorMessage: 'Failed to download image!',
    });
  }

  override connectedCallback() {
    super.connectedCallback();

    this.contentEditable = 'false';

    this.resourceController.setEngine(this.std.store.blobSync);

    this.disposables.add(this.resourceController.subscribe());
    this.disposables.add(this.resourceController);

    this.disposables.add(
      this.model.props.sourceId$.subscribe(() => {
        this.refreshData();
      })
    );
  }

  override renderGfxBlock() {
    const blobUrl = this.blobUrl;
    const { rotate = 0, size = 0, caption = 'Image' } = this.model.props;

    const containerStyleMap = styleMap({
      display: 'flex',
      position: 'relative',
      width: '100%',
      height: '100%',
      transform: `rotate(${rotate}deg)`,
      transformOrigin: 'center',
    });

    const resovledState = this.resourceController.resolveStateWith({
      loadingIcon: LoadingIcon({
        strokeColor: cssVarV2('button/pureWhiteText'),
        ringColor: cssVarV2('loading/imageLoadingLayer', '#ffffff8f'),
      }),
      errorIcon: BrokenImageIcon(),
      icon: ImageIcon(),
      title: 'Image',
      description: formatSize(size),
    });

    const { loading, icon, description, error, needUpload } = resovledState;

    return html`
      <div class="nexio-image-container" style=${containerStyleMap}>
        ${when(
          blobUrl,
          () => html`
            <div class="resizable-img">
              <img
                class="drag-target"
                draggable="false"
                loading="lazy"
                src=${blobUrl}
                alt=${caption}
                @error=${this._handleError}
              />
            </div>
            ${when(loading, () => html`<div class="loading">${icon}</div>`)}
            ${when(
              Boolean(error && description),
              () =>
                html`<nexio-resource-status
                  class="nexio-image-status"
                  .message=${description}
                  .needUpload=${needUpload}
                  .action=${() =>
                    needUpload
                      ? this.resourceController.upload()
                      : this.refreshData()}
                ></nexio-resource-status>`
            )}
          `,
          () =>
            html`<nexio-image-fallback-card
              .state=${resovledState}
            ></nexio-image-fallback-card>`
        )}
        <nexio-block-selection .block=${this}></nexio-block-selection>
      </div>
      <block-caption-editor></block-caption-editor>

      ${Object.values(this.widgets)}
    `;
  }

  @query('block-caption-editor')
  accessor captionEditor!: BlockCaptionEditor | null;

  @query('.resizable-img')
  accessor resizableImg!: HTMLDivElement;
}

export const ImageEdgelessBlockInteraction = GfxViewInteractionExtension(
  ImageBlockSchema.model.flavour,
  {
    resizeConstraint: {
      lockRatio: true,
    },
  }
);

declare global {
  interface HTMLElementTagNameMap {
    'nexio-edgeless-image': ImageEdgelessBlockComponent;
  }
}
