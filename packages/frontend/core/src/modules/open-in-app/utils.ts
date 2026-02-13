import { channelToScheme } from '@nexio/core/utils';
import { DebugLogger } from '@nexio/debug';

const logger = new DebugLogger('open-in-app');


export const getOpenUrlInDesktopAppLink = (
  url: string,
  newTab = true,
  scheme = channelToScheme[BUILD_CONFIG.appBuildType]
) => {
  try {
    if (!scheme) {
      return null;
    }

    const urlObject = new URL(url, location.origin);
    const params = urlObject.searchParams;

    if (newTab) {
      params.set('new-tab', '1');
    }
    if (environment.isSelfHosted) {
      // assume self-hosted server is the current origin
      params.set('server', location.origin);
    }
    return new URL(
      `${scheme}://${urlObject.host}${urlObject.pathname}?${params.toString()}#${urlObject.hash}`
    ).toString();
  } catch (e) {
    logger.error('Failed to get open url in desktop app link', e);
    return null;
  }
};
