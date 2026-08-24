import { ArrowUpSmallIcon } from '@canvas/icons/lit';
import { ShadowlessElement } from '@canvas/std';
import { css, html } from 'lit';

export class ToolbarArrowUpIcon extends ShadowlessElement {
  static override styles = css`
    .arrow-up-icon {
      position: absolute;
      top: -2px;
      right: -2px;
    }
  `;

  override render() {
    return html`<span class="arrow-up-icon"> ${ArrowUpSmallIcon()} </span>`;
  }
}
