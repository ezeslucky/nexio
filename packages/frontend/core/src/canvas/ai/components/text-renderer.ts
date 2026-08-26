import { createReactComponentFromLit } from '@nexio/component';
import { getViewManager } from '@nexio/core/canvas/manager/view';
import type { FeatureFlagService } from '@nexio/core/modules/feature-flag';
import { PeekViewProvider } from '@canvas/nexio/components/peek';
import { SignalWatcher, WithDisposable } from '@canvas/nexio/global/lit';
import { RefNodeSlotsProvider } from '@canvas/nexio/inlines/reference';
import type { ColorScheme } from '@canvas/nexio/model';
import {
  codeBlockWrapMiddleware,
  defaultImageProxyMiddleware,
  ImageProxyService,
} from '@canvas/nexio/shared/adapters';
import { unsafeCSSVarV2 } from '@canvas/nexio/shared/theme';
import {
  BlockStdScope,
  BlockViewIdentifier,
  type EditorHost,
  ShadowlessElement,
} from '@canvas/nexio/std';
import type {
  ExtensionType,
  Query,
  Store,
  TransformerMiddleware,
} from '@canvas/nexio/store';
import type { Signal } from '@preact/signals-core';
import {
  darkCssVariablesV2,
  lightCssVariablesV2,
} from '@ezeslucky/theme/v2';
import { css, html, nothing, type PropertyValues, unsafeCSS } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { keyed } from 'lit/directives/keyed.js';
import { literal } from 'lit/static-html.js';
import React from 'react';
import { filter } from 'rxjs/operators';

import { markDownToDoc } from '../../utils';
import type { NexioAIPanelState } from '../widgets/ai-panel/type';

export const getCustomPageEditorBlockSpecs: () => ExtensionType[] = () => {
  const manager = getViewManager().config.init().value;
  return [
    ...manager.get('page'),
    {
      setup: di => {
        di.override(
          BlockViewIdentifier('nexio:page'),
          () => literal`nexio-page-root`
        );
      },
    },
  ];
};

const customHeadingStyles = css`
  .custom-heading {
    .h1 {
      font-size: calc(var(--nexio-font-h-1) - 2px);
      code {
        font-size: calc(var(--nexio-font-base) + 6px);
      }
    }
    .h2 {
      font-size: calc(var(--nexio-font-h-2) - 2px);
      code {
        font-size: calc(var(--nexio-font-base) + 4px);
      }
    }
    .h3 {
      font-size: calc(var(--nexio-font-h-3) - 2px);
      code {
        font-size: calc(var(--nexio-font-base) + 2px);
      }
    }
    .h4 {
      font-size: calc(var(--nexio-font-h-4) - 2px);
      code {
        font-size: var(--nexio-font-base);
      }
    }
    .h5 {
      font-size: calc(var(--nexio-font-h-5) - 2px);
      code {
        font-size: calc(var(--nexio-font-base) - 2px);
      }
    }
    .h6 {
      font-size: calc(var(--nexio-font-h-6) - 2px);
      code {
        font-size: calc(var(--nexio-font-base) - 4px);
      }
    }
  }
`;

export type TextRendererOptions = {
  customHeading?: boolean;
  extensions?: ExtensionType[];
  additionalMiddlewares?: TransformerMiddleware[];
  testId?: string;
  nexioFeatureFlagService?: FeatureFlagService;
  theme?: Signal<ColorScheme>;
};

