import { Injectable } from '@nestjs/common';

import {
  Config,
  InvalidAuthState,
  InvalidOauthCallbackCode,
  InvalidOauthCallbackState,
  InvalidOauthResponse,
  OauthStateExpired,
  OnEvent,
  SignUpForbidden,
  UnknownOauthProvider,
} from '../../base';
import type {
  NativeLoginResult,
  SessionIssueInput,
} from '../../core/auth/session-issuer';
import { BackendRuntimeProvider } from '../../core/backend-runtime';
import { ServerFeature, ServerService } from '../../core/config';
import { OAuthProviderName } from './config';

type NativeOAuthCallback =
  | {
      type: 'handoff';
      code: string;
      provider: string;
      stateToken: string;
      client: string;
    }
  | ({
      type: 'login';
      redirectUri?: string;
      provider: string;
      client: string;
    } & NativeLoginResult);

@Injectable()
export class OAuthService {
  private activeProviders: OAuthProviderName[];

  constructor(
    private readonly runtime: BackendRuntimeProvider,
    private readonly config: Config,
    private readonly server: ServerService
  ) {
    this.activeProviders = this.configuredProviders().filter(
      provider => provider !== OAuthProviderName.OIDC
    );
    this.syncServerFeature();
  }

  get providers() {
    return this.activeProviders;
  }

  private syncServerFeature() {
    if (this.activeProviders.length > 0) {
      this.server.enableFeature(ServerFeature.OAuth);
    } else {
      this.server.disableFeature(ServerFeature.OAuth);
    }
  }

  @OnEvent('config.init')
  @OnEvent('config.changed')
  async refreshProviders() {
    try {
      const providers = await this.runtime.executeAuthSessionCommandV1<
        OAuthProviderName[]
      >({
        action: 'oauth_providers',
      });
      if (providers && providers.length > 0) {
        this.activeProviders = providers;
      } else {
        this.activeProviders = this.configuredProviders().filter(
          provider => provider !== OAuthProviderName.OIDC
        );
      }
    } catch {
      this.activeProviders = this.configuredProviders().filter(
        provider => provider !== OAuthProviderName.OIDC
      );
    }
    this.syncServerFeature();
  }

  private configuredProviders() {
    return Object.values(OAuthProviderName).filter(name => {
      const provider = this.config.oauth.providers[name];
      const envClientId =
        name === OAuthProviderName.Google
          ? process.env.NEXIO_OAUTH_GOOGLE_CLIENT_ID ||
            process.env.AFFINE_OAUTH_GOOGLE_CLIENT_ID
          : name === OAuthProviderName.GitHub
            ? process.env.NEXIO_OAUTH_GITHUB_CLIENT_ID ||
              process.env.AFFINE_OAUTH_GITHUB_CLIENT_ID
            : undefined;
      const envClientSecret =
        name === OAuthProviderName.Google
          ? process.env.NEXIO_OAUTH_GOOGLE_CLIENT_SECRET ||
            process.env.AFFINE_OAUTH_GOOGLE_CLIENT_SECRET
          : name === OAuthProviderName.GitHub
            ? process.env.NEXIO_OAUTH_GITHUB_CLIENT_SECRET ||
              process.env.AFFINE_OAUTH_GITHUB_CLIENT_SECRET
            : undefined;

      const clientId = provider?.clientId || envClientId;
      const clientSecret = provider?.clientSecret || envClientSecret;

      if (!clientId) return false;
      if (clientSecret) return true;
      if (name !== OAuthProviderName.Apple) return false;
      const args = provider.args as Record<string, string> | undefined;
      return !!(args?.privateKey && args.keyId && args.teamId);
    });
  }

  async preflight(input: {
    provider: OAuthProviderName;
    redirectUri?: string;
    client: string;
    clientNonce: string;
    clientVersion?: string;
    callbackUrl: string;
    redirectBaseUrl: string;
    redirectAllowedOrigins: string[];
    redirectTrustedDomains: string[];
  }) {
    return await this.call<{ url: string }>({
      action: 'oauth_preflight',
      ...input,
    });
  }

  async callback(input: {
    code: string;
    state: string;
    clientNonce?: string;
    issue: SessionIssueInput;
  }) {
    return await this.call<NativeOAuthCallback>({
      action: 'oauth_callback',
      ...input,
    });
  }

  private async call<T>(input: Record<string, unknown>) {
    try {
      return await this.runtime.executeAuthSessionCommandV1<T>(input);
    } catch (error) {
      const message = String(error);
      if (message.includes('unknown_oauth_provider')) {
        throw new UnknownOauthProvider({ name: String(input.provider ?? '') });
      }
      if (message.includes('invalid_oauth_callback_state')) {
        throw new InvalidOauthCallbackState();
      }
      if (message.includes('oauth_state_expired')) {
        throw new OauthStateExpired();
      }
      if (message.includes('invalid_auth_state')) {
        throw new InvalidAuthState();
      }
      if (message.includes('sign_up_forbidden')) {
        throw new SignUpForbidden();
      }
      if (message.includes('invalid_oauth_callback_code')) {
        throw new InvalidOauthCallbackCode({ status: 400, body: '' });
      }
      if (message.includes('invalid_oauth_response')) {
        throw new InvalidOauthResponse({ reason: 'Invalid OAuth response.' });
      }
      throw error;
    }
  }
}
