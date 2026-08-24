import type { ReactToLit } from '@nexio/component';
import { AttachmentEmbedPreview } from '@nexio/core/blocksuite/attachment-viewer/attachment-embed-preview';
import { AttachmentEmbedConfigIdentifier } from '@canvas/nexio/blocks/attachment';
import { Bound } from '@canvas/nexio/global/gfx';
import {
  EMBED_CARD_HEIGHT,
  EMBED_CARD_WIDTH,
} from '@canvas/nexio/shared/consts';
import type { ExtensionType } from '@canvas/nexio/store';

export function patchForPDFEmbedView(reactToLit: ReactToLit): ExtensionType {
  return {
    setup: di => {
      di.override(AttachmentEmbedConfigIdentifier('pdf'), () => ({
        name: 'pdf',
        shouldShowStatus: true,
        check: (model, maxFileSize) =>
          model.props.type === 'application/pdf' &&
          model.props.size <= maxFileSize,
        action: model => {
          const bound = Bound.deserialize(model.props.xywh);
          bound.w = EMBED_CARD_WIDTH.pdf;
          bound.h = EMBED_CARD_HEIGHT.pdf;
          model.store.updateBlock(model, {
            embed: true,
            style: 'pdf',
            xywh: bound.serialize(),
          });
        },
        render: (model, _) =>
          reactToLit(<AttachmentEmbedPreview model={model} />, true),
      }));
    },
  };
}
