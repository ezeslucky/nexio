import { setupGlobal } from '@nexio/env/global';
import { getBuildConfig } from '@nexio-tools/utils/build-config';
import { Package } from '@nexio-tools/utils/workspace';

globalThis.BUILD_CONFIG = getBuildConfig(new Package('@nexio/web'), {
  mode: 'development',
  channel: 'canary',
});

if (typeof window !== 'undefined') {
  window.location.search = '?prefixUrl=http://127.0.0.1:3010/';
}

setupGlobal();
