import { css } from 'lit';

export const styles = css`
  .nexio-block-component.border.light .selected-style {
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px var(--nexio-brand-color);
  }
  .nexio-block-component.border.dark .selected-style {
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px var(--nexio-brand-color);
  }
  @media print {
    .nexio-block-component.border.light .selected-style,
    .nexio-block-component.border.dark .selected-style {
      box-shadow: none;
    }
  }
`;
