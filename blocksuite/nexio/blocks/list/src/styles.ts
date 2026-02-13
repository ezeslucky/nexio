import { css } from 'lit';

export const listPrefix = css`
  .nexio-list-block__prefix {
    display: flex;
    color: var(--nexio-blue-700);
    font-size: var(--nexio-font-sm);
    user-select: none;
    position: relative;
  }

  .nexio-list-block__numbered {
    min-width: 22px;
    height: 24px;
    margin-left: 2px;
  }

  .nexio-list-block__todo-prefix {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 24px;
    height: 24px;
    color: var(--nexio-icon-color);
  }

  .nexio-list-block__todo-prefix.readonly {
    cursor: default;
  }

  .nexio-list-block__todo-prefix > svg {
    width: 20px;
    height: 20px;
  }
`;

export const listBlockStyles = css`
  nexio-list {
    display: block;
    font-size: var(--nexio-font-base);
  }

  nexio-list code {
    font-size: calc(var(--nexio-font-base) - 3px);
    padding: 0px 4px 2px;
  }

  .nexio-list-block-container {
    box-sizing: border-box;
    border-radius: 4px;
    position: relative;
  }
  .nexio-list-block-container .nexio-list-block-container {
    margin-top: 0;
  }
  .nexio-list-rich-text-wrapper {
    position: relative;
    display: flex;
  }
  .nexio-list-rich-text-wrapper rich-text {
    flex: 1;
  }

  .nexio-list--checked {
    color: var(--nexio-text-secondary-color);
  }

  ${listPrefix}
`;
