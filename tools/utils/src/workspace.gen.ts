// Auto generated content
// DO NOT MODIFY THIS FILE MANUALLY
export const PackageList = [
  {
    location: 'canvas/docs',
    name: '@canvas/bs-docs',
    workspaceDependencies: ['canvas/nexio/all'],
  },
  {
    location: 'canvas/framework/global',
    name: '@canvas/global',
    workspaceDependencies: [],
  },
  {
    location: 'canvas/framework/std',
    name: '@canvas/std',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/framework/store',
    name: '@canvas/store',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/framework/sync',
    ],
  },
  {
    location: 'canvas/framework/sync',
    name: '@canvas/sync',
    workspaceDependencies: ['canvas/framework/global'],
  },
  {
    location: 'canvas/integration-test',
    name: '@canvas/integration-test',
    workspaceDependencies: ['canvas/nexio/all'],
  },
  {
    location: 'canvas/nexio/all',
    name: '@canvas/nexio',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/blocks/attachment',
      'canvas/nexio/blocks/bookmark',
      'canvas/nexio/blocks/callout',
      'canvas/nexio/blocks/code',
      'canvas/nexio/blocks/data-view',
      'canvas/nexio/blocks/database',
      'canvas/nexio/blocks/divider',
      'canvas/nexio/blocks/edgeless-text',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/embed-doc',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/image',
      'canvas/nexio/blocks/latex',
      'canvas/nexio/blocks/list',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/paragraph',
      'canvas/nexio/blocks/root',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/blocks/surface-ref',
      'canvas/nexio/blocks/table',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/foundation',
      'canvas/nexio/fragments/adapter-panel',
      'canvas/nexio/fragments/doc-title',
      'canvas/nexio/fragments/frame-panel',
      'canvas/nexio/fragments/outline',
      'canvas/nexio/gfx/brush',
      'canvas/nexio/gfx/connector',
      'canvas/nexio/gfx/group',
      'canvas/nexio/gfx/link',
      'canvas/nexio/gfx/mindmap',
      'canvas/nexio/gfx/note',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/gfx/shape',
      'canvas/nexio/gfx/template',
      'canvas/nexio/gfx/text',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/inlines/comment',
      'canvas/nexio/inlines/footnote',
      'canvas/nexio/inlines/latex',
      'canvas/nexio/inlines/link',
      'canvas/nexio/inlines/mention',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/drag-handle',
      'canvas/nexio/widgets/edgeless-auto-connect',
      'canvas/nexio/widgets/edgeless-dragging-area',
      'canvas/nexio/widgets/edgeless-selected-rect',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/nexio/widgets/edgeless-zoom-toolbar',
      'canvas/nexio/widgets/frame-title',
      'canvas/nexio/widgets/keyboard-toolbar',
      'canvas/nexio/widgets/linked-doc',
      'canvas/nexio/widgets/note-slicer',
      'canvas/nexio/widgets/page-dragging-area',
      'canvas/nexio/widgets/remote-selection',
      'canvas/nexio/widgets/scroll-anchoring',
      'canvas/nexio/widgets/slash-menu',
      'canvas/nexio/widgets/toolbar',
      'canvas/nexio/widgets/viewport-overlay',
      'canvas/framework/std',
      'canvas/framework/store',
      'canvas/framework/sync',
    ],
  },
  {
    location: 'canvas/nexio/blocks/attachment',
    name: '@canvas/nexio-block-attachment',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/bookmark',
    name: '@canvas/nexio-block-bookmark',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/embed-doc',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/callout',
    name: '@canvas/nexio-block-callout',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/code',
    name: '@canvas/nexio-block-code',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/inlines/comment',
      'canvas/nexio/inlines/latex',
      'canvas/nexio/inlines/link',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/data-view',
    name: '@canvas/nexio-block-data-view',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/blocks/database',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/database',
    name: '@canvas/nexio-block-database',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/drag-handle',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/divider',
    name: '@canvas/nexio-block-divider',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/edgeless-text',
    name: '@canvas/nexio-block-edgeless-text',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/text',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/embed',
    name: '@canvas/nexio-block-embed',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/embed-doc',
    name: '@canvas/nexio-block-embed-doc',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/frame',
    name: '@canvas/nexio-block-frame',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/nexio/widgets/frame-title',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/image',
    name: '@canvas/nexio-block-image',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/latex',
    name: '@canvas/nexio-block-latex',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/latex',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/list',
    name: '@canvas/nexio-block-list',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/note',
    name: '@canvas/nexio-block-note',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/fragments/doc-title',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/paragraph',
    name: '@canvas/nexio-block-paragraph',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/turbo-renderer',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/root',
    name: '@canvas/nexio-block-root',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/blocks/attachment',
      'canvas/nexio/blocks/bookmark',
      'canvas/nexio/blocks/database',
      'canvas/nexio/blocks/edgeless-text',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/image',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/paragraph',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/brush',
      'canvas/nexio/gfx/connector',
      'canvas/nexio/gfx/group',
      'canvas/nexio/gfx/mindmap',
      'canvas/nexio/gfx/note',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/gfx/shape',
      'canvas/nexio/gfx/text',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-selected-rect',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/surface',
    name: '@canvas/nexio-block-surface',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/surface-ref',
    name: '@canvas/nexio-block-surface-ref',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/blocks/table',
    name: '@canvas/nexio-block-table',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/slash-menu',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/components',
    name: '@canvas/nexio-components',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
      'canvas/framework/sync',
    ],
  },
  {
    location: 'canvas/nexio/data-view',
    name: '@canvas/data-view',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/ext-loader',
    name: '@canvas/nexio-ext-loader',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/foundation',
    name: '@canvas/nexio-foundation',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/fragments/adapter-panel',
    name: '@canvas/nexio-fragment-adapter-panel',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/fragments/doc-title',
    name: '@canvas/nexio-fragment-doc-title',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/fragments/frame-panel',
    name: '@canvas/nexio-fragment-frame-panel',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/fragments/outline',
    name: '@canvas/nexio-fragment-outline',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/fragments/doc-title',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/brush',
    name: '@canvas/nexio-gfx-brush',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/connector',
    name: '@canvas/nexio-gfx-connector',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/group',
    name: '@canvas/nexio-gfx-group',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/link',
    name: '@canvas/nexio-gfx-link',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/bookmark',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/mindmap',
    name: '@canvas/nexio-gfx-mindmap',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/attachment',
      'canvas/nexio/blocks/edgeless-text',
      'canvas/nexio/blocks/image',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/connector',
      'canvas/nexio/gfx/pointer',
      'canvas/nexio/gfx/shape',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/note',
    name: '@canvas/nexio-gfx-note',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/attachment',
      'canvas/nexio/blocks/bookmark',
      'canvas/nexio/blocks/image',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/pointer',
    name: '@canvas/nexio-gfx-pointer',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/shape',
    name: '@canvas/nexio-gfx-shape',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/template',
    name: '@canvas/nexio-gfx-template',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/text',
    name: '@canvas/nexio-gfx-text',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-toolbar',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/gfx/turbo-renderer',
    name: '@canvas/nexio-gfx-turbo-renderer',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/comment',
    name: '@canvas/nexio-inline-comment',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/footnote',
    name: '@canvas/nexio-inline-footnote',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/latex',
    name: '@canvas/nexio-inline-latex',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/link',
    name: '@canvas/nexio-inline-link',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/mention',
    name: '@canvas/nexio-inline-mention',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/preset',
    name: '@canvas/nexio-inline-preset',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/comment',
      'canvas/nexio/inlines/footnote',
      'canvas/nexio/inlines/latex',
      'canvas/nexio/inlines/link',
      'canvas/nexio/inlines/mention',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/inlines/reference',
    name: '@canvas/nexio-inline-reference',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/model',
    name: '@canvas/nexio-model',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/rich-text',
    name: '@canvas/nexio-rich-text',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/shared',
    name: '@canvas/nexio-shared',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/model',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/drag-handle',
    name: '@canvas/nexio-widget-drag-handle',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/callout',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/list',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/paragraph',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/edgeless-auto-connect',
    name: '@canvas/nexio-widget-edgeless-auto-connect',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/edgeless-dragging-area',
    name: '@canvas/nexio-widget-edgeless-dragging-area',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/edgeless-selected-rect',
    name: '@canvas/nexio-widget-edgeless-selected-rect',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/frame',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/gfx/connector',
      'canvas/nexio/gfx/shape',
      'canvas/nexio/gfx/text',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/edgeless-toolbar',
    name: '@canvas/nexio-widget-edgeless-toolbar',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/edgeless-zoom-toolbar',
    name: '@canvas/nexio-widget-edgeless-zoom-toolbar',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/frame-title',
    name: '@canvas/nexio-widget-frame-title',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/keyboard-toolbar',
    name: '@canvas/nexio-widget-keyboard-toolbar',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/framework/global',
      'canvas/nexio/blocks/attachment',
      'canvas/nexio/blocks/database',
      'canvas/nexio/blocks/embed',
      'canvas/nexio/blocks/image',
      'canvas/nexio/blocks/latex',
      'canvas/nexio/blocks/list',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/paragraph',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/blocks/surface-ref',
      'canvas/nexio/blocks/table',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/fragments/doc-title',
      'canvas/nexio/inlines/latex',
      'canvas/nexio/inlines/link',
      'canvas/nexio/inlines/preset',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/linked-doc',
    name: '@canvas/nexio-widget-linked-doc',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/image',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/inlines/reference',
      'canvas/nexio/model',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/note-slicer',
    name: '@canvas/nexio-widget-note-slicer',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/note',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/nexio/widgets/edgeless-selected-rect',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/page-dragging-area',
    name: '@canvas/nexio-widget-page-dragging-area',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/remote-selection',
    name: '@canvas/nexio-widget-remote-selection',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/scroll-anchoring',
    name: '@canvas/nexio-widget-scroll-anchoring',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/slash-menu',
    name: '@canvas/nexio-widget-slash-menu',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/rich-text',
      'canvas/nexio/shared',
      'canvas/framework/std',
      'canvas/framework/store',
    ],
  },
  {
    location: 'canvas/nexio/widgets/toolbar',
    name: '@canvas/nexio-widget-toolbar',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/blocks/database',
      'canvas/nexio/blocks/surface',
      'canvas/nexio/blocks/table',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/nexio/widgets/viewport-overlay',
    name: '@canvas/nexio-widget-viewport-overlay',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/components',
      'canvas/nexio/ext-loader',
      'canvas/nexio/model',
      'canvas/nexio/shared',
      'canvas/framework/std',
    ],
  },
  {
    location: 'canvas/playground',
    name: '@canvas/playground',
    workspaceDependencies: [
      'canvas/nexio/data-view',
      'canvas/integration-test',
      'canvas/nexio/all',
      'canvas/nexio/components',
      'canvas/nexio/model',
      'canvas/nexio/shared',
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
      'canvas/nexio/all',
      'packages/common/error',
      'packages/common/graphql',
    ],
  },
  {
    location: 'packages/common/reader',
    name: '@nexio/reader',
    workspaceDependencies: ['canvas/nexio/all'],
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
      'canvas/nexio/all',
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
      'canvas/nexio/all',
      'tools/utils',
    ],
  },
  {
    location: 'packages/frontend/core',
    name: '@nexio/core',
    workspaceDependencies: [
      'canvas/framework/global',
      'canvas/nexio/all',
      'canvas/nexio/blocks/root',
      'canvas/nexio/components',
      'canvas/nexio/shared',
      'canvas/framework/std',
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
      'canvas/nexio/ext-loader',
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
    location: 'tests/canvas',
    name: '@nexio-test/canvas',
    workspaceDependencies: [
      'canvas/integration-test',
      'canvas/nexio/all',
    ],
  },
  {
    location: 'tests/kit',
    name: '@nexio-test/kit',
    workspaceDependencies: [
      'canvas/nexio/all',
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
    workspaceDependencies: ['canvas/nexio/all', 'packages/common/env'],
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
  | '@nexio-test/canvas'
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
