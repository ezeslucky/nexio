/**
 * TypeScript client for the Nexio Native Go engine.
 * Connects directly to the Go micro-daemon over localhost loopback.
 */
export declare function checkGoHealth(): Promise<boolean>;
export declare function mintChallengeResponse(resource: string, bits?: number): Promise<string | null>;
export declare function verifyChallengeResponse(response: any, bits: number, resource: string): Promise<boolean>;
export declare function buildSafeCallbackUrl(input: string, baseUrl: string, allowedOrigins: string[], queryPairs: Array<{
    name: string;
    value: string;
}>): Promise<string>;
export declare function evaluateRedirectUri(input: string, baseUrl: string, allowedOrigins: string[], trustedDomains: string[], queryPairs: Array<{
    name: string;
    value: string;
}>): Promise<string>;
export declare function evaluateLocalRedirect(input: string, baseUrl: string, allowedBases: string[]): Promise<string>;
export declare function getMime(input: Uint8Array | Buffer): Promise<string>;
export declare function safeFetch(req: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: Uint8Array | Buffer;
    timeoutMs?: number;
    maxRedirects?: number;
    maxBytes?: number;
    allowPrivateTargetOrigin?: boolean;
}): Promise<unknown>;
export declare function validateDocUpdate(update: Uint8Array | Buffer): Promise<boolean>;
export declare class GoTokenizer {
    readonly model: string;
    constructor(model: string);
    count(content: string, allowedSpecial?: string[]): Promise<number>;
}
export declare function fromModelName(model: string): GoTokenizer;
//# sourceMappingURL=client.d.ts.map