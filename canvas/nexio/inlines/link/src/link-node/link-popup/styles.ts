import { fontSMStyle, panelBaseStyle } from '@canvas/nexio-shared/styles';
import { css } from 'lit';

const editLinkStyle = css`
  .nexio-link-edit-popover {
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      'text-area .'
      'link-area btn';
    justify-items: center;
    align-items: center;
    width: 320px;
    gap: 8px 12px;
    padding: 8px;
    box-sizing: content-box;
  }

  ${fontSMStyle('.nexio-link-edit-popover label')}
  .nexio-link-edit-popover label {
    box-sizing: border-box;
    color: var(--nexio-icon-color);
    font-weight: 400;
  }

  ${fontSMStyle('.nexio-link-edit-popover input')}
  .nexio-link-edit-popover input {
    color: inherit;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--nexio-text-primary-color);
  }
  .nexio-link-edit-popover input::placeholder {
    color: var(--nexio-placeholder-color);
  }
  input:focus {
    outline: none;
  }
  .nexio-link-edit-popover input:focus ~ label,
  .nexio-link-edit-popover input:active ~ label {
    color: var(--nexio-primary-color);
  }

  .nexio-edit-area {
    width: 280px;
    padding: 4px 10px;
    display: grid;
    gap: 8px;
    grid-template-columns: 26px auto;
    grid-template-rows: repeat(1, 1fr);
    grid-template-areas: 'label input';
    user-select: none;
    box-sizing: border-box;

    border: 1px solid var(--nexio-border-color);
    box-sizing: border-box;

    outline: none;
    border-radius: 4px;
    background: transparent;
  }
  .nexio-edit-area:focus-within {
    border-color: var(--nexio-blue-700);
    box-shadow: var(--nexio-active-shadow);
  }

  .nexio-edit-area.text {
    grid-area: text-area;
  }

  .nexio-edit-area.link {
    grid-area: link-area;
  }

  .nexio-edit-label {
    grid-area: label;
  }

  .nexio-edit-input {
    grid-area: input;
  }

  .nexio-confirm-button {
    grid-area: btn;
    user-select: none;
  }
`;

export const linkPopupStyle = css`
  :host {
    box-sizing: border-box;
  }

  .mock-selection {
    position: absolute;
    background-color: rgba(35, 131, 226, 0.28);
  }

  ${panelBaseStyle('.popover-container')}
  .popover-container {
    z-index: var(--nexio-z-index-popover);
    animation: nexio-popover-fade-in 0.2s ease;
    position: absolute;
  }

  @keyframes nexio-popover-fade-in {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .overlay-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--nexio-z-index-popover);
  }

  .mock-selection-container {
    pointer-events: none;
  }

  .nexio-link-popover.create {
    display: flex;
    gap: 12px;
    padding: 8px;

    color: var(--nexio-text-primary-color);
  }

  .nexio-link-popover-input {
    min-width: 280px;
    height: 30px;
    box-sizing: border-box;
    padding: 4px 10px;
    background: var(--nexio-white-10);
    border-radius: 4px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--nexio-border-color);
    color: var(--nexio-text-primary-color);
  }
  ${fontSMStyle('.nexio-link-popover-input')}
  .nexio-link-popover-input::placeholder {
    color: var(--nexio-placeholder-color);
  }
  .nexio-link-popover-input:focus {
    border-color: var(--nexio-blue-700);
    box-shadow: var(--nexio-active-shadow);
  }

  ${editLinkStyle}
`;
