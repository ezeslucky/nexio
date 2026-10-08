import { useService } from '@toeverything/infra';
import { useEffect, useRef } from 'react';
import {
  type LoaderFunction,
  redirect,
  useLoaderData,
  useNavigate,
} from 'react-router-dom';

import { AuthService } from '../../../modules/cloud';
import {
  buildAuthenticationDeepLink,
  buildOpenAppUrlRoute,
} from '../../../modules/open-in-app';
import { supportedClient } from './common';
import {
  type OAuthFlowMode,
  parseOAuthCallbackState,
  resolveOAuthRedirect,
} from './oauth-flow';

interface LoaderData {
  state: string;
  code: string;
  flow: OAuthFlowMode;
  provider: string;
  clientNonce?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const queries = url.searchParams;
  const code = queries.get('code');
  let stateStr = queries.get('state') ?? '{}';

  if (!code || !stateStr) {
    return redirect('/sign-in?error=Invalid oauth callback parameters');
  }

  try {
    const { state, client, flow, provider, clientNonce } =
      parseOAuthCallbackState(stateStr);

    if (!state || !provider) {
      return redirect('/sign-in?error=Invalid oauth callback parameters');
    }

    stateStr = state;

    const payload: LoaderData = {
      state,
      code,
      flow,
      provider,
      clientNonce,
    };

    if (!client || client === 'web') {
      return payload;
    }

    const clientCheckResult = supportedClient.safeParse(client);
    if (!clientCheckResult.success) {
      return redirect('/sign-in?error=Invalid oauth callback parameters');
    }

    const urlToOpen = buildAuthenticationDeepLink({
      scheme: clientCheckResult.data,
      method: 'oauth',
      payload,
      server: location.origin,
    });

    return redirect(buildOpenAppUrlRoute(urlToOpen));
  } catch {
    return redirect('/sign-in?error=Invalid oauth callback parameters');
  }
};

export const Component = () => {
  const auth = useService(AuthService);
  const data = useLoaderData() as LoaderData;

  // loader data from useLoaderData is not reactive, so that we can safely
  // assume the effect below is only triggered once
  const triggeredRef = useRef(false);

  const nav = useNavigate();

  useEffect(() => {
    if (triggeredRef.current) {
      return;
    }
    triggeredRef.current = true;
    auth
      .signInOauth(data.code, data.state, data.provider, data.clientNonce)
      .then(({ redirectUri }) => {
        const destination = resolveOAuthRedirect(redirectUri, location.origin);

        if (
          data.flow === 'popup' &&
          typeof window !== 'undefined' &&
          window.opener &&
          window.opener !== window
        ) {
          try {
            window.close();
          } catch {}
          setTimeout(() => {
            location.replace(destination);
          }, 500);
          return;
        }

        location.replace(destination);
      })
      .catch(e => {
        nav(`/sign-in?error=${encodeURIComponent(e.message)}`);
      });
  }, [data, auth, nav]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: 'var(--affine-text-primary-color, #1e293b)',
        backgroundColor: 'var(--affine-background-primary-color, #ffffff)',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e2e8f0',
          borderTopColor: '#1e96eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: '16px',
        }}
      />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
        Signing in to Nexio...
      </div>
      <div style={{ fontSize: '13px', color: '#64748b' }}>
        Redirecting to your workspace, please wait.
      </div>
    </div>
  );
};
