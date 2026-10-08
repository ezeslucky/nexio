export const oauthFlowModes = ['popup', 'redirect'] as const;

export type OAuthFlowMode = (typeof oauthFlowModes)[number];

export function resolveOAuthFlowMode(
  mode?: string | null,
  fallback: OAuthFlowMode = 'redirect'
): OAuthFlowMode {
  return mode === 'popup' || mode === 'redirect' ? mode : fallback;
}

export function attachOAuthFlowToAuthUrl(url: string, flow: OAuthFlowMode) {
  const authUrl = new URL(url);
  const state = authUrl.searchParams.get('state');
  if (!state) return url;

  try {
    const payload = JSON.parse(state) as Record<string, unknown>;
    authUrl.searchParams.set('state', JSON.stringify({ ...payload, flow }));
    return authUrl.toString();
  } catch {
    return url;
  }
}

export function readOAuthFlowModeFromCallbackState(state: string | null) {
  if (!state) return 'popup';

  try {
    const payload = JSON.parse(state) as { flow?: string };
    return resolveOAuthFlowMode(payload.flow, 'popup');
  } catch {
    return 'popup';
  }
}

export function attachOAuthNonceToAuthUrl(url: string, nonce: string) {
  const authUrl = new URL(url);
  const state = authUrl.searchParams.get('state');
  if (!state) return url;

  try {
    const payload = JSON.parse(state) as Record<string, unknown>;
    authUrl.searchParams.set(
      'state',
      JSON.stringify({ ...payload, clientNonce: nonce })
    );
    return authUrl.toString();
  } catch {
    return url;
  }
}

export function parseOAuthCallbackState(state: string) {
  let parsed: {
    client?: string;
    provider?: string;
    state?: string;
    clientNonce?: string;
  } = {};

  try {
    parsed = JSON.parse(state);
  } catch {}

  return {
    client: parsed.client,
    flow: readOAuthFlowModeFromCallbackState(state),
    provider: parsed.provider,
    state: parsed.state,
    ...(parsed.clientNonce ? { clientNonce: parsed.clientNonce } : {}),
  };
}

export function resolveOAuthRedirect(
  redirectUri: string | null | undefined,
  currentOrigin: string
) {
  if (!redirectUri) return '/';
  if (redirectUri.startsWith('/') && !redirectUri.startsWith('//')) {
    return redirectUri;
  }

  let target: URL;
  try {
    target = new URL(redirectUri);
  } catch {
    return '/';
  }

  if (target.origin === currentOrigin) return target.toString();

  // If both target and currentOrigin are loopback origins (e.g. localhost during dev / selfhost),
  // preserve the destination path directly on the current origin to avoid cross-port redirection issues.
  const isLoopback = (host: string) =>
    host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  try {
    const current = new URL(currentOrigin);
    if (isLoopback(target.hostname) && isLoopback(current.hostname)) {
      return new URL(
        target.pathname + target.search + target.hash,
        currentOrigin
      ).toString();
    }
  } catch {}

  const redirectProxy = new URL('/redirect-proxy', currentOrigin);
  redirectProxy.searchParams.set('redirect_uri', target.toString());
  return redirectProxy.toString();
}
