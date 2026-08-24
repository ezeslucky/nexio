import { AppThemeService } from '@nexio/core/modules/theme';
import { ColorScheme } from '@canvas/nexio/model';
import {
  type ThemeExtension,
  ThemeExtensionIdentifier,
} from '@canvas/nexio/shared/services';
import {
  createSignalFromObservable,
  type Signal,
} from '@canvas/nexio/shared/utils';
import {
  type BlockStdScope,
  LifeCycleWatcher,
  StdIdentifier,
} from '@canvas/nexio/std';
import type { Container } from '@canvas/global/di';
import type { FrameworkProvider } from '@ezeslucky/infra';
import type { Observable } from 'rxjs';

export function getPreviewThemeExtension(framework: FrameworkProvider) {
  class NexioPagePreviewThemeExtension
    extends LifeCycleWatcher
    implements ThemeExtension
  {
    static override readonly key = 'nexio-page-preview-theme';

    readonly theme: Signal<ColorScheme>;

    readonly disposables: (() => void)[] = [];

    static override setup(di: Container) {
      super.setup(di);
      di.override(ThemeExtensionIdentifier, NexioPagePreviewThemeExtension, [
        StdIdentifier,
      ]);
    }

    constructor(std: BlockStdScope) {
      super(std);
      const theme$: Observable<ColorScheme> = framework
        .get(AppThemeService)
        .appTheme.theme$.map(theme => {
          return theme === ColorScheme.Dark
            ? ColorScheme.Dark
            : ColorScheme.Light;
        });
      const { signal, cleanup } = createSignalFromObservable<ColorScheme>(
        theme$,
        ColorScheme.Light
      );
      this.theme = signal;
      this.disposables.push(cleanup);
    }

    getAppTheme() {
      return this.theme;
    }

    getEdgelessTheme() {
      return this.theme;
    }

    override unmounted() {
      this.dispose();
    }

    dispose() {
      this.disposables.forEach(dispose => dispose());
    }
  }

  return NexioPagePreviewThemeExtension;
}
