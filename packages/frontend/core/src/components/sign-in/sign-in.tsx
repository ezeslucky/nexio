import { Button, notify } from '@nexio/component';
import {
  AuthContainer,
  AuthContent,
  AuthFooter,
  AuthHeader,
  AuthInput,
} from '@nexio/component/auth-components';
import { OAuth } from '@nexio/core/components/nexio/auth/oauth';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { AuthService, ServerService } from '@nexio/core/modules/cloud';
import type { AuthSessionStatus } from '@nexio/core/modules/cloud/entities/session';
import { ServerDeploymentType } from '@nexio/graphql';
import { Trans, useI18n } from '@nexio/i18n';
import {
  ArrowRightBigIcon,
  LocalWorkspaceIcon,
  PublishIcon,
} from '@canvas/icons/rc';
import { useLiveData, useService } from '@ezeslucky/infra';
import { cssVar } from '@ezeslucky/theme';
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { useSelfhostLoginVersionGuard } from '../hooks/nexio/use-selfhost-login-version-guard';
import type { SignInState } from '.';
import { Back } from './back';
import * as style from './style.css';

const emailRegex =
  /^(?:(?:[^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(?:(?:\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|((?:[a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

function validateEmail(email: string) {
  return emailRegex.test(email);
}

export const SignInStep = ({
  state,
  changeState,
  onSkip,
  onAuthenticated,
}: {
  state: SignInState;
  changeState: Dispatch<SetStateAction<SignInState>>;
  onSkip: () => void;
  onAuthenticated?: (status: AuthSessionStatus) => void;
}) => {
  const t = useI18n();
  const serverService = useService(ServerService);
  const serverName = useLiveData(
    serverService.server.config$.selector(c => c.serverName)
  );
  const versionError = useSelfhostLoginVersionGuard(serverService.server);
  const isSelfhosted = useLiveData(
    serverService.server.config$.selector(
      c => c.type === ServerDeploymentType.Selfhosted
    )
  );
  const authService = useService(AuthService);
  const [isMutating, setIsMutating] = useState(false);

  const [email, setEmail] = useState('');

  const [isValidEmail, setIsValidEmail] = useState(true);

  const loginStatus = useLiveData(authService.session.status$);

  useEffect(() => {
    if (loginStatus === 'authenticated') {
      notify.success({
        title: t['com.nexio.auth.toast.title.signed-in'](),
        message: t['com.nexio.auth.toast.message.signed-in'](),
      });
    }
    onAuthenticated?.(loginStatus);
  }, [loginStatus, onAuthenticated, t]);

  const onContinue = useAsyncCallback(async () => {
    if (!validateEmail(email)) {
      setIsValidEmail(false);
      return;
    }

    setIsValidEmail(true);
    setIsMutating(true);

    try {
      const { hasPassword } = await authService.checkUserByEmail(email);

      if (hasPassword) {
        changeState(prev => ({
          ...prev,
          email,
          step: 'signInWithPassword',
          hasPassword: true,
        }));
      } else {
        changeState(prev => ({
          ...prev,
          email,
          step: 'signInWithEmail',
          hasPassword: false,
        }));
      }
    } catch (err: any) {
      console.error(err);

      // TODO(@eyhn): better error handling
      notify.error({
        title: 'Failed to sign in',
        message: err.message,
      });
    }

    setIsMutating(false);
  }, [authService, changeState, email]);

  const onAddSelfhosted = useCallback(() => {
    changeState(prev => ({
      ...prev,
      step: 'addSelfhosted',
    }));
  }, [changeState]);

  if (versionError && isSelfhosted) {
    return (
      <AuthContainer>
        <AuthHeader
          title={t['com.nexio.auth.sign.in']()}
          subTitle={serverName}
        />
        <AuthContent>
          <div>{versionError}</div>
        </AuthContent>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <AuthHeader
        title={t['com.nexio.auth.sign.in']()}
        subTitle={serverName}
      />

      <AuthContent>
        <OAuth redirectUrl={state.redirectUrl} />

        <AuthInput
          className={style.authInput}
          label={t['com.nexio.settings.email']()}
          placeholder={t['com.nexio.auth.sign.email.placeholder']()}
          onChange={setEmail}
          error={!isValidEmail}
          errorHint={
            isValidEmail ? '' : t['com.nexio.auth.sign.email.error']()
          }
          onEnter={onContinue}
        />

        <Button
          className={style.signInButton}
          style={{ width: '100%' }}
          size="extraLarge"
          data-testid="continue-login-button"
          block
          loading={isMutating}
          suffix={<ArrowRightBigIcon />}
          suffixStyle={{ width: 20, height: 20, color: cssVar('blue') }}
          onClick={onContinue}
        >
          {t['com.nexio.auth.sign.email.continue']()}
        </Button>

        {!isSelfhosted && (
          <>
            <div className={style.authMessage}>
              {/*prettier-ignore*/}
              <Trans i18nKey="com.nexio.auth.sign.message">
                By clicking &quot;Continue with Google/Email&quot; above, you acknowledge that
                you agree to NEXIO&apos;s <a href="https://nexio.pro/terms" target="_blank" rel="noreferrer">Terms of Conditions</a> and <a href="https://nexio.pro/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            </Trans>
            </div>
            <div className={style.skipDivider}>
              <div className={style.skipDividerLine} />
              <span className={style.skipDividerText}>or</span>
              <div className={style.skipDividerLine} />
            </div>
            <div className={style.skipSection}>
              {BUILD_CONFIG.isNative ? (
                <Button
                  variant="plain"
                  className={style.addSelfhostedButton}
                  prefix={
                    <PublishIcon className={style.addSelfhostedButtonPrefix} />
                  }
                  onClick={onAddSelfhosted}
                >
                  {t['com.nexio.auth.sign.add-selfhosted']()}
                </Button>
              ) : (
                <div className={style.skipText}>
                  {t['com.nexio.mobile.sign-in.skip.hint']()}
                </div>
              )}
              <Button
                variant="plain"
                onClick={onSkip}
                className={style.skipLink}
                prefix={<LocalWorkspaceIcon className={style.skipLinkIcon} />}
              >
                {t['com.nexio.mobile.sign-in.skip.link']()}
              </Button>
            </div>
          </>
        )}
      </AuthContent>
      {isSelfhosted && (
        <AuthFooter>
          <Back changeState={changeState} />
        </AuthFooter>
      )}
    </AuthContainer>
  );
};
