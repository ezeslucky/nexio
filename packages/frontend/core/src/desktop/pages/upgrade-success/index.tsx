import { Button } from '@nexio/component';
import { AuthPageContainer } from '@nexio/component/auth-components';
import { useNavigateHelper } from '@nexio/core/components/hooks/use-navigate-helper';
import { Trans, useI18n } from '@nexio/i18n';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import * as styles from './styles.css';

/**
 * /upgrade-success page
 *
 * only on web
 */
export const Component = () => {
  const t = useI18n();
  const [params] = useSearchParams();
  const { jumpToIndex, jumpToOpenInApp } = useNavigateHelper();

  const openNEXIO = useCallback(() => {
    if (params.get('client')) {
      return jumpToOpenInApp('bring-to-front');
    } else {
      jumpToIndex();
    }
  }, [jumpToIndex, jumpToOpenInApp, params]);

  const subtitle = (
    <div className={styles.leftContentText}>
      {t['com.nexio.payment.upgrade-success-page.text']()}
      <div>
        <Trans
          i18nKey={'com.nexio.payment.upgrade-success-page.support'}
          components={{
            1: (
              <a
                href="mailto:support@ezeslucky.info"
                className={styles.mail}
              />
            ),
          }}
        />
      </div>
    </div>
  );

  return (
    <AuthPageContainer
      title={t['com.nexio.payment.upgrade-success-page.title']()}
      subtitle={subtitle}
    >
      <Button variant="primary" size="extraLarge" onClick={openNEXIO}>
        {t['com.nexio.other-page.nav.open-nexio']()}
      </Button>
    </AuthPageContainer>
  );
};
