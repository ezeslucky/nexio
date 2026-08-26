import { toReactNode } from '@nexio/component';
import { AIChatBlockPeekViewTemplate } from '@nexio/core/canvas/ai';
import type { AIChatBlockModel } from '@nexio/core/canvas/ai/blocks/ai-chat-block/model/ai-chat-model';
import { useAIChatConfig } from '@nexio/core/components/hooks/nexio/use-ai-chat-config';
import { useAISubscribe } from '@nexio/core/components/hooks/nexio/use-ai-subscribe';
import {
  AIDraftService,
  AIToolsConfigService,
} from '@nexio/core/modules/ai-button';
import { AIModelService } from '@nexio/core/modules/ai-button/services/models';
import { SubscriptionService } from '@nexio/core/modules/cloud';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { FeatureFlagService } from '@nexio/core/modules/feature-flag';
import type { EditorHost } from '@canvas/nexio/std';
import { useFramework } from '@ezeslucky/infra';
import { useMemo } from 'react';

export type AIChatBlockPeekViewProps = {
  model: AIChatBlockModel;
  host: EditorHost;
};

export const AIChatBlockPeekView = ({
  model,
  host,
}: AIChatBlockPeekViewProps) => {
  const {
    docDisplayConfig,
    searchMenuConfig,
    networkSearchConfig,
    reasoningConfig,
  } = useAIChatConfig();

  const framework = useFramework();
  const nexioFeatureFlagService = framework.get(FeatureFlagService);
  const nexioWorkspaceDialogService = framework.get(WorkspaceDialogService);
  const aiDraftService = framework.get(AIDraftService);
  const aiToolsConfigService = framework.get(AIToolsConfigService);
  const subscriptionService = framework.get(SubscriptionService);
  const aiModelService = framework.get(AIModelService);
  const handleAISubscribe = useAISubscribe();

  return useMemo(() => {
    const template = AIChatBlockPeekViewTemplate(
      model,
      host,
      docDisplayConfig,
      searchMenuConfig,
      networkSearchConfig,
      reasoningConfig,
      nexioFeatureFlagService,
      nexioWorkspaceDialogService,
      aiDraftService,
      aiToolsConfigService,
      subscriptionService,
      aiModelService,
      handleAISubscribe
    );
    return toReactNode(template);
  }, [
    model,
    host,
    docDisplayConfig,
    searchMenuConfig,
    networkSearchConfig,
    reasoningConfig,
    nexioFeatureFlagService,
    nexioWorkspaceDialogService,
    aiDraftService,
    aiToolsConfigService,
    subscriptionService,
    aiModelService,
    handleAISubscribe,
  ]);
};
