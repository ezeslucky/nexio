import {
  CaptionedBlockComponent,
  SelectedStyle,
} from '@canvas/nexio-components/caption';
import {
  getAttachmentFileIcon,
  LoadingIcon,
} from '@canvas/nexio-components/icons';
import { Peekable } from '@canvas/nexio-components/peek';
import {
  type ResolvedStateInfo,
  ResourceController,
} from '@canvas/nexio-components/resource';
import { toast } from '@canvas/nexio-components/toast';
import {
  type AttachmentBlockModel,
  AttachmentBlockStyles,
} from '@canvas/nexio-model';
import {
  BlockElementCommentManager,
  CitationProvider,
  DocModeProvider,
  FileSizeLimitProvider,
  TelemetryProvider,
} from '@canvas/nexio-shared/services';
import {
  formatSize,
  openSingleFileWith,
} from '@canvas/nexio-shared/utils';
import {
  AttachmentIcon,
  ResetIcon,
  UpgradeIcon,
  WarningIcon,
} from '@canvas/icons/lit';
import { BlockSelection } from '@canvas/std';
import { nanoid, Slice } from '@canvas/store';
import { batch, computed, signal } from '@preact/signals-core';
import { html, type TemplateResult } from 'lit';
import { choose } from 'lit/directives/choose.js';
import { type ClassInfo, classMap } from 'lit/directives/class-map.js';
import { guard } from 'lit/directives/guard.js';
import { styleMap } from 'lit/directives/style-map.js';
import { when } from 'lit/directives/when.js';
import { filter } from 'rxjs/operators';

import { AttachmentEmbedProvider } from './embed';
import { styles } from './styles';
import { downloadAttachmentBlob, getFileType, refreshData } from './utils';

type AttachmentResolvedStateInfo = ResolvedStateInfo & {
  kind?: TemplateResult;
};

@Peekable({
  enableOn: ({ model }: AttachmentBlockComponent) => {
    return !model.store.readonly && model.props.type.endsWith('pdf');
  },
})
export class AttachmentBlockComponent extends CaptionedBlockComponent<AttachmentBlockModel> {
  static override styles = styles;

  blockDraggable = true;

  resourceController = new ResourceController(
    computed(() => this.model.props.sourceId$.value)
  );

  get blobUrl() {
    return this.resourceController.blobUrl$.value;
  }

  get filetype() {
    const name = this.model.props.name$.value;
    return name.split('.').pop() ?? '';
  }

  protected containerStyleMap = styleMap({
    position: 'relative',
    width: '100%',
    margin: '18px 0px',
  });

  private get _maxFileSize() {
    return this.std.get(FileSizeLimitProvider).maxFileSize;
  }

  get citationService() {
    return this.std.get(CitationProvider);
  }

  get isCitation() {
    return this.citationService.isCitationModel(this.model);
  }

  get isCommentHighlighted() {
    return (
      this.std
        .getOptional(BlockElementCommentManager)
        ?.isBlockCommentHighlighted(this.model) ?? false
    );
  }

  convertTo = () => {
    return this.std
      .get(AttachmentEmbedProvider)
      .convertTo(this.model, this._maxFileSize);
  };

  copy = () => {
    const slice = Slice.fromModels(this.store, [this.model]);
    this.std.clipboard.copySlice(slice).catch(console.error);
    toast(this.host, 'Copied to clipboard');
  };

  download = () => {
    downloadAttachmentBlob(this);
  };

  embedded = () => {
    return (
      Boolean(this.blobUrl) &&
      this.std
        .get(AttachmentEmbedProvider)
        .embedded(this.model, this._maxFileSize)
    );
  };

  open = () => {
    const blobUrl = this.blobUrl;
    if (!blobUrl) return;
    window.open(blobUrl, '_blank');
  };

  // Refreshes data.
  refreshData = () => {
    refreshData(this).catch(console.error);
  };

  private readonly _refreshKey$ = signal<string | null>(null);

  // Refreshes the embed component.
  reload = () => {
    batch(() => {
      if (this.model.props.embed$.value) {
        this._refreshKey$.value = nanoid();
        return;
      }

      this.refreshData();
    });
  };

