import type { AppAdapter } from 'electron-updater/out/AppAdapter';


export class MockedAppAdapter implements AppAdapter {
  version: string;
  name = 'NEXIO-testing';
  isPackaged = true;
  appUpdateConfigPath = '';
  userDataPath = '';
  baseCachePath = '';

  constructor(version: string) {
    this.version = version;
  }

  whenReady() {
    return Promise.resolve();
  }

  relaunch() {
    return;
  }

  quit() {
    return;
  }

  onQuit(_handler: (exitCode: number) => void) {
    return;
  }
}
