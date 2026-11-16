import { scrollbarStyle } from '@blocksuite/nexio-shared/styles';
import { unsafeCSSVarV2 } from '@blocksuite/nexio-shared/theme';
import { baseTheme } from '@toeverything/theme';
import { css, unsafeCSS } from 'lit';

export const styles = css`
  .overlay-mask {
    pointer-events: auto;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--affine-z-index-popover);
  }

  .slash-menu {
    position: fixed;
    left: 0;
    top: 0;
    box-sizing: border-box;
    padding: 8px 6px;
    width: 280px;
    overflow-y: auto;
    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};

    background: ${unsafeCSSVarV2('layer/background/overlayPanel')};
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
    box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.14), 0 4px 12px -2px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
    z-index: var(--affine-z-index-popover);
    user-select: none;
    /* transition: max-height 0.2s ease-in-out; */
  }

  ${scrollbarStyle('.slash-menu')}

  .slash-menu-group-name {
    box-sizing: border-box;
    padding: 6px 10px 4px;

    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: var(--affine-line-height);
    text-align: left;
    color: var(
      --light-textColor-textSecondaryColor,
      var(--textColor-textSecondaryColor, #8e8d91)
    );
  }

  .slash-menu-item {
    padding: 3px 8px;
    justify-content: flex-start;
    gap: 10px;
    border-radius: 8px;
    margin: 2px 0;
    transition: background-color 0.15s cubic-bezier(0.16, 1, 0.3, 1), transform 0.1s ease;
  }

  .slash-menu-item-icon {
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    padding: 4px;
    border: 1px solid ${unsafeCSSVarV2('layer/insideBorder/border')};
    border-radius: 6px;
    color: var(--affine-icon-color);
    background: ${unsafeCSSVarV2('layer/background/primary')};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);

    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }

  .slash-menu-item:hover .slash-menu-item-icon {
    transform: scale(1.05);
    border-color: var(--affine-border-color);
  }

  .slash-menu-item-icon svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .slash-menu-item.ask-ai {
    color: var(--affine-brand-color);
  }
  .slash-menu-item.github .github-icon {
    color: var(--affine-black);
  }
`;

export const slashItemToolTipStyle = css`
  .affine-tooltip {
    display: flex;
    padding: 4px 4px 2px 4px;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
  }

  .tooltip-figure svg {
    display: block;
  }

  .tooltip-caption {
    padding-left: 4px;
    color: var(
      --light-textColor-textSecondaryColor,
      var(--textColor-textSecondaryColor, #8e8d91)
    );
    font-family: var(--affine-font-family);
    font-size: var(--affine-font-xs);
    line-height: var(--affine-line-height);
  }
`;
