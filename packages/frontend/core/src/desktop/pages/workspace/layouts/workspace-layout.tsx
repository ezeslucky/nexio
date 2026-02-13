import { uniReactRoot } from '@nexio/component';
import { AiLoginRequiredModal } from '@nexio/core/components/nexio/auth/ai-login-required';
import { useResponsiveSidebar } from '@nexio/core/components/hooks/use-responsive-siedebar';
import { SWRConfigProvider } from '@nexio/core/components/providers/swr-config-provider';
import { WorkspaceSideEffects } from '@nexio/core/components/providers/workspace-side-effects';
import { AIIsland } from '@nexio/core/desktop/components/ai-island';
import { AppContainer } from '@nexio/core/desktop/components/app-container';
import { DocumentTitle } from '@nexio/core/desktop/components/document-title';
import { WorkspaceDialogs } from '@nexio/core/desktop/dialogs';
import { PeekViewManagerModal } from '@nexio/core/modules/peek-view';
import { QuotaCheck } from '@nexio/core/modules/quota';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { LiveData, useLiveData, useService } from '@toeverything/infra';
import type { PropsWithChildren } from 'react';

export const WorkspaceLayout = function WorkspaceLayout({
  children,
}: PropsWithChildren) {
  const currentWorkspace = useService(WorkspaceService).workspace;
  return (
    <SWRConfigProvider>
      <WorkspaceDialogs />

      {/* ---- some side-effect components ---- */}
      {currentWorkspace?.flavour !== 'local' ? (
        <QuotaCheck workspaceMeta={currentWorkspace.meta} />
      ) : null}
      <AiLoginRequiredModal />
      <WorkspaceSideEffects />
      <PeekViewManagerModal />
      <DocumentTitle />

      <WorkspaceLayoutInner>{children}</WorkspaceLayoutInner>
      {/* should show after workspace loaded */}
      {/* FIXME: wait for better ai, <WorkspaceAIOnboarding /> */}
      <AIIsland />
      <uniReactRoot.Root />
    </SWRConfigProvider>
  );
};

/**
 * Wraps the workspace layout main router view
 */
const WorkspaceLayoutUIContainer = ({ children }: PropsWithChildren) => {
  const workbench = useService(WorkbenchService).workbench;
  const currentPath = useLiveData(
    LiveData.computed(get => {
      return get(workbench.basename$) + get(workbench.location$).pathname;
    })
  );
  useResponsiveSidebar();

  return (
    <AppContainer data-current-path={currentPath}>{children}</AppContainer>
  );
};
const WorkspaceLayoutInner = ({ children }: PropsWithChildren) => {
  return <WorkspaceLayoutUIContainer>{children}</WorkspaceLayoutUIContainer>;
};
