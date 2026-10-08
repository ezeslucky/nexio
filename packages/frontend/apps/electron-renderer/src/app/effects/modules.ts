import { notify } from '@nexio/component';
import { configureElectronStateStorageImpls } from '@nexio/core/desktop/storage';
import { configureCommonModules } from '@nexio/core/modules';
import { configureAppTabsHeaderModule } from '@nexio/core/modules/app-tabs-header';
import { configureDesktopBackupModule } from '@nexio/core/modules/backup';
import {
  AuthProvider,
  ServerScope,
  ServerService,
  ValidatorProvider,
} from '@nexio/core/modules/cloud';
import {
  configureDesktopApiModule,
  DesktopApiService,
} from '@nexio/core/modules/desktop-api';
import {
  configureSpellCheckSettingModule,
  configureTraySettingModule,
} from '@nexio/core/modules/editor-setting';
import { configureFindInPageModule } from '@nexio/core/modules/find-in-page';
import {
  ClientSchemeProvider,
  PopupWindowProvider,
} from '@nexio/core/modules/url';
import { configureDesktopWorkbenchModule } from '@nexio/core/modules/workbench';
import { configureBrowserWorkspaceFlavours } from '@nexio/core/modules/workspace-engine';
import { Framework } from '@toeverything/infra';

function notifySessionOnlySignIn(sessionOnly?: boolean) {
  if (!sessionOnly) return;

  notify.warning({
    title: 'Sign-in is only valid for this session',
    message:
      'Encrypted storage is unavailable, so you will need to sign in again after restarting AFFiNE.',
  });
}

export function setupModules() {
  const framework = new Framework();
  configureCommonModules(framework);
  configureElectronStateStorageImpls(framework);
  configureBrowserWorkspaceFlavours(framework);
  configureDesktopWorkbenchModule(framework);
  configureAppTabsHeaderModule(framework);
  configureFindInPageModule(framework);
  configureDesktopApiModule(framework);
  configureSpellCheckSettingModule(framework);
  configureTraySettingModule(framework);
  configureDesktopBackupModule(framework);

  framework.impl(PopupWindowProvider, p => {
    const apis = p.get(DesktopApiService).api;
    return {
      open: (url: string) => {
        apis.handler.ui.openExternal(url).catch(e => {
          console.error('Failed to open external URL', e);
        });
      },
    };
  });
  framework.impl(ClientSchemeProvider, p => {
    const appInfo = p.get(DesktopApiService).appInfo;
    return {
      getClientScheme() {
        return appInfo?.scheme;
      },
    };
  });
  framework.impl(ValidatorProvider, p => {
    const apis = p.get(DesktopApiService).api;
    return {
      async validate(_challenge, resource) {
        const token = await apis.handler.ui.getChallengeResponse(resource);
        if (!token) {
          throw new Error('Challenge failed');
        }
        return token;
      },
    };
  });
  framework.scope(ServerScope).override(AuthProvider, p => {
    const apis = p.get(DesktopApiService).api;
    const serverService = p.get(ServerService);
    const endpoint = serverService.server.baseUrl;

    return {
      async signInMagicLink(email, token, clientNonce) {
        const result = await apis.handler.auth.signInMagicLink(
          endpoint,
          email,
          token,
          clientNonce
        );
        notifySessionOnlySignIn(result.sessionOnly);
      },
      async signInOauth(code, state, _provider, clientNonce) {
        const result = await apis.handler.auth.signInOauth(
          endpoint,
          code,
          state,
          clientNonce
        );
        notifySessionOnlySignIn(result.sessionOnly);
        return result;
      },
      async signInPassword(credential) {
        const result = await apis.handler.auth.signInPassword(
          endpoint,
          credential
        );
        notifySessionOnlySignIn(result.sessionOnly);
        return result;
      },
      async signInOpenAppSignInCode(code) {
        const result = await apis.handler.auth.signInOpenAppSignInCode(
          endpoint,
          code
        );
        notifySessionOnlySignIn(result.sessionOnly);
      },
      async signOut() {
        await apis.handler.auth.signOut(endpoint);
      },
      async clearSession() {
        await apis.handler.auth.clearSession(endpoint);
      },
    };
  });

  const frameworkProvider = framework.provider();

  return { framework, frameworkProvider };
}
