import { AttachmentBlockComponent } from './attachment-block';
import { AttachmentEdgelessBlockComponent } from './attachment-edgeless-block';

export function effects() {
  customElements.define(
    'nexio-edgeless-attachment',
    AttachmentEdgelessBlockComponent
  );
  customElements.define('nexio-attachment', AttachmentBlockComponent);
}
