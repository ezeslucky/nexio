import { BRUSH_LINE_WIDTHS, LineWidth } from '@canvas/nexio-model';
import { WithDisposable } from '@canvas/global/lit';
import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import type { SliderSelectEvent } from '../slider';

export class EdgelessLineWidthPanel extends WithDisposable(LitElement) {
  private _onSelect(lineWidth: number) {
    this.dispatchEvent(
      new CustomEvent('select', {
        detail: lineWidth,
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    );
  }

  override render() {
    return html`<nexio-slider
      ?disabled=${this.disabled}
      .range=${{ points: this.lineWidths }}
      .value=${this.selectedSize}
      .tooltip=${this.hasTooltip ? 'Thickness' : undefined}
      @select=${(e: SliderSelectEvent) => {
        e.stopPropagation();
        this._onSelect(e.detail.value);
      }}
    ></nexio-slider>`;
  }

  @property({ attribute: false })
  accessor disabled = false;

  @property({ attribute: false })
  accessor hasTooltip = true;

  @property({ attribute: false })
  accessor lineWidths: number[] = BRUSH_LINE_WIDTHS;

  @property({ attribute: false })
  accessor selectedSize: number = LineWidth.Two;
}

declare global {
  interface HTMLElementTagNameMap {
    'edgeless-line-width-panel': EdgelessLineWidthPanel;
  }
}
