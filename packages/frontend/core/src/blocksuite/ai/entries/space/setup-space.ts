import type { RichText } from '@blocksuite/nexio/rich-text';
import { type EditorHost, TextSelection } from '@blocksuite/nexio/std';

import { handleInlineAskAIAction } from '../../actions/doc-handler';
import { AIProvider } from '../../provider';
import type { NexioAIPanelWidget } from '../../widgets/ai-panel/ai-panel';

function isSpaceEvent(event: KeyboardEvent) {
  return event.key === ' ' && event.which === 32 && !event.isComposing;
}

function insertSpace(host: EditorHost) {
  const textSelection = host.selection.find(TextSelection);
  if (!textSelection || !textSelection.isCollapsed()) return;

  const blockComponent = host.view.getBlock(textSelection.from.blockId);
  if (!blockComponent) return;

  const richText = blockComponent.querySelector('rich-text') as RichText | null;
  if (!richText) return;

  const inlineEditor = richText.inlineEditor;
  inlineEditor?.insertText(
    {
      index: textSelection.from.index,
      length: 0,
    },
    ' '
  );
}

export function setupSpaceAIEntry(panel: NexioAIPanelWidget) {
  
  panel.handleEvent('keyPress', ctx => {
    const host = panel.host;
    const keyboardState = ctx.get('keyboardState');
    const event = keyboardState.raw;
    if (AIProvider.actions.chat && isSpaceEvent(event)) {
      // If the AI panel is in the input state and the input content is empty,
      // insert a space back into the editor.
      if (panel.state === 'input') {
        const input = panel.shadowRoot?.querySelector('ai-panel-input');
        if (input?.textarea.value.trim() === '') {
          event.preventDefault();
          insertSpace(host);
          panel.hide();
        }

        return;
      }

      const selection = host.selection.find(TextSelection);
      if (selection && selection.isCollapsed() && selection.from.index === 0) {
        const block = host.view.getBlock(selection.blockId);
        if (
          !block?.model?.text ||
          block.model.text?.length > 0 ||
          block.model.flavour !== 'nexio:paragraph'
        )
          return;

        event.preventDefault();
        handleInlineAskAIAction(host);
      }
    }
  });
}
