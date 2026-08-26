import { SignalWatcher, WithDisposable } from '@canvas/nexio/global/lit';
import { noop } from '@canvas/nexio/global/utils';
import { ThemeProvider } from '@canvas/nexio/shared/services';
import {
  BlockStdScope,
  EditorHost,
  ShadowlessElement,
} from '@canvas/nexio/std';
import type { ExtensionType, Store } from '@canvas/nexio/store';
import { css, html, nothing } from 'lit';
import { property, state } from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';

noop(EditorHost);

export class PageEditor extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = css`
    page-editor {
      font-family: var(--nexio-font-family);
      background: var(--nexio-background-primary-color);
    }

    page-editor * {
      box-sizing: border-box;
    }

    @media print {
      page-editor {
        height: auto;
      }
    }

    .nexio-page-viewport {
      position: relative;
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
      container-name: viewport;
      container-type: inline-size;
    }

    .page-editor-container {
      display: block;
      height: 100%;
    }
  `;

  get host() {
    try {
      return this.std.host;
    } catch {
      return null;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this._disposables.add(
      this.doc.slots.rootAdded.subscribe(() => this.requestUpdate())
    );
    this.std = new BlockStdScope({
      store: this.doc,
      extensions: this.specs,
    });
  }

  override async getUpdateComplete(): Promise<boolean> {
    const result = await super.getUpdateComplete();
    await this.host?.updateComplete;
    return result;
  }

  override render() {
    if (!this.doc.root) return nothing;

    const std = this.std;
    const theme = std.get(ThemeProvider).app$.value;
    return html`
      <div data-theme=${theme} class="page-editor-container">
        ${guard([std], () => std.render())}
      </div>
    `;
  }

  override willUpdate(
    changedProperties: Map<string | number | symbol, unknown>
  ) {
    super.willUpdate(changedProperties);
    if (
      this.hasUpdated && // skip the first update
      changedProperties.has('doc')
    ) {
      this.std = new BlockStdScope({
        store: this.doc,
        extensions: this.specs,
      });
    }
  }

  @property({ attribute: false })
  accessor doc!: Store;

  @property({ attribute: false })
  accessor specs: ExtensionType[] = [];

  @state()
  accessor std!: BlockStdScope;
}

declare global {
  interface HTMLElementTagNameMap {
    'page-editor': PageEditor;
  }
}
