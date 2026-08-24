// Auto generated content
// DO NOT MODIFY THIS FILE MANUALLY
export const PackageList = [
  {
    location: 'blocksuite/docs',
    name: '@canvas/bs-docs',
    workspaceDependencies: ['blocksuite/nexio/all'],
  },
  {
    location: 'blocksuite/framework/global',
    name: '@canvas/global',
    workspaceDependencies: [],
  },
  {
    location: 'blocksuite/framework/std',
    name: '@canvas/std',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/framework/store',
    name: '@canvas/store',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/sync',
    ],
  },
  {
    location: 'blocksuite/framework/sync',
    name: '@canvas/sync',
    workspaceDependencies: ['blocksuite/framework/global'],
  },
  {
    location: 'blocksuite/integration-test',
    name: '@canvas/integration-test',
    workspaceDependencies: ['blocksuite/nexio/all'],
  },
  {
    location: 'blocksuite/nexio/all',
    name: '@canvas/nexio',
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
    name: '@canvas/nexio-block-attachment',
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
    name: '@canvas/nexio-block-bookmark',
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
    name: '@canvas/nexio-block-callout',
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
    name: '@canvas/nexio-block-code',
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
    name: '@canvas/nexio-block-data-view',
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
    name: '@canvas/nexio-block-database',
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
    name: '@canvas/nexio-block-divider',
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
    name: '@canvas/nexio-block-edgeless-text',
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
    name: '@canvas/nexio-block-embed',
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
    name: '@canvas/nexio-block-embed-doc',
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
    name: '@canvas/nexio-block-frame',
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
    name: '@canvas/nexio-block-image',
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
    name: '@canvas/nexio-block-latex',
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
    name: '@canvas/nexio-block-list',
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
    name: '@canvas/nexio-block-note',
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
    name: '@canvas/nexio-block-paragraph',
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
    name: '@canvas/nexio-block-root',
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
    name: '@canvas/nexio-block-surface',
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
    name: '@canvas/nexio-block-surface-ref',
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
    name: '@canvas/nexio-block-table',
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
    name: '@canvas/nexio-components',
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
    name: '@canvas/data-view',
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
    name: '@canvas/nexio-ext-loader',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/foundation',
    name: '@canvas/nexio-foundation',
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
    name: '@canvas/nexio-fragment-adapter-panel',
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
    name: '@canvas/nexio-fragment-doc-title',
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
    name: '@canvas/nexio-fragment-frame-panel',
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
    name: '@canvas/nexio-fragment-outline',
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
    name: '@canvas/nexio-gfx-brush',
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
    name: '@canvas/nexio-gfx-connector',
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
    name: '@canvas/nexio-gfx-group',
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
    name: '@canvas/nexio-gfx-link',
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
    name: '@canvas/nexio-gfx-mindmap',
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
    name: '@canvas/nexio-gfx-note',
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
    name: '@canvas/nexio-gfx-pointer',
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
    name: '@canvas/nexio-gfx-shape',
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
    name: '@canvas/nexio-gfx-template',
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
    name: '@canvas/nexio-gfx-text',
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
    name: '@canvas/nexio-gfx-turbo-renderer',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/inlines/comment',
    name: '@canvas/nexio-inline-comment',
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
    name: '@canvas/nexio-inline-footnote',
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
    name: '@canvas/nexio-inline-latex',
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
    name: '@canvas/nexio-inline-link',
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
    name: '@canvas/nexio-inline-mention',
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
    name: '@canvas/nexio-inline-preset',
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
    name: '@canvas/nexio-inline-reference',
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
    name: '@canvas/nexio-model',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/rich-text',
    name: '@canvas/nexio-rich-text',
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
    name: '@canvas/nexio-shared',
    workspaceDependencies: [
      'blocksuite/framework/global',
      'blocksuite/nexio/model',
      'blocksuite/framework/std',
      'blocksuite/framework/store',
    ],
  },
  {
    location: 'blocksuite/nexio/widgets/drag-handle',
    name: '@canvas/nexio-widget-drag-handle',
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
    name: '@canvas/nexio-widget-edgeless-auto-connect',
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
    name: '@canvas/nexio-widget-edgeless-dragging-area',
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
    name: '@canvas/nexio-widget-edgeless-selected-rect',
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
    name: '@canvas/nexio-widget-edgeless-toolbar',
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
    name: '@canvas/nexio-widget-edgeless-zoom-toolbar',
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
    name: '@canvas/nexio-widget-frame-title',
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
    name: '@canvas/nexio-widget-keyboard-toolbar',
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
    name: '@canvas/nexio-widget-linked-doc',
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
    name: '@canvas/nexio-widget-note-slicer',
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
    name: '@canvas/nexio-widget-page-dragging-area',
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
    name: '@canvas/nexio-widget-remote-selection',
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
    name: '@canvas/nexio-widget-scroll-anchoring',
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
    name: '@canvas/nexio-widget-slash-menu',
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
    name: '@canvas/nexio-widget-toolbar',
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
    name: '@canvas/nexio-widget-viewport-overlay',
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
    name: '@canvas/playground',
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
  | '@canvas/bs-docs'
  | '@canvas/global'
  | '@canvas/std'
  | '@canvas/store'
  | '@canvas/sync'
  | '@canvas/integration-test'
  | '@canvas/nexio'
  | '@canvas/nexio-block-attachment'
  | '@canvas/nexio-block-bookmark'
  | '@canvas/nexio-block-callout'
  | '@canvas/nexio-block-code'
  | '@canvas/nexio-block-data-view'
  | '@canvas/nexio-block-database'
  | '@canvas/nexio-block-divider'
  | '@canvas/nexio-block-edgeless-text'
  | '@canvas/nexio-block-embed'
  | '@canvas/nexio-block-embed-doc'
  | '@canvas/nexio-block-frame'
  | '@canvas/nexio-block-image'
  | '@canvas/nexio-block-latex'
  | '@canvas/nexio-block-list'
  | '@canvas/nexio-block-note'
  | '@canvas/nexio-block-paragraph'
  | '@canvas/nexio-block-root'
  | '@canvas/nexio-block-surface'
  | '@canvas/nexio-block-surface-ref'
  | '@canvas/nexio-block-table'
  | '@canvas/nexio-components'
  | '@canvas/data-view'
  | '@canvas/nexio-ext-loader'
  | '@canvas/nexio-foundation'
  | '@canvas/nexio-fragment-adapter-panel'
  | '@canvas/nexio-fragment-doc-title'
  | '@canvas/nexio-fragment-frame-panel'
  | '@canvas/nexio-fragment-outline'
  | '@canvas/nexio-gfx-brush'
  | '@canvas/nexio-gfx-connector'
  | '@canvas/nexio-gfx-group'
  | '@canvas/nexio-gfx-link'
  | '@canvas/nexio-gfx-mindmap'
  | '@canvas/nexio-gfx-note'
  | '@canvas/nexio-gfx-pointer'
  | '@canvas/nexio-gfx-shape'
  | '@canvas/nexio-gfx-template'
  | '@canvas/nexio-gfx-text'
  | '@canvas/nexio-gfx-turbo-renderer'
  | '@canvas/nexio-inline-comment'
  | '@canvas/nexio-inline-footnote'
  | '@canvas/nexio-inline-latex'
  | '@canvas/nexio-inline-link'
  | '@canvas/nexio-inline-mention'
  | '@canvas/nexio-inline-preset'
  | '@canvas/nexio-inline-reference'
  | '@canvas/nexio-model'
  | '@canvas/nexio-rich-text'
  | '@canvas/nexio-shared'
  | '@canvas/nexio-widget-drag-handle'
  | '@canvas/nexio-widget-edgeless-auto-connect'
  | '@canvas/nexio-widget-edgeless-dragging-area'
  | '@canvas/nexio-widget-edgeless-selected-rect'
  | '@canvas/nexio-widget-edgeless-toolbar'
  | '@canvas/nexio-widget-edgeless-zoom-toolbar'
  | '@canvas/nexio-widget-frame-title'
  | '@canvas/nexio-widget-keyboard-toolbar'
  | '@canvas/nexio-widget-linked-doc'
  | '@canvas/nexio-widget-note-slicer'
  | '@canvas/nexio-widget-page-dragging-area'
  | '@canvas/nexio-widget-remote-selection'
  | '@canvas/nexio-widget-scroll-anchoring'
  | '@canvas/nexio-widget-slash-menu'
  | '@canvas/nexio-widget-toolbar'
  | '@canvas/nexio-widget-viewport-overlay'
  | '@canvas/playground'
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
