import { AttachmentViewExtension } from '@blocksuite/nexio-block-attachment/view';
import { BookmarkViewExtension } from '@blocksuite/nexio-block-bookmark/view';
import { CalloutViewExtension } from '@blocksuite/nexio-block-callout/view';
import { CodeBlockViewExtension } from '@blocksuite/nexio-block-code/view';
import { DataViewViewExtension } from '@blocksuite/nexio-block-data-view/view';
import { DatabaseViewExtension } from '@blocksuite/nexio-block-database/view';
import { DividerViewExtension } from '@blocksuite/nexio-block-divider/view';
import { EdgelessTextViewExtension } from '@blocksuite/nexio-block-edgeless-text/view';
import { EmbedViewExtension } from '@blocksuite/nexio-block-embed/view';
import { EmbedDocViewExtension } from '@blocksuite/nexio-block-embed-doc/view';
import { FrameViewExtension } from '@blocksuite/nexio-block-frame/view';
import { ImageViewExtension } from '@blocksuite/nexio-block-image/view';
import { LatexViewExtension } from '@blocksuite/nexio-block-latex/view';
import { ListViewExtension } from '@blocksuite/nexio-block-list/view';
import { NoteViewExtension } from '@blocksuite/nexio-block-note/view';
import { ParagraphViewExtension } from '@blocksuite/nexio-block-paragraph/view';
import { RootViewExtension } from '@blocksuite/nexio-block-root/view';
import { SurfaceViewExtension } from '@blocksuite/nexio-block-surface/view';
import { SurfaceRefViewExtension } from '@blocksuite/nexio-block-surface-ref/view';
import { TableViewExtension } from '@blocksuite/nexio-block-table/view';
import { FoundationViewExtension } from '@blocksuite/nexio-foundation/view';
import { AdapterPanelViewExtension } from '@blocksuite/nexio-fragment-adapter-panel/view';
import { DocTitleViewExtension } from '@blocksuite/nexio-fragment-doc-title/view';
import { FramePanelViewExtension } from '@blocksuite/nexio-fragment-frame-panel/view';
import { OutlineViewExtension } from '@blocksuite/nexio-fragment-outline/view';
import { BrushViewExtension } from '@blocksuite/nexio-gfx-brush/view';
import { ConnectorViewExtension } from '@blocksuite/nexio-gfx-connector/view';
import { GroupViewExtension } from '@blocksuite/nexio-gfx-group/view';
import { LinkViewExtension as GfxLinkViewExtension } from '@blocksuite/nexio-gfx-link/view';
import { MindmapViewExtension } from '@blocksuite/nexio-gfx-mindmap/view';
import { NoteViewExtension as GfxNoteViewExtension } from '@blocksuite/nexio-gfx-note/view';
import { PointerViewExtension } from '@blocksuite/nexio-gfx-pointer/view';
import { ShapeViewExtension } from '@blocksuite/nexio-gfx-shape/view';
import { TemplateViewExtension } from '@blocksuite/nexio-gfx-template/view';
import { TextViewExtension } from '@blocksuite/nexio-gfx-text/view';
import { InlineCommentViewExtension } from '@blocksuite/nexio-inline-comment/view';
import { FootnoteViewExtension } from '@blocksuite/nexio-inline-footnote/view';
import { LatexViewExtension as InlineLatexViewExtension } from '@blocksuite/nexio-inline-latex/view';
import { LinkViewExtension } from '@blocksuite/nexio-inline-link/view';
import { MentionViewExtension } from '@blocksuite/nexio-inline-mention/view';
import { InlinePresetViewExtension } from '@blocksuite/nexio-inline-preset/view';
import { ReferenceViewExtension } from '@blocksuite/nexio-inline-reference/view';
import { DragHandleViewExtension } from '@blocksuite/nexio-widget-drag-handle/view';
import { EdgelessAutoConnectViewExtension } from '@blocksuite/nexio-widget-edgeless-auto-connect/view';
import { EdgelessDraggingAreaViewExtension } from '@blocksuite/nexio-widget-edgeless-dragging-area/view';
import { EdgelessSelectedRectViewExtension } from '@blocksuite/nexio-widget-edgeless-selected-rect/view';
import { EdgelessToolbarViewExtension } from '@blocksuite/nexio-widget-edgeless-toolbar/view';
import { EdgelessZoomToolbarViewExtension } from '@blocksuite/nexio-widget-edgeless-zoom-toolbar/view';
import { FrameTitleViewExtension } from '@blocksuite/nexio-widget-frame-title/view';
import { KeyboardToolbarViewExtension } from '@blocksuite/nexio-widget-keyboard-toolbar/view';
import { LinkedDocViewExtension } from '@blocksuite/nexio-widget-linked-doc/view';
import { NoteSlicerViewExtension } from '@blocksuite/nexio-widget-note-slicer/view';
import { PageDraggingAreaViewExtension } from '@blocksuite/nexio-widget-page-dragging-area/view';
import { RemoteSelectionViewExtension } from '@blocksuite/nexio-widget-remote-selection/view';
import { ScrollAnchoringViewExtension } from '@blocksuite/nexio-widget-scroll-anchoring/view';
import { SlashMenuViewExtension } from '@blocksuite/nexio-widget-slash-menu/view';
import { ToolbarViewExtension } from '@blocksuite/nexio-widget-toolbar/view';
import { ViewportOverlayViewExtension } from '@blocksuite/nexio-widget-viewport-overlay/view';

export function getInternalViewExtensions() {
  return [
    FoundationViewExtension,

    // Gfx
    PointerViewExtension,
    GfxNoteViewExtension,
    BrushViewExtension,
    ShapeViewExtension,
    MindmapViewExtension,
    ConnectorViewExtension,
    GroupViewExtension,
    TextViewExtension,
    TemplateViewExtension,
    GfxLinkViewExtension,

    // Block
    AttachmentViewExtension,
    BookmarkViewExtension,
    CalloutViewExtension,
    CodeBlockViewExtension,
    DataViewViewExtension,
    DatabaseViewExtension,
    DividerViewExtension,
    EdgelessTextViewExtension,
    EmbedViewExtension,
    EmbedDocViewExtension,
    FrameViewExtension,
    ImageViewExtension,
    LatexViewExtension,
    ListViewExtension,
    NoteViewExtension,
    ParagraphViewExtension,
    SurfaceRefViewExtension,
    TableViewExtension,
    SurfaceViewExtension,
    RootViewExtension,

    // Inline
    InlineCommentViewExtension,
    FootnoteViewExtension,
    LinkViewExtension,
    ReferenceViewExtension,
    InlineLatexViewExtension,
    MentionViewExtension,
    InlinePresetViewExtension,

    // Widget
    // order will affect the z-index of the widget
    DragHandleViewExtension,
    EdgelessAutoConnectViewExtension,
    FrameTitleViewExtension,
    KeyboardToolbarViewExtension,
    LinkedDocViewExtension,
    RemoteSelectionViewExtension,
    ScrollAnchoringViewExtension,
    SlashMenuViewExtension,
    ToolbarViewExtension,
    ViewportOverlayViewExtension,
    EdgelessZoomToolbarViewExtension,
    PageDraggingAreaViewExtension,
    EdgelessSelectedRectViewExtension,
    EdgelessDraggingAreaViewExtension,
    NoteSlicerViewExtension,
    EdgelessToolbarViewExtension,

    // Fragment
    DocTitleViewExtension,
    FramePanelViewExtension,
    OutlineViewExtension,
    AdapterPanelViewExtension,
  ];
}
