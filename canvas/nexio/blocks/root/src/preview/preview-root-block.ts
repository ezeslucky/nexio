import { NoteBlockModel, NoteDisplayMode } from '@canvas/nexio-model';
import { matchModels } from '@canvas/nexio-shared/utils';
import { BlockComponent } from '@canvas/std';
import { css, html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';

export class PreviewRootBlockComponent extends BlockComponent {
  static override styles = css`
    nexio-preview-root {
      display: block;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
  }

  override renderBlock() {
    const widgets = html`${repeat(
      Object.entries(this.widgets),
      ([id]) => id,
      ([_, widget]) => widget
    )}`;

    const children = this.renderChildren(this.model, child => {
      const isNote = matchModels(child, [NoteBlockModel]);
      const note = child as NoteBlockModel;
      const displayOnEdgeless =
        !!note.props.displayMode &&
        note.props.displayMode === NoteDisplayMode.EdgelessOnly;
      // Should remove deprecated `hidden` property in the future
      return !(isNote && displayOnEdgeless);
    });

    return html`<div class="nexio-preview-root">${children} ${widgets}</div>`;
  }
}
