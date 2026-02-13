import { EmbedLinkedDocBlockComponent } from './embed-linked-doc-block';
import { EmbedEdgelessLinkedDocBlockComponent } from './embed-linked-doc-block/embed-edgeless-linked-doc-block';
import { EmbedSyncedDocBlockComponent } from './embed-synced-doc-block';
import { EmbedSyncedDocCard } from './embed-synced-doc-block/components/embed-synced-doc-card';
import { EmbedEdgelessSyncedDocBlockComponent } from './embed-synced-doc-block/embed-edgeless-synced-doc-block';

export function effects() {
  customElements.define('nexio-embed-synced-doc-card', EmbedSyncedDocCard);

  customElements.define(
    'nexio-embed-edgeless-linked-doc-block',
    EmbedEdgelessLinkedDocBlockComponent
  );
  customElements.define(
    'nexio-embed-linked-doc-block',
    EmbedLinkedDocBlockComponent
  );

  customElements.define(
    'nexio-embed-edgeless-synced-doc-block',
    EmbedEdgelessSyncedDocBlockComponent
  );
  customElements.define(
    'nexio-embed-synced-doc-block',
    EmbedSyncedDocBlockComponent
  );
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-embed-synced-doc-card': EmbedSyncedDocCard;
    'nexio-embed-synced-doc-block': EmbedSyncedDocBlockComponent;
    'nexio-embed-edgeless-synced-doc-block': EmbedEdgelessSyncedDocBlockComponent;
    'nexio-embed-linked-doc-block': EmbedLinkedDocBlockComponent;
    'nexio-embed-edgeless-linked-doc-block': EmbedEdgelessLinkedDocBlockComponent;
  }
}
