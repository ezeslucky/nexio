import { SeniorToolExtension } from '@canvas/nexio-widget-edgeless-toolbar';
import { html } from 'lit';

export const shapeSeniorTool = SeniorToolExtension(
  'shape',
  ({ block, toolbarContainer }) => {
    return {
      name: 'Shape',
      content: html`<edgeless-shape-tool-button
        .edgeless=${block}
        .toolbarContainer=${toolbarContainer}
      ></edgeless-shape-tool-button>`,
    };
  }
);
