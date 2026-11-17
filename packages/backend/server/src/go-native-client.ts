/**
 * TypeScript client for the Nexio Native Go engine.
 * Connects directly to the Go micro-daemon over localhost loopback.
 */

const NATIVE_GO_PORT = process.env.NEXIO_NATIVE_PORT || '3015';
const BASE_URL = `http://127.0.0.1:${NATIVE_GO_PORT}`;

export async function checkGoHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function mintChallengeResponse(
  resource: string,
  bits: number = 20
): Promise<string | null> {
  if (!resource) return null;
  const res = await fetch(`${BASE_URL}/hashcash/mint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resource, bits }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { stamp: string };
  return data.stamp;
}

export async function verifyChallengeResponse(
  response: any,
  bits: number,
  resource: string
): Promise<boolean> {
  if (typeof response !== 'string' || !response || !resource) return false;
  try {
    const res = await fetch(`${BASE_URL}/hashcash/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response, bits, resource }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid: boolean };
    return data.valid;
  } catch {
    return false;
  }
}

export async function buildSafeCallbackUrl(
  input: string,
  baseUrl: string,
  allowedOrigins: string[],
  queryPairs: Array<{ name: string; value: string }>
): Promise<string> {
  const res = await fetch(`${BASE_URL}/url/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      base_url: baseUrl,
      allowed_origins: allowedOrigins,
      query_pairs: queryPairs,
    }),
  });
  if (!res.ok) {
    throw new Error('URL is not allowed');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function evaluateRedirectUri(
  input: string,
  baseUrl: string,
  allowedOrigins: string[],
  trustedDomains: string[],
  queryPairs: Array<{ name: string; value: string }>
): Promise<string> {
  const res = await fetch(`${BASE_URL}/url/redirect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      base_url: baseUrl,
      allowed_origins: allowedOrigins,
      trusted_domains: trustedDomains,
      query_pairs: queryPairs,
    }),
  });
  if (!res.ok) {
    throw new Error('URL is not allowed');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function evaluateLocalRedirect(
  input: string,
  baseUrl: string,
  allowedBases: string[]
): Promise<string> {
  const res = await fetch(`${BASE_URL}/url/local-redirect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input,
      base_url: baseUrl,
      allowed_bases: allowedBases,
    }),
  });
  if (!res.ok) {
    throw new Error('URL is not allowed');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function getMime(input: Uint8Array | Buffer): Promise<string> {
  const res = await fetch(`${BASE_URL}/filetype/mime`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream' },
    body: input,
  });
  if (!res.ok) {
    return 'application/octet-stream';
  }
  const data = (await res.json()) as { mime: string };
  return data.mime;
}

export async function safeFetch(req: {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: Uint8Array | Buffer;
  timeoutMs?: number;
  maxRedirects?: number;
  maxBytes?: number;
  allowPrivateTargetOrigin?: boolean;
}) {
  const res = await fetch(`${BASE_URL}/safefetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: req.url,
      method: req.method,
      headers: req.headers,
      body: req.body ? Buffer.from(req.body).toString('base64') : undefined,
      timeout_ms: req.timeoutMs,
      max_redirects: req.maxRedirects,
      max_bytes: req.maxBytes,
      allow_private_target_origin: req.allowPrivateTargetOrigin,
    }),
  });
  if (!res.ok) {
    throw new Error(`SafeFetch failed with HTTP ${res.status}`);
  }
  return await res.json();
}

export async function validateDocUpdate(update: Uint8Array | Buffer): Promise<boolean> {
  if (!update || update.length === 0) return false;
  try {
    const res = await fetch(`${BASE_URL}/crdt/validate-update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: update,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { valid: boolean };
    return data.valid;
  } catch {
    return false;
  }
}

export class GoTokenizer {
  constructor(public readonly model: string) {}

  async count(content: string, allowedSpecial?: string[]): Promise<number> {
    const res = await fetch(`${BASE_URL}/tokenizer/count`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        content,
        allowed_special: allowedSpecial,
      }),
    });
    if (!res.ok) {
      throw new Error(`Tokenizer count failed: ${res.statusText}`);
    }
    const data = (await res.json()) as { count: number };
    return data.count;
  }
}

export function fromModelName(model: string): GoTokenizer {
  return new GoTokenizer(model);
}

export async function authorizeReservedDocSubject(
  userId: string,
  workspaceId: string,
  docId: string
): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/reserved-doc/authorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userId,
        workspace_id: workspaceId,
        doc_id: docId,
      }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { allowed: boolean };
    return data.allowed;
  } catch {
    return false;
  }
}

export async function inspectImageForProxy(
  input: Buffer | Uint8Array,
  options?: { maxWidth?: number; maxHeight?: number; maxPixels?: number }
): Promise<{ mimeType: string; width: number; height: number }> {
  const res = await fetch(`${BASE_URL}/image/inspect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_base64: Buffer.from(input).toString('base64'),
      options: {
        maxWidth: options?.maxWidth,
        maxHeight: options?.maxHeight,
        maxPixels: options?.maxPixels,
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`InspectImage failed with HTTP ${res.status}`);
  }
  return (await res.json()) as { mimeType: string; width: number; height: number };
}

export async function signAccessToken(
  userId: string,
  authSessionId: string,
  keyId: string,
  secret: Buffer | Uint8Array,
  issuedAt: number,
  expiresAt: number
): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/sign-access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      auth_session_id: authSessionId,
      key_id: keyId,
      secret_base64: Buffer.from(secret).toString('base64'),
      issued_at: issuedAt,
      expires_at: expiresAt,
    }),
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  const data = (await res.json()) as { token: string };
  return data.token;
}

export async function verifyAccessToken(
  token: string,
  expectedKeyId: string,
  secret: Buffer | Uint8Array,
  now: number
): Promise<{ status: string; userId?: string; authSessionId?: string }> {
  const res = await fetch(`${BASE_URL}/auth/verify-access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      expected_key_id: expectedKeyId,
      secret_base64: Buffer.from(secret).toString('base64'),
      now,
    }),
  });
  if (!res.ok) {
    return { status: 'invalid' };
  }
  return (await res.json()) as { status: string; userId?: string; authSessionId?: string };
}
