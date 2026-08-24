import { unsafeCSSVarV2 } from '@canvas/nexio-shared/theme';
import { css } from 'lit';

import { DRAG_HANDLE_CONTAINER_WIDTH } from './config.js';

export const styles = css`
  .nexio-drag-handle-widget {
    display: flex;
    position: absolute;
    left: 0;
    top: 0;
    contain: size layout;
  }

  .nexio-drag-handle-container {
    top: 0;
    left: 0;
    position: absolute;
    display: flex;
    justify-content: center;
    width: ${DRAG_HANDLE_CONTAINER_WIDTH}px;
    min-height: 12px;
    pointer-events: auto;
    user-select: none;
    box-sizing: border-box;
  }
  .nexio-drag-handle-container:hover {
    cursor: grab;
  }

  .nexio-drag-handle-grabber {
    width: 4px;
    height: 100%;
    border-radius: 1px;
    background: var(--nexio-placeholder-color);
    transition: width 0.25s ease;
  }

  .nexio-drag-handle-grabber.dots {
    width: 14px;
    height: 26px;
    box-sizing: border-box;
    padding: 5px 2px;
    border-radius: 4px;
    gap: 2px;
    display: flex;
    flex-wrap: wrap;
    background-color: transparent;
    transform: translateX(-100%);
    transition: unset;
  }

  .nexio-drag-handle-grabber.dots:hover {
    background-color: ${unsafeCSSVarV2('layer/background/hoverOverlay')};
  }

  .nexio-drag-handle-grabber.dots > .dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    flex: 0 0 4px;
    background-color: ${unsafeCSSVarV2('icon/secondary')};
  }

  @media print {
    .nexio-drag-handle-widget {
      display: none;
    }
  }
  .nexio-drag-hover-rect {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 6px;
    background: var(--nexio-hover-color);
    pointer-events: none;
    z-index: 2;
    animation: expand 0.25s forwards;
  }
  @keyframes expand {
    0% {
      width: 0;
      height: 0;
    }
  }
`;
