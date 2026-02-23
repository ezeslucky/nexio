import { VirtualKeyboardProvider } from '@nexio/core/mobile/modules/virtual-keyboard';
import { globalVars } from '@nexio/core/mobile/styles/variables.css';
import type { Container } from '@blocksuite/nexio/global/di';
import { DisposableGroup } from '@blocksuite/nexio/global/disposable';
import {
  VirtualKeyboardProvider as BSVirtualKeyboardProvider,
  type VirtualKeyboardProviderWithAction,
} from '@blocksuite/nexio/shared/services';
import { LifeCycleWatcher } from '@blocksuite/nexio/std';
import type { ExtensionType } from '@blocksuite/nexio/store';
import { batch, signal } from '@preact/signals-core';
import type { FrameworkProvider } from '@ezeslucky/infra';

export function KeyboardToolbarExtension(
  framework: FrameworkProvider
): ExtensionType {
  const nexioVirtualKeyboardProvider = framework.get(VirtualKeyboardProvider);

  class BSVirtualKeyboardService
    extends LifeCycleWatcher
    implements BSVirtualKeyboardProvider
  {
    static override key = BSVirtualKeyboardProvider.identifierName;

    private readonly _disposables = new DisposableGroup();

    // eslint-disable-next-line rxjs/finnish
    readonly visible$ = signal(false);

    // eslint-disable-next-line rxjs/finnish
    readonly height$ = signal(0);

    // eslint-disable-next-line rxjs/finnish
    readonly staticHeight$ = signal(0);

    // eslint-disable-next-line rxjs/finnish
    readonly appTabSafeArea$ = signal(`calc(${globalVars.appTabSafeArea})`);

    static override setup(di: Container) {
      super.setup(di);
      di.addImpl(BSVirtualKeyboardProvider, provider => {
        return provider.get(this);
      });
    }

    override mounted() {
      this._disposables.add(
        nexioVirtualKeyboardProvider.onChange(({ visible, height }) => {
          batch(() => {
            if (visible && this.staticHeight$.peek() !== height) {
              this.staticHeight$.value = height;
            }
            this.visible$.value = visible;
            this.height$.value = height;
          });
        })
      );
    }

    override unmounted() {
      this._disposables.dispose();
    }
  }

  if ('show' in nexioVirtualKeyboardProvider) {
    const providerWithAction = nexioVirtualKeyboardProvider;

    class BSVirtualKeyboardServiceWithShowAndHide
      extends BSVirtualKeyboardService
      implements VirtualKeyboardProviderWithAction
    {
      show() {
        providerWithAction.show();
      }

      hide() {
        providerWithAction.hide();
      }
    }

    return BSVirtualKeyboardServiceWithShowAndHide;
  }

  return BSVirtualKeyboardService;
}
