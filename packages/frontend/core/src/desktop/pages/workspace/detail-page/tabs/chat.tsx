import { useConfirmModal } from '@nexio/component';
import { AIProvider, ChatPanel } from '@nexio/core/canvas/ai';
import type { NexioEditorContainer } from '@nexio/core/canvas/block-suite-editor';
import { NotificationServiceImpl } from '@nexio/core/canvas/view-extensions/editor-view/notification-service';
import { useAIChatConfig } from '@nexio/core/components/hooks/nexio/use-ai-chat-config';
import { useAISpecs } from '@nexio/core/components/hooks/nexio/use-ai-specs';
import { useAISubscribe } from '@nexio/core/components/hooks/nexio/use-ai-subscribe';
import {
  AIDraftService,
  AIToolsConfigService,
} from '@nexio/core/modules/ai-button';
import { AIModelService } from '@nexio/core/modules/ai-button/services/models';
import { SubscriptionService } from '@nexio/core/modules/cloud';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { FeatureFlagService } from '@nexio/core/modules/feature-flag';
import { PeekViewService } from '@nexio/core/modules/peek-view';
import { AppThemeService } from '@nexio/core/modules/theme';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { RefNodeSlotsProvider } from '@canvas/nexio/inlines/reference';
import { DocModeProvider } from '@canvas/nexio/shared/services';
import { createSignalFromObservable } from '@canvas/nexio/shared/utils';
import { useFramework, useService } from '@ezeslucky/infra';
import { forwardRef, useEffect, useRef, useState } from 'react';

import * as styles from './chat.css';

export interface SidebarTabProps {
  editor: NexioEditorContainer | null;
  onLoad?: ((component: HTMLElement) => void) | null;
}

// A wrapper for CopilotPanel
export const EditorChatPanel = forwardRef(function EditorChatPanel(
  { editor, onLoad }: SidebarTabProps,
  ref: React.ForwardedRef<ChatPanel>
) {
  const chatPanelRef = useRef<ChatPanel | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const workbench = useService(WorkbenchService).workbench;
  const framework = useFramework();

  useEffect(() => {
    if (onLoad && chatPanelRef.current) {
      (chatPanelRef.current as ChatPanel).updateComplete
        .then(() => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(chatPanelRef.current);
            } else {
              ref.current = chatPanelRef.current;
            }
          }
        })
        .catch(console.error);
    }
  }, [onLoad, ref]);

  const {
    docDisplayConfig,
    searchMenuConfig,
    networkSearchConfig,
    reasoningConfig,
    playgroundConfig,
  } = useAIChatConfig();
  const confirmModal = useConfirmModal();
  const specs = useAISpecs();
  const handleAISubscribe = useAISubscribe();

  useEffect(() => {
    if (!editor || !editor.host) return;

    if (!chatPanelRef.current) {
      chatPanelRef.current = new ChatPanel();
      chatPanelRef.current.host = editor.host;
      chatPanelRef.current.doc = editor.doc;

      const workbench = framework.get(WorkbenchService).workbench;
      chatPanelRef.current.appSidebarConfig = {
        getWidth: () => {
          const width$ = workbench.sidebarWidth$;
          return createSignalFromObservable(width$, 0);
        },
        isOpen: () => {
          const open$ = workbench.sidebarOpen$;
          return createSignalFromObservable(open$, true);
        },
      };

      chatPanelRef.current.docDisplayConfig = docDisplayConfig;
      chatPanelRef.current.searchMenuConfig = searchMenuConfig;
      chatPanelRef.current.networkSearchConfig = networkSearchConfig;
      chatPanelRef.current.reasoningConfig = reasoningConfig;
      chatPanelRef.current.playgroundConfig = playgroundConfig;
      chatPanelRef.current.extensions = specs;
      chatPanelRef.current.nexioFeatureFlagService =
        framework.get(FeatureFlagService);
      chatPanelRef.current.nexioWorkspaceDialogService = framework.get(
        WorkspaceDialogService
      );
      chatPanelRef.current.nexioWorkbenchService =
        framework.get(WorkbenchService);
      chatPanelRef.current.nexioThemeService = framework.get(AppThemeService);
      chatPanelRef.current.peekViewService = framework.get(PeekViewService);
      chatPanelRef.current.notificationService = new NotificationServiceImpl(
        confirmModal.closeConfirmModal,
        confirmModal.openConfirmModal
      );
      chatPanelRef.current.aiDraftService = framework.get(AIDraftService);
      chatPanelRef.current.aiToolsConfigService =
        framework.get(AIToolsConfigService);
      chatPanelRef.current.subscriptionService =
        framework.get(SubscriptionService);
      chatPanelRef.current.aiModelService = framework.get(AIModelService);
      chatPanelRef.current.onAISubscribe = handleAISubscribe;

      containerRef.current?.append(chatPanelRef.current);
    } else {
      chatPanelRef.current.host = editor.host;
      chatPanelRef.current.doc = editor.doc;
    }

    const docModeService = editor.host.std.get(DocModeProvider);
    const refNodeService = editor.host.std.getOptional(RefNodeSlotsProvider);
    const disposable = [
      refNodeService?.docLinkClicked.subscribe(({ host }) => {
        if (host === editor.host) {
          (chatPanelRef.current as ChatPanel).doc = editor.doc;
        }
      }),
      docModeService?.onPrimaryModeChange(() => {
        if (!editor.host) return;
        (chatPanelRef.current as ChatPanel).host = editor.host;
      }, editor.doc.id),
    ];

    return () => disposable.forEach(d => d?.unsubscribe());
  }, [
    docDisplayConfig,
    editor,
    framework,
    networkSearchConfig,
    searchMenuConfig,
    reasoningConfig,
    playgroundConfig,
    confirmModal,
    specs,
    handleAISubscribe,
  ]);

  const [autoResized, setAutoResized] = useState(false);
  useEffect(() => {
    // after auto expanded first time, do not auto expand again(even if user manually resized)
    if (autoResized) return;
    const subscription = AIProvider.slots.previewPanelOpenChange.subscribe(
      open => {
        if (!open) return;
        const sidebarWidth = workbench.sidebarWidth$.value;
        const MIN_SIDEBAR_WIDTH = 1080;
        if (!sidebarWidth || sidebarWidth < MIN_SIDEBAR_WIDTH) {
          workbench.setSidebarWidth(MIN_SIDEBAR_WIDTH);
          setAutoResized(true);
        }
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, [autoResized, workbench]);

  return <div className={styles.root} ref={containerRef} />;
});
