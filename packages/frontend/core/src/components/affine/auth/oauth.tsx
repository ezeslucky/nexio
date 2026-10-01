import { Button } from '@affine/component/ui/button';
import { notify } from '@affine/component/ui/notification';
import { useAsyncCallback } from '@affine/core/components/hooks/affine-async-hooks';
import { AuthService, ServerService } from '@affine/core/modules/cloud';
import { UrlService } from '@affine/core/modules/url';
import { UserFriendlyError } from '@affine/error';
import { OAuthProviderType } from '@affine/graphql';
import track from '@affine/track';
import {
  AppleIcon,
  GithubIcon,
  GoogleIcon,
  LockIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { type ReactElement, type SVGAttributes, useCallback, useMemo } from 'react';

const OAuthProviderMap: Record<
  OAuthProviderType,
  {
    icon: ReactElement<SVGAttributes<SVGElement>>;
  }
> = {
  [OAuthProviderType.Google]: {
    icon: <GoogleIcon />,
  },

  [OAuthProviderType.GitHub]: {
    icon: <GithubIcon />,
  },

  [OAuthProviderType.OIDC]: {
    icon: <LockIcon />,
  },

  [OAuthProviderType.Apple]: {
    icon: <AppleIcon />,
  },
};

export function OAuth({ redirectUrl }: { redirectUrl?: string }) {
  const serverService = useService(ServerService);
  const urlService = useService(UrlService);
  const oauthProviders = useLiveData(
    serverService.server.config$.map(r => r?.oauthProviders)
  );
  const auth = useService(AuthService);

  const availableProviders = useMemo(() => {
    if (oauthProviders && oauthProviders.length > 0) {
      return oauthProviders;
    }
    return [OAuthProviderType.Google, OAuthProviderType.GitHub];
  }, [oauthProviders]);

  const onContinue = useAsyncCallback(
    async (provider: OAuthProviderType) => {
      track.$.$.auth.signIn({ method: 'oauth', provider });

      const open: () => Promise<void> | void = BUILD_CONFIG.isNative
        ? async () => {
            try {
              const scheme = urlService.getClientScheme();
              const options = await auth.oauthPreflight(
                provider,
                scheme ?? 'web'
              );
              urlService.openPopupWindow(options.url);
            } catch (e) {
              notify.error(UserFriendlyError.fromAny(e));
            }
          }
        : async () => {
            try {
              // Preflight check
              const res = await auth.oauthPreflight(
                provider,
                'web',
                redirectUrl
              );
              if (res?.url) {
                location.href = res.url;
              } else {
                const params = new URLSearchParams();
                params.set('provider', provider);
                if (redirectUrl) {
                  params.set('redirect_uri', redirectUrl);
                }
                params.set('flow', 'redirect');

                const oauthUrl =
                  serverService.server.baseUrl +
                  `/oauth/login?${params.toString()}`;

                urlService.openExternal(oauthUrl);
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
                  title: `${provider} Sign-In`,
                  message: `To enable ${provider} sign-in, set your ${provider} OAuth Client ID and Secret in your .env file and restart the server.`,
                });
              } else {
                notify.error(UserFriendlyError.fromAny(e));
              }
            }
          };

      const ret = open();

      if (ret instanceof Promise) {
        await ret;
      }
    },
    [urlService, redirectUrl, serverService, auth]
  );

  if (!availableProviders || availableProviders.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
      {availableProviders.map(provider => {
        return (
          <OAuthProvider
            key={provider}
            provider={provider}
            onContinue={onContinue}
          />
        );
      })}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '12px 0 16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--affine-border-color, #e3e2e4)',
          }}
        />
        <span
          style={{
            color: 'var(--affine-text-secondary-color, #8e8d91)',
            fontSize: '12px',
          }}
        >
          or
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--affine-border-color, #e3e2e4)',
          }}
        />
      </div>
    </div>
  );
}

interface OauthProviderProps {
  provider: OAuthProviderType;
  onContinue: (provider: OAuthProviderType) => void;
}

function OAuthProvider({ onContinue, provider }: OauthProviderProps) {
  const { icon } =
    provider in OAuthProviderMap
      ? OAuthProviderMap[provider]
      : { icon: undefined };

  const onClick = useCallback(() => {
    onContinue(provider);
  }, [onContinue, provider]);

  return (
    <Button
      variant="secondary"
      block
      size="extraLarge"
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 500,
      }}
      prefix={icon}
      onClick={onClick}
    >
      Continue with {provider}
    </Button>
  );
}
