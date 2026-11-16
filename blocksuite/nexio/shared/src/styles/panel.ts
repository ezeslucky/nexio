import { css, unsafeCSS } from 'lit';

import { unsafeCSSVarV2 } from '../theme/css-variables';
import { fontSMStyle } from './font';

export const panelBaseColorsStyle = (container: string) => css`
  ${unsafeCSS(container)} {
    color: var(--affine-icon-color);
    box-shadow: var(--affine-overlay-shadow);
    background: ${unsafeCSSVarV2('layer/background/overlayPanel')};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
`;

export const panelBaseStyle = (container: string) => css`
  ${unsafeCSS(container)} {
    display: flex;
    align-items: center;
    gap: 8px;
    width: max-content;
    padding: 0 6px;
    border-radius: 10px;
    border: 0.5px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
    box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.08);
    transition: box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
  }
  ${panelBaseColorsStyle(container)}
  ${fontSMStyle(container)}
`;
