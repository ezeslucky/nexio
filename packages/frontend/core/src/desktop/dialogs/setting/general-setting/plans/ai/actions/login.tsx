import { Button, type ButtonProps } from '@nexio/component';
import { GlobalDialogService } from '@nexio/core/modules/dialogs';
import { useI18n } from '@nexio/i18n';
import { useService } from '@toeverything/infra';
import { useCallback } from 'react';

export const AILogin = (btnProps: ButtonProps) => {
  const t = useI18n();
  const globalDialogService = useService(GlobalDialogService);

  const onClickSignIn = useCallback(() => {
    globalDialogService.open('sign-in', {});
  }, [globalDialogService]);

  return (
    <Button onClick={onClickSignIn} variant="primary" {...btnProps}>
      {t['com.nexio.payment.ai.action.login.button-label']()}
    </Button>
  );
};