// todo: refactor it for more general purpose usage instead of AI only?
export class TextRenderer extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = css`
    .ai-answer-text-editor.nexio-page-viewport {
      background: transparent;
      font-family: var(--nexio-font-family);
      margin-top: 0;
      margin-bottom: 0;
    }

    .ai-answer-text-editor .nexio-page-root-block-container {
      padding: 0;
      margin: 0;
      line-height: var(--nexio-line-height);
      color: ${unsafeCSSVarV2('text/primary')};
      font-weight: 400;
    }

    .ai-answer-text-editor {
      .nexio-note-block-container {
        > .nexio-block-children-container {
          > :first-child:not(nexio-callout),
          > :first-child:not(nexio-callout) * {
            margin-top: 0 !important;
          }
          > :last-child,
          > :last-child * {
            margin-bottom: 0 !important;
          }
        }
      }

      .nexio-paragraph-block-container {
        line-height: 22px;

        .h6 {
          padding-left: 16px;
          color: ${unsafeCSSVarV2('text/link')};
          font-size: var(--nexio-font-base);

          .toggle-icon {
            transform: translateX(0);
            svg {
              color: ${unsafeCSSVarV2('text/link')};
            }
          }
        }
      }
    }

    .text-renderer-container {
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0;
      overscroll-behavior-y: none;
    }
    .text-renderer-container.show-scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 100px;
    }
    .text-renderer-container.show-scrollbar::-webkit-scrollbar-thumb {
      border-radius: 20px;
    }
    .text-renderer-container.show-scrollbar:hover::-webkit-scrollbar-thumb {
      background-color: var(--nexio-black-30);
    }
    .text-renderer-container.show-scrollbar::-webkit-scrollbar-corner {
      display: none;
    }

    .text-renderer-container {
      rich-text .nowrap-lines v-text span,
      rich-text .nowrap-lines v-element span {
        white-space: pre;
      }
      editor-host:focus-visible {
        outline: none;
      }
      editor-host * {
        box-sizing: border-box;
      }
      editor-host {
        isolation: isolate;
      }
    }

    .text-renderer-container[data-app-theme='dark'] {
      .ai-answer-text-editor .nexio-page-root-block-container {
        color: ${unsafeCSS(darkCssVariablesV2['--nexio-v2-text-primary'])};
      }
    }

    .text-renderer-container[data-app-theme='light'] {
      .ai-answer-text-editor .nexio-page-root-block-container {
        color: ${unsafeCSS(lightCssVariablesV2['--nexio-v2-text-primary'])};
      }
    }

    ${customHeadingStyles}
  `;

  private _answers: string[] = [];

  private _maxContainerHeight = 0;

  private readonly _clearTimer = () => {
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  };

  private _doc: Store | null = null;

  private _host: EditorHost | null = null;

  private readonly _query: Query = {
    mode: 'strict',
    match: [
      'nexio:page',
      'nexio:note',
      'nexio:table',
      'nexio:surface',
      'nexio:paragraph',
      'nexio:callout',
      'nexio:code',
      'nexio:list',
      'nexio:divider',
      'nexio:latex',
      'nexio:bookmark',
      'nexio:attachment',
      'nexio:embed-linked-doc',
    ].map(flavour => ({ flavour, viewType: 'display' })),
  };

  private _timer?: ReturnType<typeof setInterval> | null = null;

  private readonly _subscribeDocLinkClicked = () => {
    const refNodeSlots = this._host?.std.getOptional(RefNodeSlotsProvider);
    if (!refNodeSlots) return;
    this.disposables.add(
      refNodeSlots.docLinkClicked
        .pipe(
          filter(
            options => !!this._previewHost && options.host === this._previewHost
          )
        )
        .subscribe(options => {
          // Open the doc in center peek
          this._host?.std
            .getOptional(PeekViewProvider)
            ?.peek({
              docId: options.pageId,
            })
            .catch(console.error);
        })
    );
  };

  private readonly _updateDoc = () => {
    if (this._answers.length > 0) {
      const latestAnswer = this._answers.pop();
      this._answers = [];
      if (latestAnswer) {
        const middlewares = [
          defaultImageProxyMiddleware,
          codeBlockWrapMiddleware(true),
          ...(this.options.additionalMiddlewares ?? []),
        ];
        markDownToDoc(
          latestAnswer,
          middlewares,
          this.options.nexioFeatureFlagService
        )
          .then(doc => {
            this.disposeDoc();
            this._doc = doc.doc.getStore({
              query: this._query,
            });
            this._host = new BlockStdScope({
              store: this._doc,
              extensions:
                this.options.extensions ?? getCustomPageEditorBlockSpecs(),
            }).render();
            this.disposables.add(() => {
              doc.doc.removeStore({ query: this._query });
            });
            this._doc.readonly = true;
            this.requestUpdate();
            if (this.state !== 'generating') {
              this._doc.load();
              const imageProxyService = this._host.std.get(ImageProxyService);
              imageProxyService.setImageProxyURL(
                imageProxyService.imageProxyURL
              );
              this._clearTimer();
            }
          })
          .catch(console.error);
      }
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    this._answers.push(this.answer);

    this._updateDoc();
    if (this.state === 'generating') {
      this._timer = setInterval(this._updateDoc, 600);
    }
  }

  override firstUpdated() {
    this._subscribeDocLinkClicked();
  }

  private disposeDoc() {
    this._doc?.dispose();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._clearTimer();
    this.disposeDoc();
  }

  override render() {
    if (!this._doc) {
      return nothing;
    }

    const { customHeading, testId = 'ai-text-renderer' } = this.options;
    const classes = classMap({
      'text-renderer-container': true,
      'custom-heading': !!customHeading,
    });
    const theme = this.options.theme?.value;
    return html`
      <div
        class=${classes}
        data-testid=${testId}
        data-app-theme=${theme ?? 'light'}
      >
        ${keyed(
          this._doc,
          html`<div class="ai-answer-text-editor nexio-page-viewport">
            ${this._host}
          </div>`
        )}
      </div>
    `;
  }

  override shouldUpdate(changedProperties: PropertyValues) {
    if (changedProperties.has('answer')) {
      this._answers.push(this.answer);
      return false;
    }

    return true;
  }

  override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    requestAnimationFrame(() => {
      if (!this._container) return;
      // Track max height during generation
      if (this.state === 'generating') {
        this._maxContainerHeight = Math.max(
          this._maxContainerHeight,
          this._container.scrollHeight
        );
        // Apply min-height to prevent shrinking
        this._container.style.minHeight = `${this._maxContainerHeight}px`;
      } else {
        setTimeout(() => {
          this._maxContainerHeight = 0;
          this._container.style.minHeight = '';
        }, 500);
      }
    });
  }

  @query('.text-renderer-container')
  private accessor _container!: HTMLDivElement;

  @query('.text-renderer-container editor-host')
  private accessor _previewHost: EditorHost | null = null;

  @property({ attribute: false })
  accessor answer!: string;

  @property({ attribute: false })
  accessor options!: TextRendererOptions;

  @property({ attribute: false })
  accessor state: NexioAIPanelState | undefined = undefined;
}

export const createTextRenderer = (options: TextRendererOptions) => {
  return (answer: string, state?: NexioAIPanelState) => {
    return html`<text-renderer
      contenteditable="false"
      .answer=${answer}
      .state=${state}
      .options=${options}
    ></text-renderer>`;
  };
};

export const LitTextRenderer = createReactComponentFromLit({
  react: React,
  elementClass: TextRenderer,
});

declare global {
  interface HTMLElementTagNameMap {
    'text-renderer': TextRenderer;
  }
}
