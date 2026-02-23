// Auto generated content
// DO NOT MODIFY THIS FILE MANUALLY
export const PackageList = [
  {
    location: 'blocksuite/docs',
    name: '@blocksuite/bs-docs',
    workspaceDependencies: ['blocksuite/nexio/all'],
  },
  {
    location: 'blocksuite/framework/global',
    name: '@blocksuite/global',
    workspaceDependencies: [],
  },
  {
    location: 'blocksuite/framework/std',
    name: '@blocksuite/std',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/framework/store',
    name: '@blocksuite/store',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/sync',
    ],
  },
  {
    location: 'blocksuite/framework/sync',
    name: '@blocksuite/sync',
    workspaceDependencies: ['blocksuite/framework/global'],
  },
  {
    location: 'blocksuite/integration-test',
    name: '@blocksuite/integration-test',
    workspaceDependencies: ['blocksuite/nexio/all'],
  },
  {
    location: 'blocksuite/nexio/all',
    name: '@blocksuite/nexio',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/attachment',
      'blocksuite/nexio/blocks/bookmark',
      'blocksuite/nexio/blocks/callout',
      'blocksuite/nexio/blocks/code',
      'blocksuite/nexio/blocks/data-view',
      'blocksuite/nexio/blocks/database',
      'blocksuite/nexio/blocks/divider',
      'blocksuite/nexio/blocks/edgeless-text',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/embed-doc',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/blocks/latex',
      'blocksuite/nexio/blocks/list',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/paragraph',
      'blocksuite/nexio/blocks/root',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/blocks/surface-ref',
      'blocksuite/nexio/blocks/table',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/foundation',
      'blocksuite/nexio/fragments/adapter-panel',
      'blocksuite/nexio/fragments/doc-title',
      'blocksuite/nexio/fragments/frame-panel',
      'blocksuite/nexio/fragments/outline',
      'blocksuite/nexio/gfx/brush',
      'blocksuite/nexio/gfx/connector',
      'blocksuite/nexio/gfx/group',
      'blocksuite/nexio/gfx/link',
      'blocksuite/nexio/gfx/mindmap',
      'blocksuite/nexio/gfx/note',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/gfx/shape',
      'blocksuite/nexio/gfx/template',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/inlines/comment',
      'blocksuite/nexio/inlines/footnote',
      'blocksuite/nexio/inlines/latex',
      'blocksuite/nexio/inlines/link',
      'blocksuite/nexio/inlines/mention',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/drag-handle',
      'blocksuite/nexio/widgets/edgeless-auto-connect',
      'blocksuite/nexio/widgets/edgeless-dragging-area',
      'blocksuite/nexio/widgets/edgeless-selected-rect',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/nexio/widgets/edgeless-zoom-toolbar',
      'blocksuite/nexio/widgets/frame-title',
      'blocksuite/nexio/widgets/keyboard-toolbar',
      'blocksuite/nexio/widgets/linked-doc',
      'blocksuite/nexio/widgets/note-slicer',
      'blocksuite/nexio/widgets/page-dragging-area',
      'blocksuite/nexio/widgets/remote-selection',
      'blocksuite/nexio/widgets/scroll-anchoring',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/nexio/widgets/toolbar',
      'blocksuite/nexio/widgets/viewport-overlay',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
      'blocksuite/framework/sync',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/attachment',
    name: '@blocksuite/nexio-block-attachment',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/bookmark',
    name: '@blocksuite/nexio-block-bookmark',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/embed-doc',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/callout',
    name: '@blocksuite/nexio-block-callout',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/code',
    name: '@blocksuite/nexio-block-code',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/inlines/comment',
      'blocksuite/nexio/inlines/latex',
      'blocksuite/nexio/inlines/link',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/data-view',
    name: '@blocksuite/nexio-block-data-view',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/database',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/database',
    name: '@blocksuite/nexio-block-database',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/drag-handle',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/divider',
    name: '@blocksuite/nexio-block-divider',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/edgeless-text',
    name: '@blocksuite/nexio-block-edgeless-text',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/embed',
    name: '@blocksuite/nexio-block-embed',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/embed-doc',
    name: '@blocksuite/nexio-block-embed-doc',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/frame',
    name: '@blocksuite/nexio-block-frame',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/nexio/widgets/frame-title',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/image',
    name: '@blocksuite/nexio-block-image',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/latex',
    name: '@blocksuite/nexio-block-latex',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/latex',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/list',
    name: '@blocksuite/nexio-block-list',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/note',
    name: '@blocksuite/nexio-block-note',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/fragments/doc-title',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/paragraph',
    name: '@blocksuite/nexio-block-paragraph',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/turbo-renderer',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/root',
    name: '@blocksuite/nexio-block-root',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/attachment',
      'blocksuite/nexio/blocks/bookmark',
      'blocksuite/nexio/blocks/database',
      'blocksuite/nexio/blocks/edgeless-text',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/paragraph',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/brush',
      'blocksuite/nexio/gfx/connector',
      'blocksuite/nexio/gfx/group',
      'blocksuite/nexio/gfx/mindmap',
      'blocksuite/nexio/gfx/note',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/gfx/shape',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-selected-rect',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/surface',
    name: '@blocksuite/nexio-block-surface',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/surface-ref',
    name: '@blocksuite/nexio-block-surface-ref',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/blocks/table',
    name: '@blocksuite/nexio-block-table',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/slash-menu',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/components',
    name: '@blocksuite/nexio-components',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
      'blocksuite/framework/sync',
    ],
  },
  {
    location: 'blocksuite/nexio/data-view',
    name: '@blocksuite/data-view',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/ext-loader',
    name: '@blocksuite/nexio-ext-loader',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/foundation',
    name: '@blocksuite/nexio-foundation',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/fragments/adapter-panel',
    name: '@blocksuite/nexio-fragment-adapter-panel',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/fragments/doc-title',
    name: '@blocksuite/nexio-fragment-doc-title',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/fragments/frame-panel',
    name: '@blocksuite/nexio-fragment-frame-panel',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/fragments/outline',
    name: '@blocksuite/nexio-fragment-outline',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/fragments/doc-title',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/brush',
    name: '@blocksuite/nexio-gfx-brush',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/connector',
    name: '@blocksuite/nexio-gfx-connector',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/group',
    name: '@blocksuite/nexio-gfx-group',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/link',
    name: '@blocksuite/nexio-gfx-link',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/bookmark',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/mindmap',
    name: '@blocksuite/nexio-gfx-mindmap',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/attachment',
      'blocksuite/nexio/blocks/edgeless-text',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/connector',
      'blocksuite/nexio/gfx/pointer',
      'blocksuite/nexio/gfx/shape',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/note',
    name: '@blocksuite/nexio-gfx-note',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/attachment',
      'blocksuite/nexio/blocks/bookmark',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/pointer',
    name: '@blocksuite/nexio-gfx-pointer',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/shape',
    name: '@blocksuite/nexio-gfx-shape',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/template',
    name: '@blocksuite/nexio-gfx-template',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/text',
    name: '@blocksuite/nexio-gfx-text',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-toolbar',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/gfx/turbo-renderer',
    name: '@blocksuite/nexio-gfx-turbo-renderer',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/comment',
    name: '@blocksuite/nexio-inline-comment',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/footnote',
    name: '@blocksuite/nexio-inline-footnote',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/latex',
    name: '@blocksuite/nexio-inline-latex',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/link',
    name: '@blocksuite/nexio-inline-link',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/mention',
    name: '@blocksuite/nexio-inline-mention',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/preset',
    name: '@blocksuite/nexio-inline-preset',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/comment',
      'blocksuite/nexio/inlines/footnote',
      'blocksuite/nexio/inlines/latex',
      'blocksuite/nexio/inlines/link',
      'blocksuite/nexio/inlines/mention',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/reference',
    name: '@blocksuite/nexio-inline-reference',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/model',
    name: '@blocksuite/nexio-model',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/rich-text',
    name: '@blocksuite/nexio-rich-text',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/shared',
    name: '@blocksuite/nexio-shared',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/model',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/drag-handle',
    name: '@blocksuite/nexio-widget-drag-handle',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/callout',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/list',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/paragraph',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/edgeless-auto-connect',
    name: '@blocksuite/nexio-widget-edgeless-auto-connect',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/edgeless-dragging-area',
    name: '@blocksuite/nexio-widget-edgeless-dragging-area',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/edgeless-selected-rect',
    name: '@blocksuite/nexio-widget-edgeless-selected-rect',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/frame',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/gfx/connector',
      'blocksuite/nexio/gfx/shape',
      'blocksuite/nexio/gfx/text',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/edgeless-toolbar',
    name: '@blocksuite/nexio-widget-edgeless-toolbar',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/edgeless-zoom-toolbar',
    name: '@blocksuite/nexio-widget-edgeless-zoom-toolbar',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/frame-title',
    name: '@blocksuite/nexio-widget-frame-title',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/keyboard-toolbar',
    name: '@blocksuite/nexio-widget-keyboard-toolbar',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/attachment',
      'blocksuite/nexio/blocks/database',
      'blocksuite/nexio/blocks/embed',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/blocks/latex',
      'blocksuite/nexio/blocks/list',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/paragraph',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/blocks/surface-ref',
      'blocksuite/nexio/blocks/table',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/fragments/doc-title',
      'blocksuite/nexio/inlines/latex',
      'blocksuite/nexio/inlines/link',
      'blocksuite/nexio/inlines/preset',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/linked-doc',
    name: '@blocksuite/nexio-widget-linked-doc',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/image',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/inlines/reference',
      'blocksuite/nexio/model',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/note-slicer',
    name: '@blocksuite/nexio-widget-note-slicer',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/note',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/nexio/widgets/edgeless-selected-rect',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/page-dragging-area',
    name: '@blocksuite/nexio-widget-page-dragging-area',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/remote-selection',
    name: '@blocksuite/nexio-widget-remote-selection',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/scroll-anchoring',
    name: '@blocksuite/nexio-widget-scroll-anchoring',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/slash-menu',
    name: '@blocksuite/nexio-widget-slash-menu',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/rich-text',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/toolbar',
    name: '@blocksuite/nexio-widget-toolbar',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/blocks/database',
      'blocksuite/nexio/blocks/surface',
      'blocksuite/nexio/blocks/table',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/viewport-overlay',
    name: '@blocksuite/nexio-widget-viewport-overlay',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/components',
      'blocksuite/nexio/ext-loader',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
    ],
  },
  {
    location: 'blocksuite/playground',
    name: '@blocksuite/playground',
    workspaceDependencies: [
      'blocksuite/nexio/data-view',
      'blocksuite/integration-test',
      'blocksuite/nexio/all',
      'blocksuite/nexio/components',
      'blocksuite/nexio/model',
      'blocksuite/nexio/shared',
    ],
  },
  {
    location: 'docs/reference',
    name: '@nexio/docs',
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
      'packages/common/reader',
      'packages/backend/native',
      'tools/cli',
      'tools/utils',
      'packages/common/graphql',
    ],
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
    workspaceDependencies: [
      'packages/common/debug',
      'packages/common/env',
      'packages/common/error',
    ],
  },
  {
    location: 'packages/common/infra',
    name: '@ezeslucky/infra',
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
      'packages/common/infra',
      'packages/common/reader',
      'blocksuite/nexio/all',
      'packages/common/error',
      'packages/common/graphql',
    ],
  },
  {
    location: 'packages/common/reader',
    name: '@nexio/reader',
    workspaceDependencies: ['blocksuite/nexio/all'],
  },
  {
    location: 'packages/common/y-octo/node',
    name: '@y-octo/node',
    workspaceDependencies: [],
  },
  {
    location: 'packages/frontend/admin',
    name: '@nexio/admin',
    workspaceDependencies: [
      'packages/common/infra',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/error',
      'packages/common/graphql',
      'packages/frontend/routes',
    ],
  },
  {
    location: 'packages/frontend/apps/electron',
    name: '@nexio/electron',
    workspaceDependencies: [
      'packages/common/infra',
      'tools/utils',
      'packages/frontend/i18n',
      'packages/frontend/native',
      'packages/common/nbstore',
    ],
  },
  {
    location: 'packages/frontend/apps/electron-renderer',
    name: '@nexio/electron-renderer',
    workspaceDependencies: [
      'blocksuite/nexio/all',
      'packages/common/infra',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/debug',
      'packages/frontend/electron-api',
      'packages/frontend/i18n',
      'packages/common/nbstore',
      'packages/frontend/track',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/apps/web',
    name: '@nexio/web',
    workspaceDependencies: [
      'packages/common/infra',
      'packages/frontend/component',
      'packages/frontend/core',
      'packages/common/env',
      'packages/frontend/i18n',
      'packages/common/nbstore',
      'packages/frontend/track',
    ],
  },
  {
    location: 'packages/frontend/component',
    name: '@nexio/component',
    workspaceDependencies: [
      'packages/common/debug',
      'packages/frontend/electron-api',
      'packages/common/error',
      'packages/common/graphql',
      'packages/frontend/i18n',
      'blocksuite/nexio/all',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/core',
    name: '@nexio/core',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/all',
      'blocksuite/nexio/blocks/root',
      'blocksuite/nexio/components',
      'blocksuite/nexio/shared',
      'blocksuite/framework/std',
      'packages/common/infra',
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
      'blocksuite/nexio/ext-loader',
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
    location: 'packages/frontend/media-capture-playground',
    name: '@nexio/media-capture-playground',
    workspaceDependencies: ['packages/frontend/native'],
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
      'blocksuite/integration-test',
      'blocksuite/nexio/all',
    ],
  },
  {
    location: 'tests/kit',
    name: '@nexio-test/kit',
    workspaceDependencies: [
      'blocksuite/nexio/all',
      'packages/common/infra',
      'tools/utils',
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
    workspaceDependencies: ['tests/kit', 'tools/cli', 'tools/utils'],
  },
  {
    location: 'tests/nexio-mobile',
    name: '@nexio-test/nexio-mobile',
    workspaceDependencies: ['tests/kit'],
  },
  {
    location: 'tools/@types/build-config',
    name: '@types/build-config',
    workspaceDependencies: [],
  },
  {
    location: 'tools/@types/env',
    name: '@types/nexio__env',
    workspaceDependencies: ['blocksuite/nexio/all', 'packages/common/env'],
  },
  {
    location: 'tools/changelog',
    name: '@nexio/changelog',
    workspaceDependencies: [],
  },
  {
    location: 'tools/cli',
    name: '@nexio-tools/cli',
    workspaceDependencies: ['tools/utils'],
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
    location: 'tools/playstore-auto-bump',
    name: '@nexio/playstore-auto-bump',
    workspaceDependencies: ['tools/cli', 'tools/utils'],
  },
  {
    location: 'tools/utils',
    name: '@nexio-tools/utils',
    workspaceDependencies: [],
  },
];

export type PackageName =
  | '@blocksuite/bs-docs'
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
  | '@nexio/docs'
  | '@nexio/server-native'
  | '@nexio/server'
  | '@nexio/debug'
  | '@nexio/env'
  | '@nexio/error'
  | '@nexio/graphql'
  | '@ezeslucky/infra'
  | '@nexio/nbstore'
  | '@nexio/reader'
  | '@y-octo/node'
  | '@nexio/admin'
  | '@nexio/electron'
  | '@nexio/electron-renderer'
  | '@nexio/web'
  | '@nexio/component'
  | '@nexio/core'
  | '@nexio/electron-api'
  | '@nexio/i18n'
  | '@nexio/media-capture-playground'
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
  | '@types/build-config'
  | '@types/nexio__env'
  | '@nexio/changelog'
  | '@nexio-tools/cli'
  | '@nexio/commitlint-config'
  | '@nexio/copilot-result'
  | '@nexio/playstore-auto-bump'
  | '@nexio-tools/utils';
