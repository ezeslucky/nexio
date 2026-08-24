import type { ReferenceInfo } from '@canvas/nexio-model';
import type { OpenDocMode } from '@canvas/nexio-shared/services';
import { createIdentifier } from '@canvas/global/di';
import type { EditorHost } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { Subject } from 'rxjs';

export type DocLinkClickedEvent = ReferenceInfo & {
  // default is active view
  openMode?: OpenDocMode;
  event?: MouseEvent;
  host: EditorHost;
};

export type RefNodeSlots = {
  docLinkClicked: Subject<DocLinkClickedEvent>;
};

export const RefNodeSlotsProvider =
  createIdentifier<RefNodeSlots>('NexioRefNodeSlots');

const slots: RefNodeSlots = {
  docLinkClicked: new Subject(),
};

export const RefNodeSlotsExtension: ExtensionType = {
  setup: di => {
    di.addImpl(RefNodeSlotsProvider, () => slots);
  },
};
