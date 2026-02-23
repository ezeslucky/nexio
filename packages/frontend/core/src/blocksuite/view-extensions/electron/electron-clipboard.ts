import { DesktopApiService } from '@nexio/core/modules/desktop-api';
import { NativeClipboardExtension } from '@blocksuite/nexio/shared/services';
import type { FrameworkProvider } from '@ezeslucky/infra';

export function patchForClipboardInElectron(framework: FrameworkProvider) {
  const desktopApi = framework.get(DesktopApiService);
  return NativeClipboardExtension({
    copyAsPNG: desktopApi.handler.clipboard.copyAsPNG,
  });
}
