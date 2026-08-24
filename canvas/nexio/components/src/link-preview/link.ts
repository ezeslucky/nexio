import { getHostName } from '@canvas/nexio-shared/utils';
import { PropTypes, requiredProperties } from '@canvas/std';
import { css, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { html } from 'lit-html';

@requiredProperties({
  url: PropTypes.string,
})
export class LinkPreview extends LitElement {
  static override styles = css`
    .nexio-link-preview {
      display: flex;
      justify-content: flex-start;
      min-width: 60px;
      max-width: 140px;
      user-select: none;
      cursor: pointer;

      color: var(--nexio-link-color);
      font-feature-settings:
        'clig' off,
        'liga' off;
      font-family: var(--nexio-font-family);
      font-size: var(--nexio-font-sm);
      font-style: normal;
      font-weight: 400;
      text-decoration: none;
      text-wrap: nowrap;
    }

    .nexio-link-preview > span {
      display: inline-block;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;

      text-overflow: ellipsis;
      overflow: hidden;
    }
  `;

  @property({ attribute: false })
  accessor url!: string;

  override render() {
    const { url } = this;

    return html`
      <a
        class="nexio-link-preview"
        rel="noopener noreferrer"
        target="_blank"
        href=${url}
      >
        <span>${getHostName(url)}</span>
      </a>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-link-preview': LinkPreview;
  }
}
