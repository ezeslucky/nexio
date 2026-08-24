import { unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { CheckBoxCheckSolidIcon, CheckBoxUnIcon } from '@canvas/icons/lit';
import { css, html } from 'lit';
import { query } from 'lit/decorators.js';

import { BaseCellRenderer } from '../../core/property/index.js';
import { createFromBaseCellRenderer } from '../../core/property/renderer.js';
import { createIcon } from '../../core/utils/uni-icon.js';
import { checkboxPropertyModelConfig } from './define.js';

const playCheckAnimation = async (
  refElement: Element,
  { left = 0, size = 20 }: { left?: number; size?: number } = {}
) => {
  const sparkingEl = document.createElement('div');
  sparkingEl.classList.add('nexio-check-animation');
  if (size < 20) {
    console.warn('If the size is less than 20, the animation may be abnormal.');
  }
  sparkingEl.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    border-radius: 50%;
  `;
  sparkingEl.style.left = `${left}px`;
  refElement.append(sparkingEl);

  await sparkingEl.animate(
    [
      {
        boxShadow:
          '0 -18px 0 -8px #1e96eb, 16px -8px 0 -8px #1e96eb, 16px 8px 0 -8px #1e96eb, 0 18px 0 -8px #1e96eb, -16px 8px 0 -8px #1e96eb, -16px -8px 0 -8px #1e96eb',
      },
    ],
    { duration: 240, easing: 'ease', fill: 'forwards' }
  ).finished;
  await sparkingEl.animate(
    [
      {
        boxShadow:
          '0 -36px 0 -10px transparent, 32px -16px 0 -10px transparent, 32px 16px 0 -10px transparent, 0 36px 0 -10px transparent, -32px 16px 0 -10px transparent, -32px -16px 0 -10px transparent',
      },
    ],
    { duration: 360, easing: 'ease', fill: 'forwards' }
  ).finished;

  sparkingEl.remove();
};

export class CheckboxCell extends BaseCellRenderer<boolean> {
  static override styles = css`
    nexio-database-checkbox-cell {
      display: block;
      width: 100%;
      cursor: pointer;
    }

    .nexio-database-checkbox-container {
      height: 100%;
    }

    .nexio-database-checkbox {
      display: flex;
      align-items: center;
      height: var(--data-view-cell-text-line-height);
      width: 100%;
      position: relative;
      font-size: 24px;
      color: ${unsafeCSSVarV2('database/textSecondary')};
      margin-left: -1px;
    }
  `;

  override beforeEnterEditMode() {
    const checked = !this.value;

    this.valueSetImmediate(checked);
    if (checked) {
      playCheckAnimation(this._checkbox, { left: 2 }).catch(console.error);
    }
    return false;
  }

  override onCopy(_e: ClipboardEvent) {
    _e.preventDefault();
  }

  override onCut(_e: ClipboardEvent) {
    _e.preventDefault();
  }

  override onPaste(_e: ClipboardEvent) {
    _e.preventDefault();
  }

  override render() {
    const checked = this.value ?? false;
    const icon = checked
      ? CheckBoxCheckSolidIcon({ style: `color:#1E96EB` })
      : CheckBoxUnIcon();
    return html` <div class="nexio-database-checkbox-container">
      <div
        class="nexio-database-checkbox checkbox ${checked ? 'checked' : ''}"
      >
        ${icon}
      </div>
    </div>`;
  }

  @query('.nexio-database-checkbox')
  private accessor _checkbox!: HTMLDivElement;
}

export const checkboxPropertyConfig =
  checkboxPropertyModelConfig.createPropertyMeta({
    icon: createIcon('CheckBoxCheckLinearIcon'),
    cellRenderer: {
      view: createFromBaseCellRenderer(CheckboxCell),
    },
  });
