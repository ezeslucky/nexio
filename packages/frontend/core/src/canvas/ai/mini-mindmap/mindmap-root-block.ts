import type { RootBlockModel } from '@canvas/nexio/model';
import { BlockComponent } from '@canvas/nexio/std';
import { html } from 'lit';

export class MindmapRootBlock extends BlockComponent<RootBlockModel> {
  override render() {
    return html`
      <style>
        .nexio-mini-mindmap-root {
          display: block;
          width: 100%;
          height: 100%;

          background-size: 20px 20px;
          background-color: var(--nexio-background-primary-color);
          background-image: radial-gradient(
            var(--nexio-edgeless-grid-color) 1px,
            var(--nexio-background-primary-color) 1px
          );
        }
      </style>
      <div class="nexio-mini-mindmap-root">
        ${this.host.renderChildren(this.model)}
      </div>
    `;
  }
}
