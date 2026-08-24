import { sortEdgelessElements } from '@canvas/nexio/blocks/root';
import { AIStarIcon } from '@canvas/nexio/components/icons';
import { WithDisposable } from '@canvas/nexio/global/lit';
import type { EditorHost } from '@canvas/nexio/std';
import {
  GfxControllerIdentifier,
  isGfxGroupCompatibleModel,
} from '@canvas/nexio/std/gfx';
import { css, html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { AIItemGroupConfig } from '../../components/ai-item/types';
import { CopilotTool } from '../../tool/copilot-tool';

export class EdgelessCopilotToolbarEntry extends WithDisposable(LitElement) {
  static override styles = css`
    .copilot-icon-button {
      line-height: 20px;

      .label.medium {
        color: var(--nexio-brand-color);
      }
    }
  `;

  private readonly _onClick = () => {
    this.onClick?.();
    this._showCopilotPanel();
  };

  private get _gfx() {
    return this.host.std.get(GfxControllerIdentifier);
  }

  private _showCopilotPanel() {
    const selectedElements = sortEdgelessElements(
      this._gfx.selection.selectedElements
    );
    const toBeSelected = new Set(selectedElements);

    selectedElements.forEach(element => {
      // its descendants are already selected
      if (toBeSelected.has(element)) return;

      toBeSelected.add(element);

      if (isGfxGroupCompatibleModel(element)) {
        element.descendantElements.forEach(descendant => {
          toBeSelected.add(descendant);
        });
      }
    });

    this._gfx.tool.setTool(CopilotTool);
    (this._gfx.tool.currentTool$.peek() as CopilotTool).updateSelectionWith(
      Array.from(toBeSelected),
      10
    );
  }

  override render() {
    return html`<edgeless-tool-icon-button
      aria-label="Ask AI"
      class="copilot-icon-button"
      data-testid="ask-ai-button"
      @click=${this._onClick}
    >
      ${AIStarIcon} <span class="label medium">Ask AI</span>
    </edgeless-tool-icon-button>`;
  }

  @property({ attribute: false })
  accessor groups!: AIItemGroupConfig[];

  @property({ attribute: false })
  accessor host!: EditorHost;

  @property({ attribute: false })
  accessor onClick: (() => void) | undefined = undefined;
}
