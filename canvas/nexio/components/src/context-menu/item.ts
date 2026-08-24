import { SignalWatcher, WithDisposable } from '@canvas/global/lit';
import { ShadowlessElement } from '@canvas/std';
import { property } from 'lit/decorators.js';

import type { Menu } from './menu.js';

export abstract class MenuItem extends SignalWatcher(
  WithDisposable(ShadowlessElement)
) {
  @property({ attribute: false })
  accessor menu!: Menu;
}
