import { DesktopApiService } from '@nexio/core/modules/desktop-api';
import {
  CacheStorage,
  GlobalCache,
  GlobalState,
} from '@nexio/core/modules/storage';
import {
  ElectronGlobalCache,
  ElectronGlobalState,
} from '@nexio/core/modules/storage/impls/electron';
import { IDBGlobalState } from '@nexio/core/modules/storage/impls/storage';
import type { Framework } from '@toeverything/infra';

export function configureElectronStateStorageImpls(framework: Framework) {
  framework.impl(GlobalCache, ElectronGlobalCache, [DesktopApiService]);
  framework.impl(GlobalState, ElectronGlobalState, [DesktopApiService]);
  framework.impl(CacheStorage, IDBGlobalState);
}
