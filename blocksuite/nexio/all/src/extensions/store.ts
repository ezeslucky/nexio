import { AttachmentStoreExtension } from '@blocksuite/nexio-block-attachment/store';
import { BookmarkStoreExtension } from '@blocksuite/nexio-block-bookmark/store';
import { CalloutStoreExtension } from '@blocksuite/nexio-block-callout/store';
import { CodeStoreExtension } from '@blocksuite/nexio-block-code/store';
import { DataViewStoreExtension } from '@blocksuite/nexio-block-data-view/store';
import { DatabaseStoreExtension } from '@blocksuite/nexio-block-database/store';
import { DividerStoreExtension } from '@blocksuite/nexio-block-divider/store';
import { EdgelessTextStoreExtension } from '@blocksuite/nexio-block-edgeless-text/store';
import { EmbedStoreExtension } from '@blocksuite/nexio-block-embed/store';
import { EmbedDocStoreExtension } from '@blocksuite/nexio-block-embed-doc/store';
import { FrameStoreExtension } from '@blocksuite/nexio-block-frame/store';
import { ImageStoreExtension } from '@blocksuite/nexio-block-image/store';
import { LatexStoreExtension } from '@blocksuite/nexio-block-latex/store';
import { ListStoreExtension } from '@blocksuite/nexio-block-list/store';
import { NoteStoreExtension } from '@blocksuite/nexio-block-note/store';
import { ParagraphStoreExtension } from '@blocksuite/nexio-block-paragraph/store';
import { RootStoreExtension } from '@blocksuite/nexio-block-root/store';
import { SurfaceStoreExtension } from '@blocksuite/nexio-block-surface/store';
import { SurfaceRefStoreExtension } from '@blocksuite/nexio-block-surface-ref/store';
import { TableStoreExtension } from '@blocksuite/nexio-block-table/store';
import { FoundationStoreExtension } from '@blocksuite/nexio-foundation/store';
import { BrushStoreExtension } from '@blocksuite/nexio-gfx-brush/store';
import { ConnectorStoreExtension } from '@blocksuite/nexio-gfx-connector/store';
import { GroupStoreExtension } from '@blocksuite/nexio-gfx-group/store';
import { MindmapStoreExtension } from '@blocksuite/nexio-gfx-mindmap/store';
import { ShapeStoreExtension } from '@blocksuite/nexio-gfx-shape/store';
import { TextStoreExtension } from '@blocksuite/nexio-gfx-text/store';
import { FootnoteStoreExtension } from '@blocksuite/nexio-inline-footnote/store';
import { LatexStoreExtension as InlineLatexStoreExtension } from '@blocksuite/nexio-inline-latex/store';
import { LinkStoreExtension } from '@blocksuite/nexio-inline-link/store';
import { InlinePresetStoreExtension } from '@blocksuite/nexio-inline-preset/store';
import { ReferenceStoreExtension } from '@blocksuite/nexio-inline-reference/store';

export function getInternalStoreExtensions() {
  return [
    FoundationStoreExtension,

    AttachmentStoreExtension,
    BookmarkStoreExtension,
    CalloutStoreExtension,
    CodeStoreExtension,
    DataViewStoreExtension,
    DatabaseStoreExtension,
    DividerStoreExtension,
    EdgelessTextStoreExtension,
    EmbedStoreExtension,
    EmbedDocStoreExtension,
    FrameStoreExtension,
    ImageStoreExtension,
    LatexStoreExtension,
    ListStoreExtension,
    NoteStoreExtension,
    ParagraphStoreExtension,
    SurfaceRefStoreExtension,
    TableStoreExtension,
    SurfaceStoreExtension,
    RootStoreExtension,

    FootnoteStoreExtension,
    LinkStoreExtension,
    ReferenceStoreExtension,
    InlineLatexStoreExtension,
    InlinePresetStoreExtension,

    BrushStoreExtension,
    ShapeStoreExtension,
    MindmapStoreExtension,
    ConnectorStoreExtension,
    GroupStoreExtension,
    TextStoreExtension,
  ];
}
