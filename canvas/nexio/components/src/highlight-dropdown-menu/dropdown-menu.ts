import type { NexioTextStyleAttributes } from '@canvas/nexio-shared/types';
import { PropTypes, requiredProperties } from '@canvas/std';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { html } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';

import { EditorChevronDown } from '../toolbar';

const colors = [
  'default',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'grey',
] as const;

export type HighlightType = Pick<
  NexioTextStyleAttributes,
  'color' | 'background'
>;


@requiredProperties({
  updateHighlight: PropTypes.instanceOf(Function),
})
export class HighlightDropdownMenu extends LitElement {
  @property({ attribute: false })
  accessor updateHighlight!: (styles: HighlightType) => void;

  private readonly _update = (style: HighlightType) => {
    // latestHighlightColor = value;
    // latestHighlightType = type;

    this.updateHighlight(style);
  };

  override render() {
    const prefix = '--nexio-text-highlight';

    return html`
      <editor-menu-button
        .contentPadding="${'8px'}"
        .button=${html`
          <editor-icon-button aria-label="highlight" .tooltip="${'Highlight'}">
            <nexio-highlight-duotone-icon
              style=${styleMap({
                '--color':
                  // latestHighlightColor ?? 'var(--nexio-text-primary-color)',
                  'var(--nexio-text-primary-color)',
              })}
            ></nexio-highlight-duotone-icon>
            ${EditorChevronDown}
          </editor-icon-button>
        `}
      >
        <div data-size="large" data-orientation="vertical">
          <div class="highlight-heading">Color</div>
          ${repeat(colors, color => {
            const isDefault = color === 'default';
            const value = isDefault
              ? null
              : `var(${prefix}-foreground-${color})`;
            return html`
              <editor-menu-action
                data-testid="foreground-${color}"
                @click=${() => this._update({ color: value })}
              >
                <nexio-text-duotone-icon
                  style=${styleMap({
                    '--color': value ?? 'var(--nexio-text-primary-color)',
                  })}
                ></nexio-text-duotone-icon>
                <span class="label capitalize"
                  >${isDefault ? `${color} color` : color}</span
                >
              </editor-menu-action>
            `;
          })}

          <div class="highlight-heading">Background</div>
          ${repeat(colors, color => {
            const isDefault = color === 'default';
            const value = isDefault ? null : `var(${prefix}-${color})`;
            return html`
              <editor-menu-action
                data-testid="background-${color}"
                @click=${() => this._update({ background: value })}
              >
                <nexio-text-duotone-icon
                  style=${styleMap({
                    '--color': 'var(--nexio-text-primary-color)',
                    '--background': value ?? 'transparent',
                  })}
                ></nexio-text-duotone-icon>

                <span class="label capitalize"
                  >${isDefault ? `${color} background` : color}</span
                >
              </editor-menu-action>
            `;
          })}
        </div>
      </editor-menu-button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-highlight-dropdown-menu': HighlightDropdownMenu;
  }
}
