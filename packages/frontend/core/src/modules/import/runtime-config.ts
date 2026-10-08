import type { NativeImportSessionHandlers } from '@nexio/electron-api';

export type {
  NativeImportBrowserSource,
  NativeImportFormat,
  NativeImportSessionHandlers,
} from '@nexio/electron-api';

let nativeImportSessionHandlers: NativeImportSessionHandlers | null = null;

export function registerNativeImportSessionHandlers(
  handlers: NativeImportSessionHandlers | null
) {
  nativeImportSessionHandlers = handlers;
}

export function getNativeImportSessionHandlers() {
  return nativeImportSessionHandlers;
}
