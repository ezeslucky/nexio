import { SignalWatcher, WithDisposable } from '@canvas/nexio/global/lit';
import { ThemeProvider } from '@canvas/nexio/shared/services';
import { BlockStdScope, ShadowlessElement } from '@canvas/nexio/std';
import type { ExtensionType, Store } from '@canvas/nexio/store';
import { css, html, nothing, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { guard } from 'lit/directives/guard.js';

export class EdgelessEditor extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  static override styles = css`
    edgeless-editor {
      font-family: var(--nexio-font-family);
      background: var(--nexio-background-primary-color);
    }

    edgeless-editor * {
      box-sizing: border-box;
    }

    @media print {
      edgeless-editor {
        height: auto;
      }
    }

    .nexio-edgeless-viewport {
      display: block;
      height: 100%;
      position: relative;
      overflow: clip;
      container-name: viewport;
      container-type: inline-size;
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
    const theme = std.get(ThemeProvider).edgeless$.value;
    return html`
      <div class="nexio-edgeless-viewport" data-theme=${theme}>
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
  accessor editor!: TemplateResult;

  @property({ attribute: false })
  accessor specs: ExtensionType[] = [];

  @state()
  accessor std!: BlockStdScope;
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-editor': EdgelessEditor;
  }
}
