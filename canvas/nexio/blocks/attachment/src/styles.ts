import { unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { css } from 'lit';

export const styles = css`
  .nexio-attachment-container {
    border-radius: 8px;
    box-sizing: border-box;
    user-select: none;
    overflow: hidden;
    border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};
    background: ${unsafeCSSVarV2('layer/background/primary')};

    &.focused {
      border-color: ${unsafeCSSVarV2('layer/insideBorder/primaryBorder')};
    }
  }

  .nexio-attachment-container.comment-highlighted {
    outline: 2px solid ${unsafeCSSVarV2('block/comment/highlightUnderline')};
  }

  .nexio-attachment-card {
    display: flex;
    gap: 12px;
    padding: 12px;
  }

  .nexio-attachment-content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    flex: 1 0 0;
    min-width: 0;
  }

  .truncate {
    align-self: stretch;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }

  .nexio-attachment-content-title {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    align-self: stretch;
  }

  .nexio-attachment-content-title-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nexio-text-primary-color);
    font-size: 16px;
  }

  .nexio-attachment-content-title-text {
    color: var(--nexio-text-primary-color);
    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .nexio-attachment-content-description {
    display: flex;
    align-items: center;
    align-self: stretch;
    gap: 8px;
  }

  .nexio-attachment-content-info {
    color: var(--nexio-text-secondary-color);
    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .nexio-attachment-content-button {
    display: flex;
    height: 20px;
    align-items: center;
    align-self: stretch;
    gap: 4px;
    white-space: nowrap;
    padding: 0 4px;
    color: ${unsafeCSSVarV2('button/primary')};
    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-xs);
    font-style: normal;
    font-weight: 500;
    text-transform: capitalize;
    line-height: 20px;

    svg {
      font-size: 16px;
    }
  }

  .nexio-attachment-banner {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nexio-attachment-card.loading {
    .nexio-attachment-content-title-text {
      color: ${unsafeCSSVarV2('text/placeholder')};
    }
  }

  .nexio-attachment-card.error {
    .nexio-attachment-content-title-icon {
      color: ${unsafeCSSVarV2('status/error')};
    }
  }

  .nexio-attachment-card.loading,
  .nexio-attachment-card.error {
    background: ${unsafeCSSVarV2('layer/background/secondary')};
  }

  .nexio-attachment-card.cubeThick {
    flex-direction: column-reverse;

    .nexio-attachment-content {
      width: 100%;
      flex-direction: column;
      align-items: flex-start;
      justify-content: space-between;
    }

    .nexio-attachment-banner {
      justify-content: space-between;
    }
  }

  .nexio-attachment-embed-container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .nexio-attachment-embed-status {
    position: absolute;
    left: 14px;
    bottom: 64px;
  }

  .nexio-attachment-embed-event-mask {
    position: absolute;
    inset: 0;
  }
`;
