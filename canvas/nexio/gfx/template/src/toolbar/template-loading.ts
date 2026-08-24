import { css, html, LitElement } from 'lit';

export class NexioTemplateLoading extends LitElement {
  static override styles = css`
    @keyframes nexio-template-block-rotate {
      from {
        rotate: 0deg;
      }
      to {
        rotate: 360deg;
      }
    }

    .nexio-template-block-container {
      width: 20px;
      height: 20px;
      overflow: hidden;
    }

    .nexio-template-block-loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      position: relative;
      background: conic-gradient(
        rgba(30, 150, 235, 1) 90deg,
        rgba(0, 0, 0, 0.1) 90deg 360deg
      );
      border-radius: 50%;
      animation: nexio-template-block-rotate 1s infinite ease-in;
    }

    .nexio-template-block-loading::before {
      content: '';
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: white;
      position: absolute;
      top: 3px;
      left: 3px;
    }
  `;

  override render() {
    return html`<div class="nexio-template-block-container">
      <div class="nexio-template-block-loading"></div>
    </div>`;
  }
}
