import { notify } from '@nexio/component';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { AuthService, ServerService } from '@nexio/core/modules/cloud';
import type { AuthSessionStatus } from '@nexio/core/modules/cloud/entities/session';
import { UrlService } from '@nexio/core/modules/url';
import { UserFriendlyError } from '@nexio/error';
import { OAuthProviderType, ServerDeploymentType } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import track from '@nexio/track';
import { useLiveData, useService } from '@toeverything/infra';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useState,
} from 'react';

import {
  attachOAuthFlowToAuthUrl,
  attachOAuthNonceToAuthUrl,
} from '../../desktop/pages/auth/oauth-flow';
import { useSelfhostLoginVersionGuard } from '../hooks/nexio/use-selfhost-login-version-guard';
import type { SignInState } from '.';
import { Back } from './back';
import * as style from './style.css';

const GoogleColorIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ flexShrink: 0 }}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const LockOutlineIcon = ({ size = 13 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const ArrowRightIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

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
  const authService = useService(AuthService);
  const urlService = useService(UrlService);
  const versionError = useSelfhostLoginVersionGuard(serverService.server);
  const isSelfhosted = useLiveData(
    serverService.server.config$.selector(
      c => c.type === ServerDeploymentType.Selfhosted
    )
  );

  const [isMutating, setIsMutating] = useState(false);
  const loginStatus = useLiveData(authService.session.status$);

  useEffect(() => {
    if (loginStatus === 'authenticated') {
      notify.success({
        title: t['com.affine.auth.toast.title.signed-in'](),
        message: t['com.affine.auth.toast.message.signed-in'](),
      });
    }
    onAuthenticated?.(loginStatus);
  }, [loginStatus, onAuthenticated, t]);

  const onGoogleSignIn = useAsyncCallback(async () => {
    track.$.$.auth.signIn({
      method: 'oauth',
      provider: OAuthProviderType.Google,
    });
    setIsMutating(true);

    try {
      if (BUILD_CONFIG.isNative) {
        const scheme = urlService.getClientScheme();
        const options = await authService.oauthPreflight(
          OAuthProviderType.Google,
          scheme ?? 'web'
        );
        urlService.openPopupWindow(options.url);
      } else {
        const res = await authService.oauthPreflight(
          OAuthProviderType.Google,
          'web',
          state.redirectUrl
        );
        if (res?.url) {
          const nonce = authService.getClientNonce();
          let targetUrl = attachOAuthFlowToAuthUrl(res.url, 'redirect');
          if (nonce) {
            targetUrl = attachOAuthNonceToAuthUrl(targetUrl, nonce);
          }
          location.href = targetUrl;
        } else {
          const params = new URLSearchParams();
          params.set('provider', OAuthProviderType.Google);
          if (state.redirectUrl) {
            params.set('redirect_uri', state.redirectUrl);
          }
          params.set('flow', 'redirect');

          const oauthUrl =
            serverService.server.baseUrl +
            `/oauth/login?${params.toString()}`;

          urlService.openExternal(oauthUrl);
        }
      }
    } catch (e: any) {
      const msg = String(e?.message || '');
      const errName = String(e?.name || '');
      if (
        msg.toLowerCase().includes('unknown') ||
        msg.toLowerCase().includes('not configured') ||
        msg.includes('INVALID_INPUT') ||
        errName === 'UNKNOWN_OAUTH_PROVIDER'
      ) {
        notify.warning({
          title: 'Google Sign-In',
          message:
            'To enable Google sign-in, configure your Google OAuth Client ID and Secret in your server environment.',
        });
      } else {
        notify.error(UserFriendlyError.fromAny(e));
      }
    } finally {
      setIsMutating(false);
    }
  }, [authService, urlService, serverService, state.redirectUrl]);

  if (versionError && isSelfhosted) {
    return (
      <div className={style.cardContainer}>
        <div>{versionError}</div>
      </div>
    );
  }

  return (
    <div className={style.cardContainer}>
      {/* Top Badge: 🔒 MEMBERS ONLY */}
      <div className={style.membersBadge}>
        <LockOutlineIcon size={13} />
        <span>MEMBERS ONLY</span>
      </div>

      {/* Heading */}
      <h1 className={style.cardHeading}>
        Sign in to continue
        <span className={style.cardHeadingHighlight}>your journey</span>
      </h1>

      {/* Subtitle */}
      <p className={style.cardSubtitle}>
        One click with Google — no password required.
      </p>

      {/* Primary Google Auth Button */}
      <button
        type="button"
        className={style.googleAuthButton}
        onClick={onGoogleSignIn}
        disabled={isMutating}
        data-testid="continue-google-button"
      >
        <div className={style.googleAuthLeft}>
          <GoogleColorIcon size={20} />
          <span className={style.googleAuthText}>
            {isMutating ? 'Signing in with Google...' : 'Continue with Google'}
          </span>
        </div>
        <div className={style.googleAuthArrow}>
          <ArrowRightIcon size={18} />
        </div>
      </button>

      {/* Divider */}
      <div className={style.skipDivider}>
        <div className={style.skipDividerLine} />
        <span className={style.skipDividerText}>or</span>
        <div className={style.skipDividerLine} />
      </div>

      {/* Value Bullet Points */}
      <ul className={style.bulletList}>
        <li className={style.bulletItem}>
          <span className={style.bulletDot} />
          <span>Sign in with your Google account</span>
        </li>
        <li className={style.bulletItem}>
          <span className={style.bulletDot} />
          <span>No password needed</span>
        </li>
        <li className={style.bulletItem}>
          <span className={style.bulletDot} />
          <span>No spam, ever</span>
        </li>
      </ul>

      {/* Terms & Privacy Notice */}
      <div className={style.termsNotice}>
        By signing in you agree to our{' '}
        <a
          href="https://technexio.me/terms"
          target="_blank"
          rel="noreferrer"
          className={style.termsLink}
        >
          Terms
        </a>{' '}
        &{' '}
        <a
          href="https://technexio.me/privacy"
          target="_blank"
          rel="noreferrer"
          className={style.termsLink}
        >
          Privacy Policy
        </a>
        .
      </div>

      {/* Local Workspace Direct Access */}
      <button
        type="button"
        onClick={onSkip}
        className={style.localWorkspaceLink}
      >
        Continue to Workspace directly →
      </button>

      {isSelfhosted && (
        <div style={{ marginTop: '16px' }}>
          <Back changeState={changeState} />
        </div>
      )}
    </div>
  );
};
