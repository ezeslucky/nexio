import { unsafeCSSVarV2 } from '@blocksuite/nexio-shared/theme';
import { css, html } from 'lit';

export const styles = css`
  .nexio-embed-figma-block {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 12px;
    width: 100%;
    height: 100%;

    border-radius: 8px;
    border: 1px solid ${unsafeCSSVarV2('layer/background/tertiary')};

    background: ${unsafeCSSVarV2('layer/background/primary')};
    user-select: none;
  }

  .nexio-embed-figma {
    flex-grow: 1;
    width: 100%;
  }

  .nexio-embed-figma img,
  .nexio-embed-figma object,
  .nexio-embed-figma svg {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }

  .nexio-embed-figma-iframe-container {
    height: 100%;
    position: relative;
  }

  .nexio-embed-figma-iframe-container > iframe {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    border: none;
  }

  .nexio-embed-figma-iframe-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .nexio-embed-figma-iframe-overlay.hide {
    display: none;
  }

  .nexio-embed-figma-content {
    display: block;
    flex-direction: column;
    width: 100%;
    height: fit-content;
  }

  .nexio-embed-figma-content-header {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;

    align-self: stretch;
  }

  .nexio-embed-figma-content-title-icon {
    display: flex;
    width: 20px;
    height: 20px;
    justify-content: center;
    align-items: center;
  }

  .nexio-embed-figma-content-title-icon img,
  .nexio-embed-figma-content-title-icon object,
  .nexio-embed-figma-content-title-icon svg {
    width: 20px;
    height: 20px;
    fill: var(--nexio-background-primary-color);
  }

  .nexio-embed-figma-content-title-text {
    flex: 1 0 0;

    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--nexio-text-primary-color);

    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-sm);
    font-style: normal;
    font-weight: 600;
    line-height: 22px;
  }

  .nexio-embed-figma-content-description {
    height: 40px;

    position: relative;

    word-break: break-word;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--nexio-text-primary-color);

    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }

  .nexio-embed-figma-content-description::after {
    content: '...';
    position: absolute;
    right: 0;
    bottom: 0;
    background-color: var(--nexio-background-primary-color);
  }

  .nexio-embed-figma-content-url {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    width: max-content;
    max-width: 100%;
    cursor: pointer;
  }
  .nexio-embed-figma-content-url > span {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;

    word-break: break-all;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${unsafeCSSVarV2('icon/primary')};

    font-family: var(--nexio-font-family);
    font-size: var(--nexio-font-xs);
    font-style: normal;
    font-weight: 400;
    line-height: 20px;
  }
  .nexio-embed-figma-content-url:hover > span {
    color: var(--nexio-link-color);
  }
  .nexio-embed-figma-content-url:hover .open-icon {
    fill: var(--nexio-link-color);
  }

  .nexio-embed-figma-content-url-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
  }
  .nexio-embed-figma-content-url-icon svg {
    height: 12px;
    width: 12px;
    fill: ${unsafeCSSVarV2('icon/primary')};
  }

  .nexio-embed-figma-block.selected {
    .nexio-embed-figma-content-url > span {
      color: var(--nexio-link-color);
    }
    .nexio-embed-figma-content-url .open-icon {
      fill: var(--nexio-link-color);
    }
  }
`;

export const FigmaIcon = html`<svg
  width="20"
  height="20"
  viewBox="0 0 20 20"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
>
  <path
    d="M7.66898 17.9165C9.00426 17.9165 10.088 16.7342 10.088 15.2776V12.6387H7.66898C6.3337 12.6387 5.25 13.8209 5.25 15.2776C5.25 16.7342 6.3337 17.9165 7.66898 17.9165Z"
    fill="#0ACF83"
  />
  <path
    d="M5.25 10.0002C5.25 8.54355 6.3337 7.36133 7.66898 7.36133H10.088V12.6391H7.66898C6.3337 12.6391 5.25 11.4569 5.25 10.0002Z"
    fill="#A259FF"
  />
  <path
    d="M5.25 4.72238C5.25 3.26572 6.3337 2.0835 7.66898 2.0835H10.088V7.36127H7.66898C6.3337 7.36127 5.25 6.17905 5.25 4.72238Z"
    fill="#F24E1E"
  />
  <path
    d="M10.0879 2.0835H12.5069C13.8421 2.0835 14.9259 3.26572 14.9259 4.72238C14.9259 6.17905 13.8421 7.36127 12.5069 7.36127H10.0879V2.0835Z"
    fill="#FF7262"
  />
  <path
    d="M14.9259 10.0002C14.9259 11.4569 13.8421 12.6391 12.5069 12.6391C11.1716 12.6391 10.0879 11.4569 10.0879 10.0002C10.0879 8.54355 11.1716 7.36133 12.5069 7.36133C13.8421 7.36133 14.9259 8.54355 14.9259 10.0002Z"
    fill="#1ABCFE"
  />
</svg>`;
