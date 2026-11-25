import { Modal } from '@nexio/component';
import { SignInPanel, type SignInStep } from '@nexio/core/components/sign-in';
import {
  RouteLogic,
  useNavigateHelper,
} from '@nexio/core/components/hooks/use-navigate-helper';
import type { AuthSessionStatus } from '@nexio/core/modules/cloud/entities/session';
import type {
  DialogComponentProps,
  GLOBAL_DIALOG_SCHEMA,
} from '@nexio/core/modules/dialogs';
import { useCallback } from 'react';
export const SignInDialog = ({
  close,
  server: initialServerBaseUrl,
  step,
}: DialogComponentProps<GLOBAL_DIALOG_SCHEMA['sign-in']>) => {
  const { jumpToIndex } = useNavigateHelper();
  const onAuthenticated = useCallback(
    (status: AuthSessionStatus) => {
      if (status === 'authenticated') {
        close();
        jumpToIndex(RouteLogic.REPLACE);
      }
    },
    [close, jumpToIndex]
  );
  return (
    <Modal
      open
      persistent
      onOpenChange={() => close()}
      width={420}
      contentOptions={{
        ['data-testid' as string]: 'auth-modal',
        style: {
          padding: '36px 36px 24px',
          minHeight: 480,
          maxHeight: 650,
        },
      }}
    >
      <SignInPanel
        onSkip={close}
        onAuthenticated={onAuthenticated}
        server={initialServerBaseUrl}
        initStep={step as SignInStep}
      />
    </Modal>
  );
};
