import type { ReferenceInfo } from '@canvas/nexio-model';
import type { OpenDocMode } from '@canvas/nexio-shared/services';
import type { EditorHost } from '@canvas/std';
import type { Subject } from 'rxjs';

export type DocLinkClickedEvent = ReferenceInfo & {
  // default is active view
  openMode?: OpenDocMode;
  event?: MouseEvent;
  host: EditorHost;
};

export type RefNodeSlots = {
  docLinkClicked: Subject<DocLinkClickedEvent>;
};
