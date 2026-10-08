import { toReactNode } from '@nexio/component';
import { AIChatBlockPeekViewTemplate } from '@nexio/core/blocksuite/ai';
import type { AIChatBlockModel } from '@nexio/core/blocksuite/ai/blocks/ai-chat-block/model/ai-chat-model';
import { registerAIAppEffects } from '@nexio/core/blocksuite/ai/effects/app';
import { useAIChatConfig } from '@nexio/core/components/hooks/affine/use-ai-chat-config';
import { useAISubscribe } from '@nexio/core/components/hooks/affine/use-ai-subscribe';
import {
  AIDraftService,
  AIModelService,
  AIToolsConfigService,
} from '@nexio/core/modules/ai-button';
import { ServerService, SubscriptionService } from '@nexio/core/modules/cloud';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { FeatureFlagService } from '@nexio/core/modules/feature-flag';
import type { EditorHost } from '@blocksuite/affine/std';
import { useFramework } from '@toeverything/infra';
import { useMemo } from 'react';

registerAIAppEffects();

export type AIChatBlockPeekViewProps = {
  model: AIChatBlockModel;
  host: EditorHost;
};

export const AIChatBlockPeekView = ({
  model,
  host,
}: AIChatBlockPeekViewProps) => {
  const { docDisplayConfig, searchMenuConfig, reasoningConfig } =
    useAIChatConfig();

  const framework = useFramework();
  const serverService = framework.get(ServerService);
  const affineFeatureFlagService = framework.get(FeatureFlagService);
  const affineWorkspaceDialogService = framework.get(WorkspaceDialogService);
  const aiDraftService = framework.get(AIDraftService);
  const aiToolsConfigService = framework.get(AIToolsConfigService);
  const aiModelService = framework.get(AIModelService);
  const subscriptionService = framework.get(SubscriptionService);
  const handleAISubscribe = useAISubscribe();

  return useMemo(() => {
    const template = AIChatBlockPeekViewTemplate(
      model,
      host,
      docDisplayConfig,
      searchMenuConfig,
      reasoningConfig,
      serverService,
      affineFeatureFlagService,
      affineWorkspaceDialogService,
      aiDraftService,
      aiToolsConfigService,
      aiModelService,
      subscriptionService,
      handleAISubscribe
    );
    return toReactNode(template);
  }, [
    model,
    host,
    docDisplayConfig,
    searchMenuConfig,
    reasoningConfig,
    serverService,
    affineFeatureFlagService,
    affineWorkspaceDialogService,
    aiDraftService,
    aiToolsConfigService,
    aiModelService,
    subscriptionService,
    handleAISubscribe,
  ]);
};
