// Auto generated content
// DO NOT MODIFY THIS FILE MANUALLY
export const PackageList = [
  {
    location: 'docs/reference',
    name: '@nexio/docs',
    workspaceDependencies: [],
  },
  {
    location: 'editor/docs',
    name: '@blocksuite/bs-docs',
    workspaceDependencies: [],
  },
  {
    location: 'editor/docs-site',
    name: '@blocksuite/docs',
    workspaceDependencies: ['editor/nexio/all'],
  },
  {
    location: 'editor/framework/global',
    name: '@blocksuite/global',
    workspaceDependencies: [],
  },
  {
    location: 'editor/framework/std',
    name: '@blocksuite/std',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/framework/store',
    name: '@blocksuite/store',
    workspaceDependencies: ['editor/framework/global', 'editor/framework/sync'],
  },
  {
    location: 'editor/framework/sync',
    name: '@blocksuite/sync',
    workspaceDependencies: ['editor/framework/global'],
  },
  {
    location: 'editor/integration-test',
    name: '@blocksuite/integration-test',
    workspaceDependencies: ['editor/nexio/all'],
  },
  {
    location: 'editor/nexio/all',
    name: '@blocksuite/nexio',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/blocks/attachment',
      'editor/nexio/blocks/bookmark',
      'editor/nexio/blocks/callout',
      'editor/nexio/blocks/code',
      'editor/nexio/blocks/data-view',
      'editor/nexio/blocks/database',
      'editor/nexio/blocks/divider',
      'editor/nexio/blocks/edgeless-text',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/embed-doc',
      'editor/nexio/blocks/frame',
      'editor/nexio/blocks/image',
      'editor/nexio/blocks/latex',
      'editor/nexio/blocks/list',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/paragraph',
      'editor/nexio/blocks/root',
      'editor/nexio/blocks/surface',
      'editor/nexio/blocks/surface-ref',
      'editor/nexio/blocks/table',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/foundation',
      'editor/nexio/fragments/adapter-panel',
      'editor/nexio/fragments/doc-title',
      'editor/nexio/fragments/frame-panel',
      'editor/nexio/fragments/outline',
      'editor/nexio/gfx/brush',
      'editor/nexio/gfx/connector',
      'editor/nexio/gfx/group',
      'editor/nexio/gfx/link',
      'editor/nexio/gfx/mindmap',
      'editor/nexio/gfx/note',
      'editor/nexio/gfx/pointer',
      'editor/nexio/gfx/shape',
      'editor/nexio/gfx/template',
      'editor/nexio/gfx/text',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/inlines/comment',
      'editor/nexio/inlines/footnote',
      'editor/nexio/inlines/latex',
      'editor/nexio/inlines/link',
      'editor/nexio/inlines/mention',
      'editor/nexio/inlines/preset',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/drag-handle',
      'editor/nexio/widgets/edgeless-auto-connect',
      'editor/nexio/widgets/edgeless-dragging-area',
      'editor/nexio/widgets/edgeless-selected-rect',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/nexio/widgets/edgeless-zoom-toolbar',
      'editor/nexio/widgets/frame-title',
      'editor/nexio/widgets/keyboard-toolbar',
      'editor/nexio/widgets/linked-doc',
      'editor/nexio/widgets/note-slicer',
      'editor/nexio/widgets/page-dragging-area',
      'editor/nexio/widgets/remote-selection',
      'editor/nexio/widgets/scroll-anchoring',
      'editor/nexio/widgets/slash-menu',
      'editor/nexio/widgets/toolbar',
      'editor/nexio/widgets/viewport-overlay',
      'editor/framework/std',
      'editor/framework/store',
      'editor/framework/sync',
    ],
  },
  {
    location: 'editor/nexio/blocks/attachment',
    name: '@blocksuite/nexio-block-attachment',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/bookmark',
    name: '@blocksuite/nexio-block-bookmark',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/embed-doc',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/callout',
    name: '@blocksuite/nexio-block-callout',
    workspaceDependencies: [
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/code',
    name: '@blocksuite/nexio-block-code',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/inlines/comment',
      'editor/nexio/inlines/latex',
      'editor/nexio/inlines/link',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/data-view',
    name: '@blocksuite/nexio-block-data-view',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/blocks/database',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/database',
    name: '@blocksuite/nexio-block-database',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/preset',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/drag-handle',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/divider',
    name: '@blocksuite/nexio-block-divider',
    workspaceDependencies: [
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/edgeless-text',
    name: '@blocksuite/nexio-block-edgeless-text',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/text',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/embed',
    name: '@blocksuite/nexio-block-embed',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/embed-doc',
    name: '@blocksuite/nexio-block-embed-doc',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/frame',
    name: '@blocksuite/nexio-block-frame',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/pointer',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/nexio/widgets/frame-title',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/image',
    name: '@blocksuite/nexio-block-image',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/latex',
    name: '@blocksuite/nexio-block-latex',
    workspaceDependencies: [
      'editor/nexio/blocks/note',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/latex',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/list',
    name: '@blocksuite/nexio-block-list',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/note',
    name: '@blocksuite/nexio-block-note',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/fragments/doc-title',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/paragraph',
    name: '@blocksuite/nexio-block-paragraph',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/turbo-renderer',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/root',
    name: '@blocksuite/nexio-block-root',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/blocks/attachment',
      'editor/nexio/blocks/bookmark',
      'editor/nexio/blocks/database',
      'editor/nexio/blocks/edgeless-text',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/frame',
      'editor/nexio/blocks/image',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/paragraph',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/brush',
      'editor/nexio/gfx/connector',
      'editor/nexio/gfx/group',
      'editor/nexio/gfx/mindmap',
      'editor/nexio/gfx/note',
      'editor/nexio/gfx/pointer',
      'editor/nexio/gfx/shape',
      'editor/nexio/gfx/text',
      'editor/nexio/inlines/latex',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/surface',
    name: '@blocksuite/nexio-block-surface',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/surface-ref',
    name: '@blocksuite/nexio-block-surface-ref',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/frame',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/blocks/table',
    name: '@blocksuite/nexio-block-table',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/slash-menu',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/components',
    name: '@blocksuite/nexio-components',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
      'editor/framework/sync',
    ],
  },
  {
    location: 'editor/nexio/data-view',
    name: '@blocksuite/data-view',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/ext-loader',
    name: '@blocksuite/nexio-ext-loader',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/foundation',
    name: '@blocksuite/nexio-foundation',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/fragments/adapter-panel',
    name: '@blocksuite/nexio-fragment-adapter-panel',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/shared',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/fragments/doc-title',
    name: '@blocksuite/nexio-fragment-doc-title',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/fragments/frame-panel',
    name: '@blocksuite/nexio-fragment-frame-panel',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/frame',
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/fragments/outline',
    name: '@blocksuite/nexio-fragment-outline',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/note',
      'editor/nexio/ext-loader',
      'editor/nexio/fragments/doc-title',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/gfx/brush',
    name: '@blocksuite/nexio-gfx-brush',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/connector',
    name: '@blocksuite/nexio-gfx-connector',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/text',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/gfx/group',
    name: '@blocksuite/nexio-gfx-group',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/text',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/link',
    name: '@blocksuite/nexio-gfx-link',
    workspaceDependencies: [
      'editor/nexio/blocks/bookmark',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/mindmap',
    name: '@blocksuite/nexio-gfx-mindmap',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/attachment',
      'editor/nexio/blocks/image',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/connector',
      'editor/nexio/gfx/pointer',
      'editor/nexio/gfx/shape',
      'editor/nexio/gfx/text',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/gfx/note',
    name: '@blocksuite/nexio-gfx-note',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/attachment',
      'editor/nexio/blocks/bookmark',
      'editor/nexio/blocks/image',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/pointer',
    name: '@blocksuite/nexio-gfx-pointer',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/shape',
    name: '@blocksuite/nexio-gfx-shape',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/text',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/gfx/template',
    name: '@blocksuite/nexio-gfx-template',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/gfx/text',
    name: '@blocksuite/nexio-gfx-text',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-toolbar',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/gfx/turbo-renderer',
    name: '@blocksuite/nexio-gfx-turbo-renderer',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/comment',
    name: '@blocksuite/nexio-inline-comment',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/ext-loader',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/footnote',
    name: '@blocksuite/nexio-inline-footnote',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/latex',
    name: '@blocksuite/nexio-inline-latex',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/link',
    name: '@blocksuite/nexio-inline-link',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/mention',
    name: '@blocksuite/nexio-inline-mention',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/ext-loader',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/preset',
    name: '@blocksuite/nexio-inline-preset',
    workspaceDependencies: [
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/comment',
      'editor/nexio/inlines/footnote',
      'editor/nexio/inlines/latex',
      'editor/nexio/inlines/link',
      'editor/nexio/inlines/mention',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/inlines/reference',
    name: '@blocksuite/nexio-inline-reference',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/model',
    name: '@blocksuite/nexio-model',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/rich-text',
    name: '@blocksuite/nexio-rich-text',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/shared',
    name: '@blocksuite/nexio-shared',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/model',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/widgets/drag-handle',
    name: '@blocksuite/nexio-widget-drag-handle',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/callout',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/list',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/paragraph',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/widgets/edgeless-auto-connect',
    name: '@blocksuite/nexio-widget-edgeless-auto-connect',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/edgeless-dragging-area',
    name: '@blocksuite/nexio-widget-edgeless-dragging-area',
    workspaceDependencies: [
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/edgeless-selected-rect',
    name: '@blocksuite/nexio-widget-edgeless-selected-rect',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/frame',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/gfx/connector',
      'editor/nexio/gfx/shape',
      'editor/nexio/gfx/text',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/edgeless-toolbar',
    name: '@blocksuite/nexio-widget-edgeless-toolbar',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/edgeless-zoom-toolbar',
    name: '@blocksuite/nexio-widget-edgeless-zoom-toolbar',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/frame-title',
    name: '@blocksuite/nexio-widget-frame-title',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/surface',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/keyboard-toolbar',
    name: '@blocksuite/nexio-widget-keyboard-toolbar',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/blocks/attachment',
      'editor/nexio/blocks/database',
      'editor/nexio/blocks/embed',
      'editor/nexio/blocks/image',
      'editor/nexio/blocks/latex',
      'editor/nexio/blocks/list',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/paragraph',
      'editor/nexio/blocks/surface',
      'editor/nexio/blocks/surface-ref',
      'editor/nexio/blocks/table',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/fragments/doc-title',
      'editor/nexio/inlines/latex',
      'editor/nexio/inlines/link',
      'editor/nexio/inlines/preset',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/linked-doc',
    name: '@blocksuite/nexio-widget-linked-doc',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/inlines/reference',
      'editor/nexio/model',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/widgets/note-slicer',
    name: '@blocksuite/nexio-widget-note-slicer',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/note',
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/nexio/widgets/edgeless-selected-rect',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/page-dragging-area',
    name: '@blocksuite/nexio-widget-page-dragging-area',
    workspaceDependencies: [
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/remote-selection',
    name: '@blocksuite/nexio-widget-remote-selection',
    workspaceDependencies: [
      'editor/nexio/blocks/surface',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/scroll-anchoring',
    name: '@blocksuite/nexio-widget-scroll-anchoring',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/slash-menu',
    name: '@blocksuite/nexio-widget-slash-menu',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/rich-text',
      'editor/nexio/shared',
      'editor/framework/std',
      'editor/framework/store',
    ],
  },
  {
    location: 'editor/nexio/widgets/toolbar',
    name: '@blocksuite/nexio-widget-toolbar',
    workspaceDependencies: [
      'editor/framework/global',
      'editor/nexio/blocks/database',
      'editor/nexio/blocks/surface',
      'editor/nexio/blocks/table',
      'editor/nexio/components',
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/nexio/shared',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/nexio/widgets/viewport-overlay',
    name: '@blocksuite/nexio-widget-viewport-overlay',
    workspaceDependencies: [
      'editor/nexio/ext-loader',
      'editor/nexio/model',
      'editor/framework/std',
    ],
  },
  {
    location: 'editor/playground',
    name: '@blocksuite/playground',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/integration-test',
      'editor/nexio/all',
      'editor/nexio/model',
      'editor/nexio/shared',
    ],
  },
  {
    location: 'packages/backend/go-native',
    name: '@nexio/go-native',
    workspaceDependencies: [],
  },
  {
    location: 'packages/backend/native',
    name: '@nexio/server-native',
    workspaceDependencies: [],
  },
  {
    location: 'packages/backend/server',
    name: '@nexio/server',
    workspaceDependencies: [
      'packages/common/s3-compat',
      'packages/backend/native',
      'tools/cli',
      'tools/utils',
      'packages/common/graphql',
      'packages/common/realtime',
    ],
  },
  {
    location: 'packages/common/auth',
    name: '@nexio/auth',
    workspaceDependencies: [],
  },
  {
    location: 'packages/common/debug',
    name: '@nexio/debug',
    workspaceDependencies: [],
  },
  {
    location: 'packages/common/env',
    name: '@nexio/env',
    workspaceDependencies: [],
  },
  {
    location: 'packages/common/error',
    name: '@nexio/error',
    workspaceDependencies: [],
  },
  {
    location: 'packages/common/graphql',
    name: '@nexio/graphql',
    workspaceDependencies: ['packages/common/debug', 'packages/common/error'],
  },
  {
    location: 'packages/common/infra',
    name: '@toeverything/infra',
    workspaceDependencies: [
      'packages/common/debug',
      'packages/common/env',
      'packages/common/error',
      'packages/frontend/templates',
    ],
  },
  {
    location: 'packages/common/nbstore',
    name: '@nexio/nbstore',
    workspaceDependencies: [
      'packages/common/reader',
      'packages/common/realtime',
      'packages/common/infra',
      'editor/nexio/all',
      'packages/common/error',
      'packages/common/graphql',
    ],
  },
  {
    location: 'packages/common/reader',
    name: '@nexio/reader',
    workspaceDependencies: ['editor/nexio/all'],
  },
  {
    location: 'packages/common/realtime',
    name: '@nexio/realtime',
    workspaceDependencies: ['packages/common/graphql'],
  },
  {
    location: 'packages/common/s3-compat',
    name: '@nexio/s3-compat',
    workspaceDependencies: [],
  },
  {
    location: 'packages/frontend/admin',
    name: '@nexio/admin',
    workspaceDependencies: [
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/error',
      'packages/common/graphql',
      'packages/frontend/routes',
    ],
  },
  {
    location: 'packages/frontend/apps/android',
    name: '@nexio/android',
    workspaceDependencies: [
      'editor/nexio/all',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/env',
      'packages/frontend/i18n',
      'packages/frontend/apps/mobile-shared',
      'packages/common/nbstore',
      'packages/frontend/track',
      'packages/common/infra',
    ],
  },
  {
    location: 'packages/frontend/apps/electron',
    name: '@nexio/electron',
    workspaceDependencies: [
      'tools/utils',
      'packages/common/auth',
      'packages/frontend/i18n',
      'packages/frontend/native',
      'packages/common/nbstore',
      'packages/common/infra',
    ],
  },
  {
    location: 'packages/frontend/apps/electron-renderer',
    name: '@nexio/electron-renderer',
    workspaceDependencies: [
      'editor/nexio/all',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/debug',
      'packages/frontend/electron-api',
      'packages/frontend/i18n',
      'packages/common/nbstore',
      'packages/frontend/track',
      'packages/common/infra',
    ],
  },
  {
    location: 'packages/frontend/apps/ios',
    name: '@nexio/ios',
    workspaceDependencies: [
      'editor/nexio/all',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/env',
      'packages/common/graphql',
      'packages/frontend/i18n',
      'packages/frontend/apps/mobile-shared',
      'packages/common/nbstore',
      'packages/frontend/track',
      'packages/common/infra',
      'tools/cli',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/apps/mobile',
    name: '@nexio/mobile',
    workspaceDependencies: [
      'editor/nexio/all',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/env',
      'packages/common/nbstore',
      'packages/frontend/track',
      'packages/common/infra',
    ],
  },
  {
    location: 'packages/frontend/apps/mobile-shared',
    name: '@nexio/mobile-shared',
    workspaceDependencies: ['packages/frontend/core'],
  },
  {
    location: 'packages/frontend/apps/web',
    name: '@nexio/web',
    workspaceDependencies: [
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/env',
      'packages/common/nbstore',
      'packages/frontend/track',
      'packages/common/infra',
    ],
  },
  {
    location: 'packages/frontend/component',
    name: '@nexio/component',
    workspaceDependencies: [
      'packages/common/debug',
      'packages/common/error',
      'packages/common/graphql',
      'packages/frontend/i18n',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/core',
    name: '@nexio/core',
    workspaceDependencies: [
      'editor/nexio/data-view',
      'editor/framework/global',
      'editor/nexio/all',
      'editor/nexio/blocks/root',
      'editor/nexio/components',
      'editor/nexio/shared',
      'editor/framework/std',
      'packages/frontend/component',
      'packages/common/debug',
      'packages/frontend/electron-api',
      'packages/common/env',
      'packages/common/error',
      'packages/common/graphql',
      'packages/frontend/i18n',
      'packages/common/nbstore',
      'packages/common/reader',
      'packages/frontend/templates',
      'packages/frontend/track',
      'packages/common/infra',
      'editor/nexio/ext-loader',
    ],
  },
  {
    location: 'packages/frontend/electron-api',
    name: '@nexio/electron-api',
    workspaceDependencies: ['packages/frontend/apps/electron'],
  },
  {
    location: 'packages/frontend/i18n',
    name: '@nexio/i18n',
    workspaceDependencies: [
      'packages/common/debug',
      'tools/cli',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/native',
    name: '@nexio/native',
    workspaceDependencies: [],
  },
  {
    location: 'packages/frontend/routes',
    name: '@nexio/routes',
    workspaceDependencies: ['tools/cli', 'tools/utils'],
  },
  {
    location: 'packages/frontend/templates',
    name: '@nexio/templates',
    workspaceDependencies: [],
  },
  {
    location: 'packages/frontend/track',
    name: '@nexio/track',
    workspaceDependencies: ['packages/common/debug'],
  },
  {
    location: 'tests/blocksuite',
    name: '@nexio-test/blocksuite',
    workspaceDependencies: [
      'editor/integration-test',
      'editor/nexio/all',
      'tests/kit',
    ],
  },
  {
    location: 'tests/kit',
    name: '@nexio-test/kit',
    workspaceDependencies: [
      'editor/nexio/all',
      'tools/utils',
      'packages/common/infra',
    ],
  },
  {
    location: 'tests/nexio-cloud',
    name: '@nexio-test/nexio-cloud',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tests/nexio-cloud-copilot',
    name: '@nexio-test/nexio-cloud-copilot',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tests/nexio-desktop',
    name: '@nexio-test/nexio-desktop',
    workspaceDependencies: ['tests/kit', 'packages/frontend/electron-api'],
  },
  {
    location: 'tests/nexio-desktop-cloud',
    name: '@nexio-test/nexio-desktop-cloud',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tests/nexio-local',
    name: '@nexio-test/nexio-local',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tests/nexio-mobile',
    name: '@nexio-test/nexio-mobile',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tools/@types/assets',
    name: '@types/assets',
    workspaceDependencies: [],
  },
  {
    location: 'tools/@types/build-config',
    name: '@types/build-config',
    workspaceDependencies: [],
  },
  {
    location: 'tools/@types/env',
    name: '@types/nexio__env',
    workspaceDependencies: ['editor/nexio/all', 'packages/common/env'],
  },
  {
    location: 'tools/changelog',
    name: '@nexio/changelog',
    workspaceDependencies: [],
  },
  {
    location: 'tools/cli',
    name: '@nexio-tools/cli',
    workspaceDependencies: ['tools/utils', 'packages/common/s3-compat'],
  },
  {
    location: 'tools/commitlint',
    name: '@nexio/commitlint-config',
    workspaceDependencies: [],
  },
  {
    location: 'tools/copilot-result',
    name: '@nexio/copilot-result',
    workspaceDependencies: [],
  },
  {
    location: 'tools/doc-diff',
    name: '@nexio/doc-diff',
    workspaceDependencies: ['tools/cli'],
  },
  {
    location: 'tools/playstore-auto-bump',
    name: '@nexio/playstore-auto-bump',
    workspaceDependencies: ['tools/cli', 'tools/utils'],
  },
  {
    location: 'tools/revert-update',
    name: '@nexio/revert-update',
    workspaceDependencies: ['tools/cli'],
  },
  {
    location: 'tools/utils',
    name: '@nexio-tools/utils',
    workspaceDependencies: [],
  },
];

export type PackageName =
  | '@nexio/docs'
  | '@blocksuite/bs-docs'
  | '@blocksuite/docs'
  | '@blocksuite/global'
  | '@blocksuite/std'
  | '@blocksuite/store'
  | '@blocksuite/sync'
  | '@blocksuite/integration-test'
  | '@blocksuite/nexio'
  | '@blocksuite/nexio-block-attachment'
  | '@blocksuite/nexio-block-bookmark'
  | '@blocksuite/nexio-block-callout'
  | '@blocksuite/nexio-block-code'
  | '@blocksuite/nexio-block-data-view'
  | '@blocksuite/nexio-block-database'
  | '@blocksuite/nexio-block-divider'
  | '@blocksuite/nexio-block-edgeless-text'
  | '@blocksuite/nexio-block-embed'
  | '@blocksuite/nexio-block-embed-doc'
  | '@blocksuite/nexio-block-frame'
  | '@blocksuite/nexio-block-image'
  | '@blocksuite/nexio-block-latex'
  | '@blocksuite/nexio-block-list'
  | '@blocksuite/nexio-block-note'
  | '@blocksuite/nexio-block-paragraph'
  | '@blocksuite/nexio-block-root'
  | '@blocksuite/nexio-block-surface'
  | '@blocksuite/nexio-block-surface-ref'
  | '@blocksuite/nexio-block-table'
  | '@blocksuite/nexio-components'
  | '@blocksuite/data-view'
  | '@blocksuite/nexio-ext-loader'
  | '@blocksuite/nexio-foundation'
  | '@blocksuite/nexio-fragment-adapter-panel'
  | '@blocksuite/nexio-fragment-doc-title'
  | '@blocksuite/nexio-fragment-frame-panel'
  | '@blocksuite/nexio-fragment-outline'
  | '@blocksuite/nexio-gfx-brush'
  | '@blocksuite/nexio-gfx-connector'
  | '@blocksuite/nexio-gfx-group'
  | '@blocksuite/nexio-gfx-link'
  | '@blocksuite/nexio-gfx-mindmap'
  | '@blocksuite/nexio-gfx-note'
  | '@blocksuite/nexio-gfx-pointer'
  | '@blocksuite/nexio-gfx-shape'
  | '@blocksuite/nexio-gfx-template'
  | '@blocksuite/nexio-gfx-text'
  | '@blocksuite/nexio-gfx-turbo-renderer'
  | '@blocksuite/nexio-inline-comment'
  | '@blocksuite/nexio-inline-footnote'
  | '@blocksuite/nexio-inline-latex'
  | '@blocksuite/nexio-inline-link'
  | '@blocksuite/nexio-inline-mention'
  | '@blocksuite/nexio-inline-preset'
  | '@blocksuite/nexio-inline-reference'
  | '@blocksuite/nexio-model'
  | '@blocksuite/nexio-rich-text'
  | '@blocksuite/nexio-shared'
  | '@blocksuite/nexio-widget-drag-handle'
  | '@blocksuite/nexio-widget-edgeless-auto-connect'
  | '@blocksuite/nexio-widget-edgeless-dragging-area'
  | '@blocksuite/nexio-widget-edgeless-selected-rect'
  | '@blocksuite/nexio-widget-edgeless-toolbar'
  | '@blocksuite/nexio-widget-edgeless-zoom-toolbar'
  | '@blocksuite/nexio-widget-frame-title'
  | '@blocksuite/nexio-widget-keyboard-toolbar'
  | '@blocksuite/nexio-widget-linked-doc'
  | '@blocksuite/nexio-widget-note-slicer'
  | '@blocksuite/nexio-widget-page-dragging-area'
  | '@blocksuite/nexio-widget-remote-selection'
  | '@blocksuite/nexio-widget-scroll-anchoring'
  | '@blocksuite/nexio-widget-slash-menu'
  | '@blocksuite/nexio-widget-toolbar'
  | '@blocksuite/nexio-widget-viewport-overlay'
  | '@blocksuite/playground'
  | '@nexio/go-native'
  | '@nexio/server-native'
  | '@nexio/server'
  | '@nexio/auth'
  | '@nexio/debug'
  | '@nexio/env'
  | '@nexio/error'
  | '@nexio/graphql'
  | '@toeverything/infra'
  | '@nexio/nbstore'
  | '@nexio/reader'
  | '@nexio/realtime'
  | '@nexio/s3-compat'
  | '@nexio/admin'
  | '@nexio/android'
  | '@nexio/electron'
  | '@nexio/electron-renderer'
  | '@nexio/ios'
  | '@nexio/mobile'
  | '@nexio/mobile-shared'
  | '@nexio/web'
  | '@nexio/component'
  | '@nexio/core'
  | '@nexio/electron-api'
  | '@nexio/i18n'
  | '@nexio/native'
  | '@nexio/routes'
  | '@nexio/templates'
  | '@nexio/track'
  | '@nexio-test/blocksuite'
  | '@nexio-test/kit'
  | '@nexio-test/nexio-cloud'
  | '@nexio-test/nexio-cloud-copilot'
  | '@nexio-test/nexio-desktop'
  | '@nexio-test/nexio-desktop-cloud'
  | '@nexio-test/nexio-local'
  | '@nexio-test/nexio-mobile'
  | '@types/assets'
  | '@types/build-config'
  | '@types/nexio__env'
  | '@nexio/changelog'
  | '@nexio-tools/cli'
  | '@nexio/commitlint-config'
  | '@nexio/copilot-result'
  | '@nexio/doc-diff'
  | '@nexio/playstore-auto-bump'
  | '@nexio/revert-update'
  | '@nexio-tools/utils';
