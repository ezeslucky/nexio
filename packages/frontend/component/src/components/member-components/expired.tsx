import { useI18n } from '@nexio/i18n';

import { Button } from '../../ui/button';
import { AuthPageContainer } from '../auth-components';

export const ExpiredPage = ({ onOpenNexio }: { onOpenNexio: () => void }) => {
  const t = useI18n();
  return (
    <AuthPageContainer
      title={t['com.affine.expired.page.title']()}
      subtitle={t['com.affine.expired.page.new-subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onOpenNexio}>
        {t['com.affine.auth.open.affine']()}
      </Button>
    </AuthPageContainer>
  );
};
