import { baseTheme } from '@ezeslucky/theme';
import { css, unsafeCSS } from 'lit';

export const styles = css`
  .container {
    position: absolute;
    width: 480px;
    left: calc(50% - 480px / 2);
    top: calc(50% - 270px / 2);
    font-family: ${unsafeCSS(baseTheme.fontSansFamily)};
    font-size: var(--nexio-font-base);
    line-height: var(--nexio-line-height);
    padding: 12px 40px 36px;
    gap: 20px;
    display: flex;
    flex-direction: column;
    background: var(--nexio-background-primary-color);
    box-shadow: var(--nexio-shadow-2);
    border-radius: 16px;
    z-index: var(--nexio-z-index-popover);
  }

  .container[hidden] {
    display: none;
  }

  header {
    cursor: move;
    user-select: none;
    font-size: var(--nexio-font-h-6);
    font-weight: 600;
  }

  a {
    white-space: nowrap;
    word-break: break-word;
    color: var(--nexio-link-color);
    fill: var(--nexio-link-color);
    text-decoration: none;
    cursor: pointer;
  }

  header icon-button {
    margin-left: auto;
    position: relative;
    left: 24px;
  }

  .button-container {
    display: flex;
    justify-content: space-between;
  }

  .button-container icon-button {
    padding: 8px 12px;
    justify-content: flex-start;
    gap: 12px;
    width: 190px;
    height: 40px;
    box-shadow: var(--nexio-shadow-1);
    border-radius: 10px;
  }

  .footer {
    display: flex;
    align-items: center;
    color: var(--nexio-text-secondary-color);
  }

  .loading-header {
    display: flex;
    align-items: center;
  }

  .button-suffix {
    display: flex;
    margin-left: auto;
  }

  .overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--nexio-z-index-popover);
  }
`;
