import { AttachmentStoreExtension } from '@canvas/nexio-block-attachment/store';
import { BookmarkStoreExtension } from '@canvas/nexio-block-bookmark/store';
import { CalloutStoreExtension } from '@canvas/nexio-block-callout/store';
import { CodeStoreExtension } from '@canvas/nexio-block-code/store';
import { DataViewStoreExtension } from '@canvas/nexio-block-data-view/store';
import { DatabaseStoreExtension } from '@canvas/nexio-block-database/store';
import { DividerStoreExtension } from '@canvas/nexio-block-divider/store';
import { EdgelessTextStoreExtension } from '@canvas/nexio-block-edgeless-text/store';
import { EmbedStoreExtension } from '@canvas/nexio-block-embed/store';
import { EmbedDocStoreExtension } from '@canvas/nexio-block-embed-doc/store';
import { FrameStoreExtension } from '@canvas/nexio-block-frame/store';
import { ImageStoreExtension } from '@canvas/nexio-block-image/store';
import { LatexStoreExtension } from '@canvas/nexio-block-latex/store';
import { ListStoreExtension } from '@canvas/nexio-block-list/store';
import { NoteStoreExtension } from '@canvas/nexio-block-note/store';
import { ParagraphStoreExtension } from '@canvas/nexio-block-paragraph/store';
import { RootStoreExtension } from '@canvas/nexio-block-root/store';
import { SurfaceStoreExtension } from '@canvas/nexio-block-surface/store';
import { SurfaceRefStoreExtension } from '@canvas/nexio-block-surface-ref/store';
import { TableStoreExtension } from '@canvas/nexio-block-table/store';
import { FoundationStoreExtension } from '@canvas/nexio-foundation/store';
import { BrushStoreExtension } from '@canvas/nexio-gfx-brush/store';
import { ConnectorStoreExtension } from '@canvas/nexio-gfx-connector/store';
import { GroupStoreExtension } from '@canvas/nexio-gfx-group/store';
import { MindmapStoreExtension } from '@canvas/nexio-gfx-mindmap/store';
import { ShapeStoreExtension } from '@canvas/nexio-gfx-shape/store';
import { TextStoreExtension } from '@canvas/nexio-gfx-text/store';
import { FootnoteStoreExtension } from '@canvas/nexio-inline-footnote/store';
import { LatexStoreExtension as InlineLatexStoreExtension } from '@canvas/nexio-inline-latex/store';
import { LinkStoreExtension } from '@canvas/nexio-inline-link/store';
import { InlinePresetStoreExtension } from '@canvas/nexio-inline-preset/store';
import { ReferenceStoreExtension } from '@canvas/nexio-inline-reference/store';

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
