import { Button, usePromptModal } from '@nexio/component';
import { useI18n } from '@nexio/i18n';
import { SaveIcon } from '@blocksuite/icons/rc';
import { useCallback } from 'react';

import * as styles from './save-as-collection-button.css';

interface SaveAsCollectionButtonProps {
  onConfirm: (collectionName: string) => void;
}

export const SaveAsCollectionButton = ({
  onConfirm,
}: SaveAsCollectionButtonProps) => {
  const t = useI18n();
  const { openPromptModal } = usePromptModal();
  const handleClick = useCallback(() => {
    openPromptModal({
      title: t['com.nexio.editCollection.saveCollection'](),
      label: t['com.nexio.editCollectionName.name'](),
      inputOptions: {
        placeholder: t['com.nexio.editCollectionName.name.placeholder'](),
      },
      children: (
        <div className={styles.createTips}>
          {t['com.nexio.editCollectionName.createTips']()}
        </div>
      ),
      confirmText: t['com.nexio.editCollection.save'](),
      cancelText: t['com.nexio.editCollection.button.cancel'](),
      confirmButtonOptions: {
        variant: 'primary',
      },
      onConfirm(name) {
        onConfirm(name);
      },
    });
  }, [openPromptModal, t, onConfirm]);
  return (
    <Button
      onClick={handleClick}
      data-testid="save-as-collection"
      prefix={<SaveIcon />}
      className={styles.button}
    >
      {t['com.nexio.editCollection.saveCollection']()}
    </Button>
  );
};
