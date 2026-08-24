import { fontXSStyle, panelBaseStyle } from '@canvas/nexio-shared/styles';
import { css } from 'lit';

export const renameStyles = css`
  ${panelBaseStyle('.nexio-attachment-rename-container')}
  .nexio-attachment-rename-container {
    position: relative;
    display: flex;
    align-items: center;
    width: 320px;
    gap: 12px;
    padding: 12px;
    z-index: var(--nexio-z-index-popover);
  }

  .nexio-attachment-rename-input-wrapper {
    display: flex;
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--nexio-white-10);
    border-radius: 4px;
    border: 1px solid var(--nexio-border-color);
  }

  .nexio-attachment-rename-input-wrapper:focus-within {
    border-color: var(--nexio-blue-700);
    box-shadow: var(--nexio-active-shadow);
  }

  .nexio-attachment-rename-input-wrapper input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--nexio-text-primary-color);
  }
  ${fontXSStyle('.nexio-attachment-rename-input-wrapper input')}

  .nexio-attachment-rename-input-wrapper input::placeholder {
    color: var(--nexio-placeholder-color);
  }

  .nexio-attachment-rename-extension {
    font-size: var(--nexio-font-xs);
    color: var(--nexio-text-secondary-color);
  }

  .nexio-attachment-rename-overlay-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--nexio-z-index-popover);
  }
`;

export const styles = css`
  :host {
    z-index: 1;
  }
`;
