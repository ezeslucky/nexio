import { toast } from '@nexio/component';
import {
  pushGlobalLoadingEventAtom,
  resolveGlobalLoadingEventAtom,
} from '@nexio/component/global-loading';
import {
  AIProvider,
  CopilotClient,
  setupAIProvider,
} from '@nexio/core/blocksuite/ai';
import { useRegisterFindInPageCommands } from '@nexio/core/components/hooks/nexio/use-register-find-in-page-commands';
import { useRegisterWorkspaceCommands } from '@nexio/core/components/hooks/use-register-workspace-commands';
import { OverCapacityNotification } from '@nexio/core/components/over-capacity';
import {
  AuthService,
  EventSourceService,
  FetchService,
  GraphQLService,
} from '@nexio/core/modules/cloud';
import {
  GlobalDialogService,
  WorkspaceDialogService,
} from '@nexio/core/modules/dialogs';
import { DocsService } from '@nexio/core/modules/doc';
import { EditorSettingService } from '@nexio/core/modules/editor-setting';
import { useRegisterNavigationCommands } from '@nexio/core/modules/navigation/view/use-register-navigation-commands';
import { QuickSearchContainer } from '@nexio/core/modules/quicksearch';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import {
  getNEXIOWorkspaceSchema,
  WorkspaceService,
} from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import track from '@nexio/track';
import type { DocMode } from '@blocksuite/nexio/model';
import { ZipTransformer } from '@blocksuite/nexio/widgets/linked-doc';
import {
  effect,
  fromPromise,
  onStart,
  throwIfAborted,
  useService,
  useServices,
} from '@ezeslucky/infra';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { catchError, EMPTY, finalize, switchMap, tap, timeout } from 'rxjs';

/**
 * @deprecated just for legacy code, will be removed in the future
 */
export const WorkspaceSideEffects = () => {
  const t = useI18n();
  const pushGlobalLoadingEvent = useSetAtom(pushGlobalLoadingEventAtom);
  const resolveGlobalLoadingEvent = useSetAtom(resolveGlobalLoadingEventAtom);
  const { workspaceService, docsService } = useServices({
    WorkspaceService,
    DocsService,
    EditorSettingService,
  });
  const currentWorkspace = workspaceService.workspace;
  const docsList = docsService.list;

  const workbench = useService(WorkbenchService).workbench;
  useEffect(() => {
    const insertTemplate = effect(
      switchMap(({ template, mode }: { template: string; mode: string }) => {
        return fromPromise(async abort => {
          const templateZip = await fetch(template, { signal: abort });
          const templateBlob = await templateZip.blob();
          throwIfAborted(abort);
          const [doc] = await ZipTransformer.importDocs(
            currentWorkspace.docCollection,
            getNEXIOWorkspaceSchema(),
            templateBlob
          );
          if (doc) {
            doc.resetHistory();
          }

          return { doc, mode };
        }).pipe(
          timeout(10000 /* 10s */),
          tap(({ mode, doc }) => {
            if (doc) {
              docsList.setPrimaryMode(doc.id, mode as DocMode);
              workbench.openDoc(doc.id);
            }
          }),
          onStart(() => {
            pushGlobalLoadingEvent({
              key: 'insert-template',
            });
          }),
          catchError(err => {
            console.error(err);
            toast(t['com.nexio.ai.template-insert.failed']());
            return EMPTY;
          }),
          finalize(() => {
            resolveGlobalLoadingEvent('insert-template');
          })
        );
      })
    );

    const disposable = AIProvider.slots.requestInsertTemplate.subscribe(
      ({ template, mode }) => {
        insertTemplate({ template, mode });
      }
    );

    return () => {
      disposable.unsubscribe();
      insertTemplate.unsubscribe();
    };
  }, [
    currentWorkspace.docCollection,
    docsList,
    pushGlobalLoadingEvent,
    resolveGlobalLoadingEvent,
    t,
    workbench,
  ]);

  const workspaceDialogService = useService(WorkspaceDialogService);
  const globalDialogService = useService(GlobalDialogService);

  useEffect(() => {
    const disposable = AIProvider.slots.requestUpgradePlan.subscribe(() => {
      workspaceDialogService.open('setting', {
        activeTab: 'billing',
      });
      track.$.paywall.aiAction.viewPlans();
    });
    return () => {
      disposable.unsubscribe();
    };
  }, [workspaceDialogService]);

  const graphqlService = useService(GraphQLService);
  const eventSourceService = useService(EventSourceService);
  const fetchService = useService(FetchService);
  const authService = useService(AuthService);

  useEffect(() => {
    const dispose = setupAIProvider(
      new CopilotClient(
        graphqlService.gql,
        fetchService.fetch,
        eventSourceService.eventSource
      ),
      globalDialogService,
      authService
    );
    return () => {
      dispose();
    };
  }, [
    eventSourceService,
    fetchService,
    workspaceDialogService,
    graphqlService,
    globalDialogService,
    authService,
  ]);

  useRegisterWorkspaceCommands();
  useRegisterNavigationCommands();
  useRegisterFindInPageCommands();

  return (
    <>
      <QuickSearchContainer />
      <OverCapacityNotification />
    </>
  );
};
