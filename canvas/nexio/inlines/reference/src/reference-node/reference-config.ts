import { type BlockStdScope, ConfigExtensionFactory } from '@canvas/std';
import type { TemplateResult } from 'lit';

import type { NexioReference } from './reference-node';

export interface ReferenceNodeConfig {
  customContent?: (reference: NexioReference) => TemplateResult;
  interactable?: boolean;
  hidePopup?: boolean;
}

export const ReferenceNodeConfigExtension =
  ConfigExtensionFactory<ReferenceNodeConfig>('NexioReferenceNodeConfig');

export class ReferenceNodeConfigProvider {
  private _customContent:
    | ((reference: NexioReference) => TemplateResult)
    | undefined = undefined;

  private _hidePopup = false;

  private _interactable = true;

  get customContent() {
    return this._customContent;
  }

  get doc() {
    return this.std.store;
  }

  get hidePopup() {
    return this._hidePopup;
  }

  get interactable() {
    return this._interactable;
  }

  constructor(readonly std: BlockStdScope) {}

  setCustomContent(content: ReferenceNodeConfigProvider['_customContent']) {
    this._customContent = content;
  }

  setHidePopup(hidePopup: boolean) {
    this._hidePopup = hidePopup;
  }

  setInteractable(interactable: boolean) {
    this._interactable = interactable;
  }
}
