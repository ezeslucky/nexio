import { NEXIO_LINKED_DOC_WIDGET } from './config.js';
import { ImportDoc } from './import-doc/import-doc.js';
import { Loader } from './import-doc/loader.js';
import { NexioLinkedDocWidget } from './index.js';
import { LinkedDocPopover } from './linked-doc-popover.js';
import { NexioMobileLinkedDocMenu } from './mobile-linked-doc-menu.js';

export function effects() {
  customElements.define('nexio-linked-doc-popover', LinkedDocPopover);
  customElements.define(NEXIO_LINKED_DOC_WIDGET, NexioLinkedDocWidget);
  customElements.define('import-doc', ImportDoc);
  customElements.define(
    'nexio-mobile-linked-doc-menu',
    NexioMobileLinkedDocMenu
  );
  customElements.define('loader-element', Loader);
}
