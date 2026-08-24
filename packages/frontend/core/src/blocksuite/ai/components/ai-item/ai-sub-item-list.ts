import { EnterIcon } from '@canvas/nexio/components/icons';
import { WithDisposable } from '@canvas/nexio/global/lit';
import { stopPropagation } from '@canvas/nexio/shared/utils';
import {
  EditorHost,
  PropTypes,
  requiredProperties,
} from '@canvas/nexio/std';
import { baseTheme } from '@ezeslucky/theme';
import { css, html, LitElement, nothing, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

import { menuItemStyles } from './styles';
import type { AIItemConfig, AISubItemConfig } from './types';

@requiredProperties({
  host: PropTypes.instanceOf(EditorHost),
  item: PropTypes.object,
})
export class AISubItemList extends WithDisposable(LitElement) {
  static override styles = css`
    .ai-sub-menu {
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      padding: 8px;
      min-width: 240px;
      max-height: 320px;
      overflow-y: auto;
      background: var(--nexio-background-overlay-panel-color);
      box-shadow: var(--nexio-shadow-2);
      border-radius: 8px;
      z-index: var(--nexio-z-index-popover);
      font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
      color: var(--nexio-text-primary-color);
      text-align: justify;
      font-feature-settings:
        'clig' off,
        'liga' off;
      font-size: var(--nexio-font-sm);
      font-style: normal;
      font-weight: 400;
      line-height: 22px;
      user-select: none;
    }
    ${menuItemStyles}
  `;

  private readonly _handleClick = (subItem: AISubItemConfig) => {
    this.onClick?.();
    if (subItem.handler) {
      // TODO: add parameters to ai handler
      subItem.handler(this.host);
    }
    this.abortController.abort();
  };

  override connectedCallback() {
    super.connectedCallback();

    this.disposables.addFromEvent(this, 'pointerdown', stopPropagation);
  }

  override render() {
    if (!this.item.subItem || this.item.subItem.length <= 0) return nothing;
    return html`<div class="ai-sub-menu">
      ${repeat(
        this.item.subItem,
        subItem => subItem.type,
        subItem =>
          html`<div
            data-testid=${subItem.testId}
            class="menu-item"
            @click=${() => this._handleClick(subItem)}
          >
            <div class="item-name">${subItem.type}</div>
            <span class="enter-icon">${EnterIcon}</span>
          </div>`
      )}
    </div>`;
  }

  @property({ attribute: false })
  accessor abortController: AbortController = new AbortController();

  @property({ attribute: false })
  accessor host!: EditorHost;

  @property({ attribute: false })
  accessor item!: AIItemConfig;

  @property({ attribute: false })
  accessor onClick: (() => void) | undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    'ai-sub-item-list': AISubItemList;
  }
}
