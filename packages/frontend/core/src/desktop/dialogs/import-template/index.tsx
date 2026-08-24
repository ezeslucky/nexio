import { Button, Modal } from '@nexio/component';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { useNavigateHelper } from '@nexio/core/components/hooks/use-navigate-helper';
import { useWorkspaceName } from '@nexio/core/components/hooks/use-workspace-info';
import { WorkspaceSelector } from '@nexio/core/components/workspace-selector';
import { AuthService } from '@nexio/core/modules/cloud';
import {
  type DialogComponentProps,
  type GLOBAL_DIALOG_SCHEMA,
} from '@nexio/core/modules/dialogs';
import {
  ImportTemplateService,
  TemplateDownloaderService,
} from '@nexio/core/modules/import-template';
import {
  type WorkspaceMetadata,
  WorkspacesService,
} from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import type { DocMode } from '@canvas/nexio/model';
import { AllDocsIcon } from '@canvas/icons/rc';
import { useLiveData, useService } from '@ezeslucky/infra';
import { cssVar } from '@toeverything/theme';
import { useCallback, useEffect, useState } from 'react';

import * as styles from './dialog.css';

const Dialog = ({
  templateName,
  templateMode,
  snapshotUrl,
  onClose,
}: {
  templateName: string;
  templateMode: DocMode;
  snapshotUrl: string;
  onClose?: () => void;
}) => {
  const t = useI18n();
  const session = useService(AuthService).session;
  const notLogin = useLiveData(session.status$) === 'unauthenticated';
  const isSessionRevalidating = useLiveData(session.isRevalidating$);

  const [importing, setImporting] = useState(false);
  const [importingError, setImportingError] = useState<any>(null);
  const workspacesService = useService(WorkspacesService);
  const templateDownloaderService = useService(TemplateDownloaderService);
  const importTemplateService = useService(ImportTemplateService);
  const templateDownloader = templateDownloaderService.downloader;
  const isDownloading = useLiveData(templateDownloader.isDownloading$);
  const downloadError = useLiveData(templateDownloader.error$);
  const workspaces = useLiveData(workspacesService.list.workspaces$);
  const [rawSelectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceMetadata | null>(null);
  const selectedWorkspace =
    rawSelectedWorkspace ??
    workspaces.find(w => w.flavour !== 'local') ??
    workspaces.at(0);
  const selectedWorkspaceName = useWorkspaceName(selectedWorkspace);
  const { openPage, jumpToSignIn } = useNavigateHelper();

  const noWorkspace = workspaces.length === 0;

  useEffect(() => {
    workspacesService.list.revalidate();
  }, [workspacesService]);

  useEffect(() => {
    session.revalidate();
  }, [session]);

  useEffect(() => {
    if (!isSessionRevalidating && notLogin) {
      jumpToSignIn(
        '/template/import?' +
          '&name=' +
          templateName +
          '&mode=' +
          templateMode +
          '&snapshotUrl=' +
          snapshotUrl
      );
      onClose?.();
    }
  }, [
    isSessionRevalidating,
    jumpToSignIn,
    notLogin,
    onClose,
    snapshotUrl,
    templateName,
    templateMode,
  ]);

  useEffect(() => {
    templateDownloader.download({ snapshotUrl });
  }, [snapshotUrl, templateDownloader]);

  const handleSelectedWorkspace = useCallback(
    (workspaceMetadata: WorkspaceMetadata) => {
      return setSelectedWorkspace(workspaceMetadata);
    },
    []
  );

  const handleCreatedWorkspace = useCallback(
    (payload: { metadata: WorkspaceMetadata; defaultDocId?: string }) => {
      return setSelectedWorkspace(payload.metadata);
    },
    []
  );

  const handleImportToSelectedWorkspace = useAsyncCallback(async () => {
    if (templateDownloader.data$.value && selectedWorkspace) {
      setImporting(true);
      try {
        const docId = await importTemplateService.importToWorkspace(
          selectedWorkspace,
          templateDownloader.data$.value,
          templateMode
        );
        openPage(selectedWorkspace.id, docId);
        onClose?.();
      } catch (err) {
        setImportingError(err);
      } finally {
        setImporting(false);
      }
    }
  }, [
    importTemplateService,
    onClose,
    openPage,
    selectedWorkspace,
    templateDownloader.data$.value,
    templateMode,
  ]);

  const handleImportToNewWorkspace = useAsyncCallback(async () => {
    if (!templateDownloader.data$.value) {
      return;
    }
    setImporting(true);
    try {
      const { workspaceId, docId } =
        await importTemplateService.importToNewWorkspace(
          // TODO: support selfhosted
          'nexio-cloud',
          'Workspace',
          templateDownloader.data$.value
        );
      openPage(workspaceId, docId);
      onClose?.();
    } catch (err) {
      setImportingError(err);
    } finally {
      setImporting(false);
    }
  }, [
    importTemplateService,
    onClose,
    openPage,
    templateDownloader.data$.value,
  ]);

  const disabled = isDownloading || importing || notLogin;

  return (
    <>
      <div className={styles.dialogContainer}>
        <AllDocsIcon className={styles.mainIcon} />
        <h6 className={styles.mainTitle}>
          {t['com.nexio.import-template.dialog.createDocWithTemplate']({
            templateName,
          })}
        </h6>
        {noWorkspace ? (
          <p className={styles.desc}>A new workspace will be created.</p>
        ) : (
          <>
            <p className={styles.desc}>Choose a workspace.</p>
            <WorkspaceSelector
              workspaceMetadata={selectedWorkspace}
              onSelectWorkspace={handleSelectedWorkspace}
              onCreatedWorkspace={handleCreatedWorkspace}
              className={styles.workspaceSelector}
              showArrowDownIcon
              disable={disabled}
              menuContentOptions={{
                side: 'top',
                style: {
                  maxHeight: 'min(600px, calc(50vh + 50px))',
                  width: 352,
                  maxWidth: 'calc(100vw - 20px)',
                },
              }}
            />
          </>
        )}
      </div>
      {importingError && (
        <span style={{ color: cssVar('warningColor') }}>
          {t['com.nexio.import-template.dialog.errorImport']()}
        </span>
      )}
      {downloadError ? (
        <span style={{ color: cssVar('warningColor') }}>
          {t['com.nexio.import-template.dialog.errorLoad']()}
        </span>
      ) : selectedWorkspace ? (
        <Button
          className={styles.mainButton}
          variant={disabled ? 'secondary' : 'primary'}
          loading={disabled}
          disabled={disabled}
          onClick={handleImportToSelectedWorkspace}
          data-testid="import-template-to-workspace-btn"
        >
          {selectedWorkspaceName &&
            t['com.nexio.import-template.dialog.createDocToWorkspace']({
              workspace: selectedWorkspaceName,
            })}
        </Button>
      ) : (
        <Button
          className={styles.mainButton}
          variant="primary"
          loading={disabled}
          disabled={disabled}
          onClick={handleImportToNewWorkspace}
        >
          {t['com.nexio.import-template.dialog.createDocToNewWorkspace']()}
        </Button>
      )}
    </>
  );
};

export const ImportTemplateDialog = ({
  close,
  snapshotUrl,
  templateName,
  templateMode,
}: DialogComponentProps<GLOBAL_DIALOG_SCHEMA['import-template']>) => {
  return (
    <Modal
      open
      modal={true}
      persistent
      withoutCloseButton
      contentOptions={{
        className: styles.modal,
      }}
      onOpenChange={() => close()}
    >
      <Dialog
        templateName={templateName}
        templateMode={templateMode}
        snapshotUrl={snapshotUrl}
        onClose={() => close()}
      />
    </Modal>
  );
};
