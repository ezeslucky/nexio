import { Button } from '@nexio/component/ui/button';
import { GlobalDialogService } from '@nexio/core/modules/dialogs';
import { useI18n } from '@nexio/i18n';
import { useService } from '@ezeslucky/infra';
import { useCallback } from 'react';

import * as styles from './styles.css';

export const SignIn = () => {
  const globalDialogService = useService(GlobalDialogService);

  const t = useI18n();

  const onClickSignIn = useCallback(() => {
    globalDialogService.open('sign-in', {});
  }, [globalDialogService]);

  return (
    <Button
      className={styles.editButton}
      onClick={onClickSignIn}
      data-testid="share-page-sign-in-button"
    >
      {t['com.nexio.share-page.header.login']()}
    </Button>
  );
};
