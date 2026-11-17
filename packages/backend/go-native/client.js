/**
 * TypeScript client for the Nexio Native Go engine.
 * Connects directly to the Go micro-daemon over localhost loopback.
 */
const NATIVE_GO_PORT = process.env.NEXIO_NATIVE_PORT || '3015';
const BASE_URL = `http://127.0.0.1:${NATIVE_GO_PORT}`;
export async function checkGoHealth() {
    try {
        const res = await fetch(`${BASE_URL}/health`);
        return res.ok;
    }
    catch {
        return false;
    }
}
export async function mintChallengeResponse(resource, bits = 20) {
    if (!resource)
        return null;
    const res = await fetch(`${BASE_URL}/hashcash/mint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resource, bits }),
    });
    if (!res.ok)
        return null;
    const data = (await res.json());
    return data.stamp;
}
export async function verifyChallengeResponse(response, bits, resource) {
    if (typeof response !== 'string' || !response || !resource)
        return false;
    try {
        const res = await fetch(`${BASE_URL}/hashcash/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response, bits, resource }),
        });
        if (!res.ok)
            return false;
        const data = (await res.json());
        return data.valid;
    }
    catch {
        return false;
    }
}
export async function buildSafeCallbackUrl(input, baseUrl, allowedOrigins, queryPairs) {
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
    const data = (await res.json());
    return data.url;
}
export async function evaluateRedirectUri(input, baseUrl, allowedOrigins, trustedDomains, queryPairs) {
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
    const data = (await res.json());
    return data.url;
}
export async function evaluateLocalRedirect(input, baseUrl, allowedBases) {
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
    const data = (await res.json());
    return data.url;
}
export async function getMime(input) {
    const res = await fetch(`${BASE_URL}/filetype/mime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: input,
    });
    if (!res.ok) {
        return 'application/octet-stream';
    }
    const data = (await res.json());
    return data.mime;
}
export async function safeFetch(req) {
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
export async function validateDocUpdate(update) {
    if (!update || update.length === 0)
        return false;
    try {
        const res = await fetch(`${BASE_URL}/crdt/validate-update`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/octet-stream' },
            body: update,
        });
        if (!res.ok)
            return false;
        const data = (await res.json());
        return data.valid;
    }
    catch {
        return false;
    }
}
export class GoTokenizer {
    constructor(model) {
        this.model = model;
    }
    async count(content, allowedSpecial) {
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
        const data = (await res.json());
        return data.count;
    }
}
export function fromModelName(model) {
    return new GoTokenizer(model);
}
//# sourceMappingURL=client.js.map