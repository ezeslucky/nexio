import path from 'node:path';

import type { App } from 'electron';

import { buildType, isDev } from './config';
import { logger } from './logger';
import { uiSubjects } from './ui';
import {
  addTabWithUrl,
  loadUrlInActiveTab,
  openUrlInHiddenWindow,
  showMainWindow,
} from './windows-manager';

let protocol = buildType === 'stable' ? 'nexio' : `nexio-${buildType}`;
if (isDev) {
  protocol = 'nexio-dev';
}
const fallbackProtocol = buildType === 'stable' ? 'affine' : `affine-${buildType}`;

const authMethods = new Set(['magic-link', 'oauth', 'open-app-signin']);

function summarizeDeepLink(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    const method = url.searchParams.get('method');
    const server = url.searchParams.get('server');
    let serverOrigin: string | undefined;
    try {
      serverOrigin = server ? new URL(server).origin : undefined;
    } catch {
      serverOrigin = undefined;
    }
    return {
      protocol: url.protocol,
      action: url.hostname,
      method: method && authMethods.has(method) ? method : undefined,
      serverOrigin,
    };
  } catch {
    return { valid: false };
  }
}

function isNexioUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith(`${protocol}://`) ||
    url.startsWith(`${fallbackProtocol}://`) ||
    url.startsWith('nexio://') ||
    url.startsWith('affine://')
  );
}

function logDeepLinkFailure(rawUrl: string, error: unknown) {
  logger.error('failed to handle nexio url', summarizeDeepLink(rawUrl), {
    error: error instanceof Error ? error.name : typeof error,
  });
}

export function setupDeepLink(app: App) {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      const scriptArg = [path.resolve(process.argv[1])];
      app.setAsDefaultProtocolClient(protocol, process.execPath, scriptArg);
      app.setAsDefaultProtocolClient(fallbackProtocol, process.execPath, scriptArg);
    }
  } else {
    app.setAsDefaultProtocolClient(protocol);
    app.setAsDefaultProtocolClient(fallbackProtocol);
  }

  app.on('open-url', (event, url) => {
    logger.log('open-url', summarizeDeepLink(url));
    if (isNexioUrl(url)) {
      event.preventDefault();
      app
        .whenReady()
        .then(() => handleNexioUrl(url))
        .catch(e => {
          logDeepLinkFailure(url, e);
        });
    }
  });

  // on windows & linux, we need to listen for the second-instance event
  app.on('second-instance', (event, commandLine) => {
    showMainWindow()
      .then(() => {
        const url = commandLine.pop();
        if (isNexioUrl(url)) {
          event.preventDefault();
          handleNexioUrl(url!).catch(e => {
            logDeepLinkFailure(url!, e);
          });
        }
      })
      .catch(e => console.error('Failed to restore or create window:', e));
  });

  app.on('ready', () => {
    // app may be brought up without having a running instance
    // need to read the url from the command line
    const url = process.argv.at(-1);
    logger.log(
      'url from argv',
      isNexioUrl(url)
        ? summarizeDeepLink(url!)
        : { deepLink: false, argumentCount: process.argv.length }
    );
    if (isNexioUrl(url)) {
      handleNexioUrl(url!).catch(e => {
        logDeepLinkFailure(url!, e);
      });
    }
  });
}

async function handleNexioUrl(url: string) {
  await showMainWindow();

  logger.info('open nexio url', summarizeDeepLink(url));
  const urlObj = new URL(url);

  if (urlObj.hostname === 'authentication') {
    const method = urlObj.searchParams.get('method');
    const payload = JSON.parse(urlObj.searchParams.get('payload') ?? 'false');
    const server = urlObj.searchParams.get('server') || undefined;

    if (
      !method ||
      (method !== 'magic-link' &&
        method !== 'oauth' &&
        method !== 'open-app-signin') ||
      !payload
    ) {
      logger.error('Invalid authentication url', summarizeDeepLink(url));
      return;
    }

    uiSubjects.authenticationRequest$.next({
      method,
      payload,
      server,
    });
  } else if (
    urlObj.searchParams.get('new-tab') &&
    urlObj.pathname.startsWith('/workspace')
  ) {
    // @todo(@forehalo): refactor router utilities
    // basename of /workspace/xxx/yyy is /workspace/xxx
    await addTabWithUrl(url);
  } else {
    const hiddenWindow = urlObj.searchParams.get('hidden')
      ? await openUrlInHiddenWindow(urlObj)
      : await loadUrlInActiveTab(url);

    if (hiddenWindow) {
      // when hidden window closed, the main window will be hidden somehow
      hiddenWindow.on('close', () => {
        void showMainWindow().catch(e => {
          logger.error('Failed to restore main window:', e);
        });
      });
    }
  }
}
