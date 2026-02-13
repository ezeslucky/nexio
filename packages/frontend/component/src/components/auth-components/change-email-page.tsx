import { useI18n } from '@nexio/i18n';
import { useCallback, useState } from 'react';

import { Button } from '../../ui/button';
import { AuthInput } from './auth-input';
import { AuthPageContainer } from './auth-page-container';
import * as styles from './share.css';
import { emailRegex } from './utils';

export const ChangeEmailPage = ({
  onChangeEmail: propsOnChangeEmail,
}: {
  onChangeEmail: (email: string) => Promise<boolean>;
  onOpenNexio: () => void;
}) => {
  const t = useI18n();
  const [hasSetUp, setHasSetUp] = useState(false);
  const [email, setEmail] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [loading, setLoading] = useState(false);
  const onContinue = useCallback(
    () =>
      void (async () => {
        if (!emailRegex.test(email)) {
          setIsValidEmail(false);
          return;
        }
        setIsValidEmail(true);
        setLoading(true);

        const setup = await propsOnChangeEmail(email);

        setLoading(false);
        setHasSetUp(setup);
      })(),
    [email, propsOnChangeEmail]
  );
  const onEmailChange = useCallback((value: string) => {
    setEmail(value);
  }, []);
  return (
    <AuthPageContainer
      title={t['com.nexio.auth.change.email.page.title']()}
      subtitle={t['com.nexio.auth.change.email.page.subtitle']()}
    >
      <>
        <AuthInput
          className={styles.input}
          label={t['com.nexio.settings.email']()}
          placeholder={t['com.nexio.auth.sign.email.placeholder']()}
          value={email}
          onChange={onEmailChange}
          error={!isValidEmail}
          errorHint={
            isValidEmail ? '' : t['com.nexio.auth.sign.email.error']()
          }
          onEnter={onContinue}
          disabled={hasSetUp}
        />
        <Button
          variant="primary"
          size="large"
          onClick={onContinue}
          loading={loading}
          disabled={hasSetUp}
        >
          {t['com.nexio.auth.set.email.save']()}
        </Button>
      </>
    </AuthPageContainer>
  );
};
