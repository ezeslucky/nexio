import { AIChatBlockComponent } from '../blocks/ai-chat-block/ai-chat-block';
import { EdgelessAIChatBlockComponent } from '../blocks/ai-chat-block/ai-chat-edgeless-block';
import { LitTranscriptionBlock } from '../blocks/ai-chat-block/ai-transcription-block';
import {
  AIChatBlockMessage,
  AIChatBlockMessages,
} from '../blocks/ai-chat-block/components/ai-chat-messages';
import {
  ChatImage,
  ChatImages,
} from '../blocks/ai-chat-block/components/chat-images';
import { ImagePlaceholder } from '../blocks/ai-chat-block/components/image-placeholder';
import { UserInfo } from '../blocks/ai-chat-block/components/user-info';
import { effects as componentAiItemEffects } from '../components/ai-item';
import { AIScrollableTextRenderer } from '../components/ai-scrollable-text-renderer';
import { AskAIButton } from '../components/ask-ai-button';
import { AskAIIcon } from '../components/ask-ai-icon';
import { AskAIPanel } from '../components/ask-ai-panel';
import { AskAIToolbarButton } from '../components/ask-ai-toolbar';
import {
  NEXIO_AI_PANEL_WIDGET,
  NexioAIPanelWidget,
} from '../widgets/ai-panel/ai-panel';
import {
  AIPanelAnswer,
  AIPanelDivider,
  AIPanelError,
  AIPanelGenerating,
  AIPanelInput,
} from '../widgets/ai-panel/components';
import { AIFinishTip } from '../widgets/ai-panel/components/finish-tip';
import { GeneratingPlaceholder } from '../widgets/ai-panel/components/generating-placeholder';
import {
  NEXIO_BLOCK_DIFF_WIDGET_FOR_BLOCK,
  NexioBlockDiffWidgetForBlock,
} from '../widgets/block-diff/block';
import { BlockDiffOptions } from '../widgets/block-diff/options';
import {
  NEXIO_BLOCK_DIFF_WIDGET_FOR_PAGE,
  NexioBlockDiffWidgetForPage,
} from '../widgets/block-diff/page';
import {
  NEXIO_BLOCK_DIFF_PLAYGROUND,
  NEXIO_BLOCK_DIFF_PLAYGROUND_MODAL,
  BlockDiffPlayground,
  BlockDiffPlaygroundModal,
} from '../widgets/block-diff/playground';
import {
  AFFINE_EDGELESS_COPILOT_WIDGET,
  EdgelessCopilotWidget,
} from '../widgets/edgeless-copilot';
import { EdgelessCopilotPanel } from '../widgets/edgeless-copilot-panel';
import { EdgelessCopilotToolbarEntry } from '../widgets/edgeless-copilot-panel/toolbar-entry';
import {
  type EditorEffectElementTag,
  editorEffectElementTags,
} from './registry';
import { registerAISharedEffects } from './shared';

const editorRegistries = new WeakSet<CustomElementRegistry>();
const editorElements = {
  'ask-ai-icon': AskAIIcon,
  'ask-ai-button': AskAIButton,
  'ask-ai-toolbar-button': AskAIToolbarButton,
  'ask-ai-panel': AskAIPanel,
  'affine-edgeless-ai-chat': EdgelessAIChatBlockComponent,
  'affine-ai-chat': AIChatBlockComponent,
  'ai-chat-block-message': AIChatBlockMessage,
  'ai-chat-block-messages': AIChatBlockMessages,
  'ai-scrollable-text-renderer': AIScrollableTextRenderer,
  'image-placeholder': ImagePlaceholder,
  'chat-image': ChatImage,
  'chat-images': ChatImages,
  'user-info': UserInfo,
  'generating-placeholder': GeneratingPlaceholder,
  'ai-finish-tip': AIFinishTip,
  'ai-panel-divider': AIPanelDivider,
  'ai-panel-answer': AIPanelAnswer,
  'ai-panel-input': AIPanelInput,
  'ai-panel-generating': AIPanelGenerating,
  'ai-panel-error': AIPanelError,
  'ai-block-diff-options': BlockDiffOptions,
  [NEXIO_BLOCK_DIFF_PLAYGROUND]: BlockDiffPlayground,
  [NEXIO_BLOCK_DIFF_PLAYGROUND_MODAL]: BlockDiffPlaygroundModal,
  [NEXIO_AI_PANEL_WIDGET]: NexioAIPanelWidget,
  [AFFINE_EDGELESS_COPILOT_WIDGET]: EdgelessCopilotWidget,
  [NEXIO_BLOCK_DIFF_WIDGET_FOR_BLOCK]: NexioBlockDiffWidgetForBlock,
  [NEXIO_BLOCK_DIFF_WIDGET_FOR_PAGE]: NexioBlockDiffWidgetForPage,
  'edgeless-copilot-panel': EdgelessCopilotPanel,
  'edgeless-copilot-toolbar-entry': EdgelessCopilotToolbarEntry,
  'transcription-block': LitTranscriptionBlock,
} satisfies Record<EditorEffectElementTag, CustomElementConstructor>;

export function registerAIEditorEffects() {
  const registry = customElements;
  if (editorRegistries.has(registry)) return;
  editorRegistries.add(registry);

  registerAISharedEffects();
  componentAiItemEffects();

  for (const tag of editorEffectElementTags) {
    customElements.define(tag, editorElements[tag]);
  }
}
