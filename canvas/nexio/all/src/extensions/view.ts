import { AttachmentViewExtension } from '@canvas/nexio-block-attachment/view';
import { BookmarkViewExtension } from '@canvas/nexio-block-bookmark/view';
import { CalloutViewExtension } from '@canvas/nexio-block-callout/view';
import { CodeBlockViewExtension } from '@canvas/nexio-block-code/view';
import { DataViewViewExtension } from '@canvas/nexio-block-data-view/view';
import { DatabaseViewExtension } from '@canvas/nexio-block-database/view';
import { DividerViewExtension } from '@canvas/nexio-block-divider/view';
import { EdgelessTextViewExtension } from '@canvas/nexio-block-edgeless-text/view';
import { EmbedViewExtension } from '@canvas/nexio-block-embed/view';
import { EmbedDocViewExtension } from '@canvas/nexio-block-embed-doc/view';
import { FrameViewExtension } from '@canvas/nexio-block-frame/view';
import { ImageViewExtension } from '@canvas/nexio-block-image/view';
import { LatexViewExtension } from '@canvas/nexio-block-latex/view';
import { ListViewExtension } from '@canvas/nexio-block-list/view';
import { NoteViewExtension } from '@canvas/nexio-block-note/view';
import { ParagraphViewExtension } from '@canvas/nexio-block-paragraph/view';
import { RootViewExtension } from '@canvas/nexio-block-root/view';
import { SurfaceViewExtension } from '@canvas/nexio-block-surface/view';
import { SurfaceRefViewExtension } from '@canvas/nexio-block-surface-ref/view';
import { TableViewExtension } from '@canvas/nexio-block-table/view';
import { FoundationViewExtension } from '@canvas/nexio-foundation/view';
import { AdapterPanelViewExtension } from '@canvas/nexio-fragment-adapter-panel/view';
import { DocTitleViewExtension } from '@canvas/nexio-fragment-doc-title/view';
import { FramePanelViewExtension } from '@canvas/nexio-fragment-frame-panel/view';
import { OutlineViewExtension } from '@canvas/nexio-fragment-outline/view';
import { BrushViewExtension } from '@canvas/nexio-gfx-brush/view';
import { ConnectorViewExtension } from '@canvas/nexio-gfx-connector/view';
import { GroupViewExtension } from '@canvas/nexio-gfx-group/view';
import { LinkViewExtension as GfxLinkViewExtension } from '@canvas/nexio-gfx-link/view';
import { MindmapViewExtension } from '@canvas/nexio-gfx-mindmap/view';
import { NoteViewExtension as GfxNoteViewExtension } from '@canvas/nexio-gfx-note/view';
import { PointerViewExtension } from '@canvas/nexio-gfx-pointer/view';
import { ShapeViewExtension } from '@canvas/nexio-gfx-shape/view';
import { TemplateViewExtension } from '@canvas/nexio-gfx-template/view';
import { TextViewExtension } from '@canvas/nexio-gfx-text/view';
import { InlineCommentViewExtension } from '@canvas/nexio-inline-comment/view';
import { FootnoteViewExtension } from '@canvas/nexio-inline-footnote/view';
import { LatexViewExtension as InlineLatexViewExtension } from '@canvas/nexio-inline-latex/view';
import { LinkViewExtension } from '@canvas/nexio-inline-link/view';
import { MentionViewExtension } from '@canvas/nexio-inline-mention/view';
import { InlinePresetViewExtension } from '@canvas/nexio-inline-preset/view';
import { ReferenceViewExtension } from '@canvas/nexio-inline-reference/view';
import { DragHandleViewExtension } from '@canvas/nexio-widget-drag-handle/view';
import { EdgelessAutoConnectViewExtension } from '@canvas/nexio-widget-edgeless-auto-connect/view';
import { EdgelessDraggingAreaViewExtension } from '@canvas/nexio-widget-edgeless-dragging-area/view';
import { EdgelessSelectedRectViewExtension } from '@canvas/nexio-widget-edgeless-selected-rect/view';
import { EdgelessToolbarViewExtension } from '@canvas/nexio-widget-edgeless-toolbar/view';
import { EdgelessZoomToolbarViewExtension } from '@canvas/nexio-widget-edgeless-zoom-toolbar/view';
import { FrameTitleViewExtension } from '@canvas/nexio-widget-frame-title/view';
import { KeyboardToolbarViewExtension } from '@canvas/nexio-widget-keyboard-toolbar/view';
import { LinkedDocViewExtension } from '@canvas/nexio-widget-linked-doc/view';
import { NoteSlicerViewExtension } from '@canvas/nexio-widget-note-slicer/view';
import { PageDraggingAreaViewExtension } from '@canvas/nexio-widget-page-dragging-area/view';
import { RemoteSelectionViewExtension } from '@canvas/nexio-widget-remote-selection/view';
import { ScrollAnchoringViewExtension } from '@canvas/nexio-widget-scroll-anchoring/view';
import { SlashMenuViewExtension } from '@canvas/nexio-widget-slash-menu/view';
import { ToolbarViewExtension } from '@canvas/nexio-widget-toolbar/view';
import { ViewportOverlayViewExtension } from '@canvas/nexio-widget-viewport-overlay/view';

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
