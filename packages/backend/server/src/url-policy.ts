export type UrlQueryPair = {
  name: string;
  value: string;
};

function parseHttpURL(input: string, baseURL: string): URL {
  if (!input) {
    throw new Error('URL is not allowed');
  }
  let resolved: URL;
  try {
    resolved = new URL(input, baseURL);
  } catch {
    throw new Error('URL is not allowed');
  }
  const protocol = resolved.protocol.toLowerCase();
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('URL is not allowed');
  }
  if (resolved.username || resolved.password) {
    throw new Error('URL is not allowed');
  }
  return resolved;
}

function hasAllowedOrigin(targetURL: URL, allowedOrigins: string[]): boolean {
  const targetOrigin = targetURL.origin.toLowerCase();
  for (const origin of allowedOrigins) {
    try {
      const parsed = new URL(origin);
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.origin.toLowerCase() === targetOrigin
      ) {
        return true;
      }
    } catch {
      // skip invalid origin
    }
  }
  return false;
}

function matchesTrustedDomain(targetURL: URL, trustedDomains: string[]): boolean {
  const hostname = targetURL.hostname.toLowerCase().replace(/\.$/, '');
  if (!hostname) return false;
  for (const domain of trustedDomains) {
    const cleanDomain = domain.toLowerCase().replace(/\.$/, '');
    if (!cleanDomain) continue;
    if (hostname === cleanDomain || hostname.endsWith(`.${cleanDomain}`)) {
      return true;
    }
  }
  return false;
}

function pathIsWithin(path: string, basePath: string): boolean {
  if (basePath === '/' || basePath === '' || path === basePath) {
    return true;
  }
  if (path.startsWith(basePath)) {
    const suffix = path.slice(basePath.length);
    return suffix.startsWith('/');
  }
  return false;
}

function applyQueryPairs(targetURL: URL, queryPairs: UrlQueryPair[]): void {
  for (const pair of queryPairs) {
    targetURL.searchParams.set(pair.name, pair.value);
  }
}

export function buildSafeCallbackUrl(
  input: string,
  baseURL: string,
  allowedOrigins: string[],
  queryPairs: UrlQueryPair[] = []
): string {
  const u = parseHttpURL(input, baseURL);
  if (!hasAllowedOrigin(u, allowedOrigins)) {
    throw new Error('URL is not allowed');
  }
  applyQueryPairs(u, queryPairs);
  return u.toString();
}

export function evaluateRedirectUri(
  input: string,
  baseURL: string,
  allowedOrigins: string[],
  trustedDomains: string[],
  queryPairs: UrlQueryPair[] = []
): string {
  const u = parseHttpURL(input, baseURL);
  if (!hasAllowedOrigin(u, allowedOrigins) && !matchesTrustedDomain(u, trustedDomains)) {
    throw new Error('URL is not allowed');
  }
  applyQueryPairs(u, queryPairs);
  return u.toString();
}

export function evaluateLocalRedirect(
  input: string,
  baseURL: string,
  allowedBases: string[]
): string {
  const u = parseHttpURL(input, baseURL);
  const targetOrigin = u.origin.toLowerCase();
  let allowed = false;

  for (const allowedBase of allowedBases) {
    try {
      const base = new URL(allowedBase);
      if (
        (base.protocol === 'http:' || base.protocol === 'https:') &&
        base.origin.toLowerCase() === targetOrigin
      ) {
        const basePath = base.pathname.replace(/\/$/, '');
        if (pathIsWithin(u.pathname, basePath)) {
          allowed = true;
          break;
        }
      }
    } catch {
      // skip invalid base
    }
  }

  if (!allowed) {
    throw new Error('URL is not allowed');
  }
  return u.toString();
}

