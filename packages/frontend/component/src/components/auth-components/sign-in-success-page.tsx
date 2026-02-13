import { useI18n } from '@nexio/i18n';
import type { FC } from 'react';

import { Button } from '../../ui/button';
import { AuthPageContainer } from './auth-page-container';

export const SignInSuccessPage: FC<{
  onOpenNexio: () => void;
}> = ({ onOpenNexio }) => {
  const t = useI18n();
  return (
    <AuthPageContainer
      title={t['com.nexio.auth.signed.success.title']()}
      subtitle={t['com.nexio.auth.signed.success.subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onOpenNexio}>
        {t['com.nexio.auth.open.nexio']()}
      </Button>
    </AuthPageContainer>
  );
};
