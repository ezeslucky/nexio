import { scrollbarStyle } from '@canvas/nexio-shared/styles';
import { unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { css } from 'lit';

export const codeBlockStyles = css`
  nexio-code {
    display: block;
  }

  .nexio-code-block-container {
    font-size: var(--nexio-font-xs);
    line-height: var(--nexio-line-height);
    position: relative;
    padding: 32px 20px;
    background: var(--nexio-background-code-block);
    border-radius: 10px;
    box-sizing: border-box;
  }

  .nexio-code-block-container.mobile {
    padding: 12px;
  }

  .nexio-code-block-container.highlight-comment {
    outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
  }

  ${scrollbarStyle('.nexio-code-block-container rich-text')}

  .nexio-code-block-container .inline-editor {
    font-family: var(--nexio-font-code-family);
    font-variant-ligatures: none;
  }

  .nexio-code-block-container v-line {
    position: relative;
    display: inline-grid !important;
    grid-template-columns: auto minmax(0, 1fr);
  }

  .nexio-code-block-container.disable-line-numbers v-line {
    grid-template-columns: unset;
  }

  .nexio-code-block-container div:has(> v-line) {
    display: grid;
  }

  .nexio-code-block-container .line-number {
    position: sticky;
    text-align: left;
    padding-right: 12px;
    width: 32px;
    word-break: break-word;
    white-space: nowrap;
    left: -0.5px;
    z-index: 1;
    background: var(--nexio-background-code-block);
    font-size: var(--nexio-font-xs);
    line-height: var(--nexio-line-height);
    color: var(--nexio-text-secondary);
    box-sizing: border-box;
    user-select: none;
  }

  .nexio-code-block-container.disable-line-numbers .line-number {
    display: none;
  }

  nexio-code .nexio-code-block-preview {
    padding: 12px;
  }
`;
