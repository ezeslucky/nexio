import * as icons from '@canvas/icons/lit';
import { ShadowlessElement } from '@canvas/std';
import { css, html, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import { uniMap } from './uni-component/operation.js';
import { createUniComponentFromWebComponent } from './uni-component/uni-component.js';

export class NexioLitIcon extends ShadowlessElement {
  static override styles = css`
    nexio-lit-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    nexio-lit-icon svg {
      fill: var(--nexio-icon-color);
    }
  `;

  protected override render(): unknown {
    const createIcon = icons[this.name] as () => TemplateResult;
    return html`${createIcon?.()}`;
  }

  @property({ attribute: false })
  accessor name!: keyof typeof icons;
}

const litIcon = createUniComponentFromWebComponent<{ name: string }>(
  NexioLitIcon
);
export const createIcon = (name: keyof typeof icons) => {
  return uniMap(litIcon, () => ({ name }));
};