  // Replaces the current attachment.
  replace = async () => {
    const state = this.resourceController.state$.peek();
    if (state.uploading) return;

    const file = await openSingleFileWith();
    if (!file) return;

    const sourceId = await this.std.store.blobSync.set(file);
    const type = await getFileType(file);
    const { name, size } = file;

    let embed = this.model.props.embed$.value ?? false;

    this.std.store.captureSync();
    this.std.store.transact(() => {
      this.std.store.updateBlock(this.blockId, {
        name,
        size,
        type,
        sourceId,
        embed: false,
      });

      const provider = this.std.get(AttachmentEmbedProvider);
      embed &&= provider.embedded(this.model);

      if (embed) {
        provider.convertTo(this.model);
      }

      // Reloads
      this.reload();
    });
  };

  private _selectBlock() {
    const selectionManager = this.host.selection;
    const blockSelection = selectionManager.create(BlockSelection, {
      blockId: this.blockId,
    });
    selectionManager.setGroup('note', [blockSelection]);
  }

  private readonly _trackCitationDeleteEvent = () => {
    // Check citation delete event
    this._disposables.add(
      this.std.store.slots.blockUpdated
        .pipe(
          filter(payload => {
            if (!payload.isLocal) return false;

            const { flavour, id, type } = payload;
            if (
              type !== 'delete' ||
              flavour !== this.model.flavour ||
              id !== this.model.id
            )
              return false;

            const { model } = payload;
            if (!this.citationService.isCitationModel(model)) return false;

            return true;
          })
        )
        .subscribe(() => {
          this.citationService.trackEvent('Delete');
        })
    );
  };

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

    if (!this.model.props.style && !this.store.readonly) {
      this.store.withoutTransact(() => {
        this.store.updateBlock(this.model, {
          style: AttachmentBlockStyles[1],
        });
      });
    }

