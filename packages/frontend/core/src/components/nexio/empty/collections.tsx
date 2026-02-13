import { usePromptModal } from '@nexio/component';
import { useNavigateHelper } from '@nexio/core/components/hooks/use-navigate-helper';
import { CollectionService } from '@nexio/core/modules/collection';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { ViewLayersIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useCallback } from 'react';

import { ActionButton } from './action-button';
import collectionListDark from './assets/collection-list.dark.png';
import collectionListLight from './assets/collection-list.light.png';
import { EmptyLayout } from './layout';
import type { UniversalEmptyProps } from './types';

export const EmptyCollections = (props: UniversalEmptyProps) => {
  const t = useI18n();
  const collectionService = useService(CollectionService);
  const currentWorkspace = useService(WorkspaceService).workspace;

  const navigateHelper = useNavigateHelper();
  const { openPromptModal } = usePromptModal();

  const showAction = true;

  const handleCreateCollection = useCallback(() => {
    openPromptModal({
      title: t['com.nexio.editCollection.saveCollection'](),
      label: t['com.nexio.editCollectionName.name'](),
      inputOptions: {
        placeholder: t['com.nexio.editCollectionName.name.placeholder'](),
      },
      children: t['com.nexio.editCollectionName.createTips'](),
      confirmText: t['com.nexio.editCollection.save'](),
      cancelText: t['com.nexio.editCollection.button.cancel'](),
      confirmButtonOptions: {
        variant: 'primary',
      },
      onConfirm(name) {
        const id = collectionService.createCollection({ name });
        navigateHelper.jumpToCollection(currentWorkspace.id, id);
      },
    });
  }, [
    collectionService,
    currentWorkspace.id,
    navigateHelper,
    openPromptModal,
    t,
  ]);

  return (
    <EmptyLayout
      illustrationLight={collectionListLight}
      illustrationDark={collectionListDark}
      title={t['com.nexio.empty.collections.title']()}
      description={t['com.nexio.empty.collections.description']()}
      action={
        showAction ? (
          <ActionButton
            prefix={<ViewLayersIcon />}
            onClick={handleCreateCollection}
          >
            {t['com.nexio.empty.collections.action.new-collection']()}
          </ActionButton>
        ) : null
      }
      {...props}
    />
  );
};
