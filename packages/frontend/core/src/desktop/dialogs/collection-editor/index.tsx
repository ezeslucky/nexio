import { Modal } from '@nexio/component';
import {
  type CollectionInfo,
  CollectionService,
} from '@nexio/core/modules/collection';
import type { DialogComponentProps } from '@nexio/core/modules/dialogs';
import type { WORKSPACE_DIALOG_SCHEMA } from '@nexio/core/modules/dialogs/constant';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useCallback } from 'react';

import { EditCollection } from './edit-collection';

export const CollectionEditorDialog = ({
  close,
  collectionId,
  mode,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['collection-editor']>) => {
  const t = useI18n();
  const collectionService = useService(CollectionService);
  const collection = useLiveData(collectionService.collection$(collectionId));
  const onConfirmOnCollection = useCallback(
    (collection: CollectionInfo) => {
      collectionService.updateCollection(collection.id, collection);
      close();
    },
    [close, collectionService]
  );
  const info = useLiveData(collection?.info$);
  const onCancel = useCallback(() => {
    close();
  }, [close]);

  if (!collection || !info) {
    return null;
  }

  return (
    <Modal
      open
      onOpenChange={onCancel}
      withoutCloseButton
      width="calc(100% - 64px)"
      height="80%"
      contentOptions={{
        style: {
          padding: 0,
          maxWidth: 944,
          backgroundColor: 'var(--nexio-background-primary-color)',
        },
      }}
      persistent
    >
      <EditCollection
        onConfirmText={t['com.nexio.editCollection.save']()}
        init={info}
        mode={mode}
        onCancel={onCancel}
        onConfirm={onConfirmOnCollection}
      />
    </Modal>
  );
};