    this._trackCitationDeleteEvent();
  }

  override firstUpdated() {
    // lazy bindings
    this.disposables.addFromEvent(this, 'click', this.onClick);
  }

  protected onClick(event: MouseEvent) {
    // the peek view need handle shift + click
    if (event.defaultPrevented) return;

    event.stopPropagation();

    if (!this.selected$.peek()) {
      this._selectBlock();
    }
  }

  protected renderUpgradeButton = () => {
    if (this.std.store.readonly) return null;

    const onOverFileSize = this.std.get(FileSizeLimitProvider).onOverFileSize;

    return when(
      onOverFileSize,
      () => html`
        <button
          class="nexio-attachment-content-button"
          @click=${(event: MouseEvent) => {
            event.stopPropagation();
            onOverFileSize?.();

            {
              const mode =
                this.std.get(DocModeProvider).getEditorMode() ?? 'page';
              const segment = mode === 'page' ? 'doc' : 'whiteboard';
              this.std
                .getOptional(TelemetryProvider)
                ?.track('AttachmentUpgradedEvent', {
                  segment,
                  page: `${segment} editor`,
                  module: 'attachment',
                  control: 'upgrade',
                  category: 'card',
                  type: this.model.props.name.split('.').pop() ?? '',
                });
            }
          }}
        >
          ${UpgradeIcon()} Upgrade
        </button>
      `
    );
  };

  protected renderNormalButton = (needUpload: boolean) => {
    const label = needUpload ? 'retry' : 'reload';
    const run = async () => {
      if (needUpload) {
        await this.resourceController.upload();
        return;
      }

      this.refreshData();
    };

    return html`
      <button
        class="nexio-attachment-content-button"
        @click=${(event: MouseEvent) => {
          event.stopPropagation();
          run().catch(console.error);

          {
            const mode =
              this.std.get(DocModeProvider).getEditorMode() ?? 'page';
            const segment = mode === 'page' ? 'doc' : 'whiteboard';
            this.std
              .getOptional(TelemetryProvider)
              ?.track('AttachmentReloadedEvent', {
                segment,
                page: `${segment} editor`,
                module: 'attachment',
                control: label,
                category: 'card',
                type: this.filetype,
              });
          }
        }}
      >
        ${ResetIcon()} ${label}
      </button>
    `;
  };

  protected renderWithHorizontal(
    classInfo: ClassInfo,
    {
      icon,
      title,
      description,
      kind,
      state,
      needUpload,
    }: AttachmentResolvedStateInfo
  ) {
    return html`
      <div class=${classMap(classInfo)}>
        <div class="nexio-attachment-content">
          <div class="nexio-attachment-content-title">
            <div class="nexio-attachment-content-title-icon">${icon}</div>
            <div class="nexio-attachment-content-title-text truncate">
              ${title}
            </div>
          </div>

          <div class="nexio-attachment-content-description">
            <div class="nexio-attachment-content-info truncate">
              ${description}
            </div>
            ${choose(state, [
              ['error', () => this.renderNormalButton(needUpload)],
              ['error:oversize', this.renderUpgradeButton],
            ])}
          </div>
        </div>

        <div class="nexio-attachment-banner">${kind}</div>
      </div>
    `;
  }

  protected renderWithVertical(
    classInfo: ClassInfo,
    {
      icon,
      title,
      description,
      kind,
      state,
      needUpload,
    }: AttachmentResolvedStateInfo
  ) {
    return html`
      <div class=${classMap(classInfo)}>
        <div class="nexio-attachment-content">
          <div class="nexio-attachment-content-title">
            <div class="nexio-attachment-content-title-icon">${icon}</div>
            <div class="nexio-attachment-content-title-text truncate">
              ${title}
            </div>
          </div>

          <div class="nexio-attachment-content-info truncate">
            ${description}
          </div>
        </div>

        <div class="nexio-attachment-banner">
          ${kind}
          ${choose(state, [
            ['error', () => this.renderNormalButton(needUpload)],
            ['error:oversize', this.renderUpgradeButton],
          ])}
        </div>
      </div>
    `;
  }

  protected resolvedState$ = computed<AttachmentResolvedStateInfo>(() => {
    const size = this.model.props.size;
    const name = this.model.props.name$.value;
    const kind = getAttachmentFileIcon(this.filetype);

    const resolvedState = this.resourceController.resolveStateWith({
      loadingIcon: LoadingIcon(),
      errorIcon: WarningIcon(),
      icon: AttachmentIcon(),
      title: name,
      description: formatSize(size),
    });

    return { ...resolvedState, kind };
  });

  protected renderCardView = () => {
    const resolvedState = this.resolvedState$.value;
    const cardStyle = this.model.props.style$.value ?? AttachmentBlockStyles[1];

    const classInfo = {
      'nexio-attachment-card': true,
      [cardStyle]: true,
      loading: resolvedState.loading,
      error: resolvedState.error,
    };

    return when(
      cardStyle === 'cubeThick',
      () => this.renderWithVertical(classInfo, resolvedState),
      () => this.renderWithHorizontal(classInfo, resolvedState)
    );
  };

  protected renderEmbedView = () => {
    const { model, blobUrl } = this;
    if (!model.props.embed$.value || !blobUrl) return null;

    const { std, _maxFileSize } = this;
    const provider = std.get(AttachmentEmbedProvider);

    const render = provider.getRender(model, _maxFileSize);
    if (!render) return null;

    const enabled = provider.shouldShowStatus(model);

    return html`
      <div class="nexio-attachment-embed-container">
        ${guard([this._refreshKey$.value], () => render(model, blobUrl))}
      </div>
      ${when(enabled, () => {
        const resolvedState = this.resolvedState$.value;
        if (resolvedState.state !== 'error') return null;
        // It should be an error messge.
        const message = resolvedState.description;
        if (!message) return null;

        const needUpload = resolvedState.needUpload;
        const action = () =>
          needUpload ? this.resourceController.upload() : this.reload();

        return html`
          <nexio-resource-status
            class="nexio-attachment-embed-status"
            .message=${message}
            .needUpload=${needUpload}
            .action=${action}
          ></nexio-resource-status>
        `;
      })}
    `;
  };

  private readonly _renderCitation = () => {
    const { name, footnoteIdentifier } = this.model.props;
    const icon = getAttachmentFileIcon(this.filetype);

    return html`<nexio-citation-card
      .icon=${icon}
      .citationTitle=${name}
      .citationIdentifier=${footnoteIdentifier}
      .active=${this.selected$.value}
    ></nexio-citation-card>`;
  };

  override renderBlock() {
    return html`
      <div
        class=${classMap({
          'nexio-attachment-container': true,
          focused: this.selected$.value,
          'comment-highlighted': this.isCommentHighlighted,
        })}
        style=${this.containerStyleMap}
      >
        ${when(
          this.isCitation,
          () => this._renderCitation(),
          () => this.renderEmbedView() ?? this.renderCardView()
        )}
      </div>
    `;
  }

  override accessor selectedStyle = SelectedStyle.Border;

  override accessor useCaptionEditor = true;
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-attachment': AttachmentBlockComponent;
  }
}
