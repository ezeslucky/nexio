import { addSiblingAttachmentBlocks } from '@canvas/nexio-block-attachment';
import { insertDatabaseBlockCommand } from '@canvas/nexio-block-database';
import { insertEmptyEmbedIframeCommand } from '@canvas/nexio-block-embed';
import { insertImagesCommand } from '@canvas/nexio-block-image';
import { insertLatexBlockCommand } from '@canvas/nexio-block-latex';
import {
  canDedentListCommand,
  canIndentListCommand,
  dedentListCommand,
  indentListCommand,
} from '@canvas/nexio-block-list';
import { updateBlockType } from '@canvas/nexio-block-note';
import {
  canDedentParagraphCommand,
  canIndentParagraphCommand,
  dedentParagraphCommand,
  indentParagraphCommand,
} from '@canvas/nexio-block-paragraph';
import { DefaultTool, getSurfaceBlock } from '@canvas/nexio-block-surface';
import { insertSurfaceRefBlockCommand } from '@canvas/nexio-block-surface-ref';
import { insertTableBlockCommand } from '@canvas/nexio-block-table';
import { toggleEmbedCardCreateModal } from '@canvas/nexio-components/embed-card-modal';
import { toast } from '@canvas/nexio-components/toast';
import { insertInlineLatex } from '@canvas/nexio-inline-latex';
import { toggleLink } from '@canvas/nexio-inline-link';
import {
  formatBlockCommand,
  formatNativeCommand,
  formatTextCommand,
  getTextAttributes,
  toggleBold,
  toggleCode,
  toggleItalic,
  toggleStrike,
  toggleUnderline,
} from '@canvas/nexio-inline-preset';
import type { FrameBlockModel } from '@canvas/nexio-model';
import { insertContent } from '@canvas/nexio-rich-text';
import {
  copySelectedModelsCommand,
  deleteSelectedModelsCommand,
  draftSelectedModelsCommand,
  duplicateSelectedModelsCommand,
  focusBlockEnd,
  getBlockSelectionsCommand,
  getSelectedModelsCommand,
  getTextSelectionCommand,
} from '@canvas/nexio-shared/commands';
import { REFERENCE_NODE } from '@canvas/nexio-shared/consts';
import {
  FeatureFlagService,
  TelemetryProvider,
} from '@canvas/nexio-shared/services';
import type { NexioTextStyleAttributes } from '@canvas/nexio-shared/types';
import {
  createDefaultDoc,
  isInsideBlockByFlavour,
  openSingleFileWith,
  type Signal,
} from '@canvas/nexio-shared/utils';
import type { NexioLinkedDocWidget } from '@canvas/nexio-widget-linked-doc';
import { viewPresets } from '@canvas/data-view/view-presets';
import { assertType } from '@canvas/global/utils';
import {
  AttachmentIcon,
  BoldIcon,
  BulletedListIcon,
  CheckBoxCheckLinearIcon,
  CloseIcon,
  CodeBlockIcon,
  CodeIcon,
  CollapseTabIcon,
  CopyIcon,
  DatabaseKanbanViewIcon,
  DatabaseTableViewIcon,
  DeleteIcon,
  DividerIcon,
  DuplicateIcon,
  EmbedIcon,
  FontIcon,
  FrameIcon,
  GithubIcon,
  GroupIcon,
  ImageIcon,
  ItalicIcon,
  LinkedPageIcon,
  LinkIcon,
  LoomLogoIcon,
  NewPageIcon,
  NowIcon,
  NumberedListIcon,
  PlusIcon,
  QuoteIcon,
  RedoIcon,
  RightTabIcon,
  StrikeThroughIcon,
  TableIcon,
  TeXIcon,
  TextIcon,
  TodayIcon,
  TomorrowIcon,
  UnderLineIcon,
  UndoIcon,
  YesterdayIcon,
  YoutubeDuotoneIcon,
} from '@canvas/icons/lit';
import {
  type BlockComponent,
  type BlockStdScope,
  ConfigExtensionFactory,
} from '@canvas/std';
import { GfxControllerIdentifier } from '@canvas/std/gfx';
import { computed } from '@preact/signals-core';
import { cssVarV2 } from '@toeverything/theme/v2';
import type { TemplateResult } from 'lit';

import {
  FigmaDuotoneIcon,
  HeadingIcon,
  HighLightDuotoneIcon,
  TextBackgroundDuotoneIcon,
  TextColorIcon,
} from './icons.js';
import { formatDate, formatTime } from './utils.js';

export type KeyboardToolbarConfig = {
  items: KeyboardToolbarItem[];
};

export type KeyboardToolbarItem =
  | KeyboardToolbarActionItem
  | KeyboardSubToolbarConfig
  | KeyboardToolPanelConfig;

export type KeyboardIconType =
  | TemplateResult
  | ((ctx: KeyboardToolbarContext) => TemplateResult);

export type KeyboardToolbarActionItem = {
  name: string;
  icon: KeyboardIconType;
  background?: string | ((ctx: KeyboardToolbarContext) => string | undefined);
  /**
   * @default true
   * @description Whether to show the item in the toolbar.
   */
  showWhen?: (ctx: KeyboardToolbarContext) => boolean;
  /**
   * @default false
   * @description Whether to set the item as disabled status.
   */
  disableWhen?: (ctx: KeyboardToolbarContext) => boolean;
  /**
   * @description The action to be executed when the item is clicked.
   */
  action?: (ctx: KeyboardToolbarContext) => void | Promise<void>;
};

export type KeyboardSubToolbarConfig = {
  icon: KeyboardIconType;
  items: KeyboardToolbarItem[];
  /**
   * It will enter this sub-toolbar when the condition is met.
   */
  autoShow?: (ctx: KeyboardToolbarContext) => Signal<boolean>;
};

export type KeyboardToolbarContext = {
  std: BlockStdScope;
  rootComponent: BlockComponent;
  /**
   * Close current tool panel and show virtual keyboard
   */
  closeToolPanel: () => void;
};

export type KeyboardToolPanelConfig = {
  icon: KeyboardIconType;
  activeIcon?: KeyboardIconType;
  activeBackground?: string;
  groups: (KeyboardToolPanelGroup | DynamicKeyboardToolPanelGroup)[];
};

export type KeyboardToolPanelGroup = {
  name: string;
  items: KeyboardToolbarActionItem[];
};

export type DynamicKeyboardToolPanelGroup = (
  ctx: KeyboardToolbarContext
) => KeyboardToolPanelGroup | null;

const textToolActionItems: KeyboardToolbarActionItem[] = [
  {
    name: 'Text',
    icon: TextIcon(),
    showWhen: ({ std }) =>
      std.store.schema.flavourSchemaMap.has('nexio:paragraph'),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:paragraph',
        props: { type: 'text' },
      });
    },
  },
  ...([1, 2, 3, 4, 5, 6] as const).map(i => ({
    name: `Heading ${i}`,
    icon: HeadingIcon(i),
    showWhen: ({ std }: KeyboardToolbarContext) =>
      std.store.schema.flavourSchemaMap.has('nexio:paragraph'),
    action: ({ std }: KeyboardToolbarContext) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:paragraph',
        props: { type: `h${i}` },
      });
    },
  })),
  {
    name: 'CodeBlock',
    showWhen: ({ std }) => std.store.schema.flavourSchemaMap.has('nexio:code'),
    icon: CodeBlockIcon(),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:code',
      });
    },
  },
  {
    name: 'Quote',
    showWhen: ({ std }) =>
      std.store.schema.flavourSchemaMap.has('nexio:paragraph'),
    icon: QuoteIcon(),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:paragraph',
        props: { type: 'quote' },
      });
    },
  },
  {
    name: 'Divider',
    icon: DividerIcon(),
    showWhen: ({ std }) =>
      std.store.schema.flavourSchemaMap.has('nexio:divider'),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:divider',
        props: { type: 'divider' },
      });
    },
  },
  {
    name: 'Inline equation',
    icon: TeXIcon(),
    showWhen: ({ std }) =>
      std.store.schema.flavourSchemaMap.has('nexio:paragraph'),
    action: ({ std }) => {
      std.command
        .chain()
        .pipe(getTextSelectionCommand)
        .pipe(insertInlineLatex)
        .run();
    },
  },
  {
    name: 'Table',
    icon: TableIcon(),
    showWhen: ({ std, rootComponent: { model } }) =>
      std.store.schema.flavourSchemaMap.has('nexio:table') &&
      !isInsideBlockByFlavour(std.store, model, 'nexio:edgeless-text'),
    action: ({ std }) => {
      std.command
        .chain()
        .pipe(getSelectedModelsCommand)
        .pipe(insertTableBlockCommand, {
          place: 'after',
          removeEmptyLine: true,
        })
        .pipe(({ insertedTableBlockId }) => {
          if (insertedTableBlockId) {
            const telemetry = std.getOptional(TelemetryProvider);
            telemetry?.track('BlockCreated', {
              blockType: 'nexio:table',
            });
          }
        })
        .run();
    },
  },
  {
    name: 'Callout',
    icon: FontIcon(),
    showWhen: ({ std, rootComponent: { model } }) => {
      return (
        std.get(FeatureFlagService).getFlag('enable_callout') &&
        !isInsideBlockByFlavour(model.store, model, 'nexio:edgeless-text')
      );
    },
    action: ({ rootComponent: { model }, std }) => {
      const { store } = model;
      const parent = store.getParent(model);
      if (!parent) return;

      const index = parent.children.indexOf(model);
      if (index === -1) return;
      const calloutId = store.addBlock('nexio:callout', {}, parent, index + 1);
      if (!calloutId) return;
      const paragraphId = store.addBlock('nexio:paragraph', {}, calloutId);
      if (!paragraphId) return;
      std.host.updateComplete
        .then(() => {
          const paragraph = std.view.getBlock(paragraphId);
          if (!paragraph) return;
          std.command.exec(focusBlockEnd, {
            focusBlock: paragraph,
          });
        })
        .catch(console.error);
    },
  },
];

const listToolActionItems: KeyboardToolbarActionItem[] = [
  {
    name: 'BulletedList',
    icon: BulletedListIcon(),
    showWhen: ({ std }) => std.store.schema.flavourSchemaMap.has('nexio:list'),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:list',
        props: {
          type: 'bulleted',
        },
      });
    },
  },
  {
    name: 'NumberedList',
    icon: NumberedListIcon(),
    showWhen: ({ std }) => std.store.schema.flavourSchemaMap.has('nexio:list'),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:list',
        props: {
          type: 'numbered',
        },
      });
    },
  },
  {
    name: 'CheckBox',
    icon: CheckBoxCheckLinearIcon(),
    showWhen: ({ std }) => std.store.schema.flavourSchemaMap.has('nexio:list'),
    action: ({ std }) => {
      std.command.exec(updateBlockType, {
        flavour: 'nexio:list',
        props: {
          type: 'todo',
        },
      });
    },
  },
];

const pageToolGroup: KeyboardToolPanelGroup = {
  name: 'Page',
  items: [
    {
      name: 'NewPage',
      icon: NewPageIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:embed-linked-doc'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(({ selectedModels }) => {
            const newDoc = createDefaultDoc(std.store.workspace);
            if (!selectedModels?.length) return;
            insertContent(std, selectedModels[0], REFERENCE_NODE, {
              reference: {
                type: 'LinkedPage',
                pageId: newDoc.id,
              },
            });
          })
          .run();
      },
    },
    {
      name: 'LinkedPage',
      icon: LinkedPageIcon(),
      showWhen: ({ std, rootComponent }) => {
        const linkedDocWidget = std.view.getWidget(
          'nexio-linked-doc-widget',
          rootComponent.model.id
        );
        if (!linkedDocWidget) return false;

        return std.store.schema.flavourSchemaMap.has('nexio:embed-linked-doc');
      },
      action: ({ rootComponent, closeToolPanel }) => {
        const { std } = rootComponent;

        const linkedDocWidget = std.view.getWidget(
          'nexio-linked-doc-widget',
          rootComponent.model.id
        );
        if (!linkedDocWidget) return;
        assertType<NexioLinkedDocWidget>(linkedDocWidget);
        linkedDocWidget.show({
          mode: 'mobile',
          addTriggerKey: true,
        });
        closeToolPanel();
      },
    },
  ],
};

const contentMediaToolGroup: KeyboardToolPanelGroup = {
  name: 'Content & Media',
  items: [
    {
      name: 'Image',
      icon: ImageIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:image'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertImagesCommand, { removeEmptyLine: true })
          .run();
      },
    },
    {
      name: 'Link',
      icon: LinkIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:bookmark'),
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const parentModel = std.store.getParent(model);
        if (!parentModel) return;

        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          std.host,
          'Links',
          'The added link will be displayed as a card view.',
          { mode: 'page', parentModel, index },
          ({ mode }) => {
            if (mode === 'edgeless') {
              const gfx = std.get(GfxControllerIdentifier);
              gfx.tool.setTool(DefaultTool);
            }
          }
        );
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Attachment',
      icon: AttachmentIcon(),
      showWhen: () => false,
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const file = await openSingleFileWith();
        if (!file) return;

        await addSiblingAttachmentBlocks(std, [file], model);
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Equation',
      icon: TeXIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:latex'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertLatexBlockCommand, {
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },
  ],
};

const embedToolGroup: KeyboardToolPanelGroup = {
  name: 'Embeds',
  items: [
    {
      name: 'Embed',
      icon: EmbedIcon({ style: `color: black` }),
      showWhen: ({ std }) => {
        return std.store.schema.flavourSchemaMap.has('nexio:embed-iframe');
      },
      action: async ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertEmptyEmbedIframeCommand, {
            place: 'after',
            removeEmptyLine: true,
            linkInputPopupOptions: {
              showCloseButton: true,
              variant: 'mobile',
              telemetrySegment: 'keyboard toolbar',
            },
          })
          .run();
      },
    },
    {
      name: 'Youtube',
      icon: YoutubeDuotoneIcon({
        style: `color: white`,
      }),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:embed-youtube'),
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const parentModel = std.store.getParent(model);
        if (!parentModel) return;

        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          std.host,
          'YouTube',
          'The added YouTube video link will be displayed as an embed view.',
          { mode: 'page', parentModel, index },
          ({ mode }) => {
            if (mode === 'edgeless') {
              const gfx = std.get(GfxControllerIdentifier);
              gfx.tool.setTool(DefaultTool);
            }
          }
        );
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Github',
      icon: GithubIcon({ style: `color: black` }),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:embed-github'),
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const parentModel = std.store.getParent(model);
        if (!parentModel) return;

        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          std.host,
          'GitHub',
          'The added GitHub issue or pull request link will be displayed as a card view.',
          { mode: 'page', parentModel, index },
          ({ mode }) => {
            if (mode === 'edgeless') {
              const gfx = std.get(GfxControllerIdentifier);
              gfx.tool.setTool(DefaultTool);
            }
          }
        );
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Figma',
      icon: FigmaDuotoneIcon,
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:embed-figma'),
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const parentModel = std.store.getParent(model);
        if (!parentModel) {
          return;
        }
        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          std.host,
          'Figma',
          'The added Figma link will be displayed as an embed view.',
          { mode: 'page', parentModel, index },
          ({ mode }) => {
            if (mode === 'edgeless') {
              const gfx = std.get(GfxControllerIdentifier);
              gfx.tool.setTool(DefaultTool);
            }
          }
        );
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Loom',
      icon: LoomLogoIcon({ style: `color: #625DF5` }),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:embed-loom'),
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const parentModel = std.store.getParent(model);
        if (!parentModel) return;

        const index = parentModel.children.indexOf(model) + 1;
        await toggleEmbedCardCreateModal(
          std.host,
          'Loom',
          'The added Loom video link will be displayed as an embed view.',
          { mode: 'page', parentModel, index },
          ({ mode }) => {
            if (mode === 'edgeless') {
              const gfx = std.get(GfxControllerIdentifier);
              gfx.tool.setTool(DefaultTool);
            }
          }
        );
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Equation',
      icon: TeXIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:latex'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertLatexBlockCommand, {
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },
  ],
};

const documentGroupFrameToolGroup: DynamicKeyboardToolPanelGroup = ({
  std,
}) => {
  const { store } = std;

  const frameModels = store
    .getBlocksByFlavour('nexio:frame')
    .map(block => block.model) as FrameBlockModel[];

  const frameItems = frameModels.map<KeyboardToolbarActionItem>(frameModel => ({
    name: 'Frame: ' + frameModel.props.title.toString(),
    icon: FrameIcon(),
    action: ({ std }) => {
      std.command
        .chain()
        .pipe(getSelectedModelsCommand)
        .pipe(insertSurfaceRefBlockCommand, {
          reference: frameModel.id,
          place: 'after',
          removeEmptyLine: true,
        })
        .run();
    },
  }));

  const surfaceModel = getSurfaceBlock(store);

  const groupElements = surfaceModel
    ? surfaceModel.getElementsByType('group')
    : [];

  const groupItems = groupElements.map<KeyboardToolbarActionItem>(group => ({
    name: 'Group: ' + group.title.toString(),
    icon: GroupIcon(),
    action: ({ std }) => {
      std.command
        .chain()
        .pipe(getSelectedModelsCommand)
        .pipe(insertSurfaceRefBlockCommand, {
          reference: group.id,
          place: 'after',
          removeEmptyLine: true,
        })
        .run();
    },
  }));

  const items = [...frameItems, ...groupItems];

  if (items.length === 0) return null;

  return {
    name: 'Document Group&Frame',
    items,
  };
};

const dateToolGroup: KeyboardToolPanelGroup = {
  name: 'Date',
  items: [
    {
      name: 'Today',
      icon: TodayIcon(),
      action: ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        insertContent(std, model, formatDate(new Date()));
      },
    },
    {
      name: 'Tomorrow',
      icon: TomorrowIcon(),
      action: ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        insertContent(std, model, formatDate(tomorrow));
      },
    },
    {
      name: 'Yesterday',
      icon: YesterdayIcon(),
      action: ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        insertContent(std, model, formatDate(yesterday));
      },
    },
    {
      name: 'Now',
      icon: NowIcon(),
      action: ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        insertContent(std, model, formatTime(new Date()));
      },
    },
  ],
};

const databaseToolGroup: KeyboardToolPanelGroup = {
  name: 'Database',
  items: [
    {
      name: 'Table view',
      icon: DatabaseTableViewIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:database'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertDatabaseBlockCommand, {
            viewType: viewPresets.tableViewMeta.type,
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },
    {
      name: 'Kanban view',
      icon: DatabaseKanbanViewIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:database'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertDatabaseBlockCommand, {
            viewType: viewPresets.kanbanViewMeta.type,
            place: 'after',
            removeEmptyLine: true,
          })
          .run();
      },
    },
  ],
};

const moreToolPanel: KeyboardToolPanelConfig = {
  icon: PlusIcon(),
  activeIcon: CloseIcon({
    style: `color: ${cssVarV2('icon/activated')}`,
  }),
  activeBackground: cssVarV2('edgeless/selection/selectionMarqueeBackground'),
  groups: [
    { name: 'Basic', items: textToolActionItems },
    { name: 'List', items: listToolActionItems },
    pageToolGroup,
    contentMediaToolGroup,
    embedToolGroup,
    documentGroupFrameToolGroup,
    dateToolGroup,
    databaseToolGroup,
  ],
};

const textToolPanel: KeyboardToolPanelConfig = {
  icon: TextIcon(),
  groups: [
    {
      name: 'Turn into',
      items: textToolActionItems,
    },
  ],
};

const textStyleToolItems: KeyboardToolbarItem[] = [
  {
    name: 'Bold',
    icon: BoldIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.bold ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleBold);
    },
  },
  {
    name: 'Italic',
    icon: ItalicIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.italic ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleItalic);
    },
  },
  {
    name: 'UnderLine',
    icon: UnderLineIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.underline ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleUnderline);
    },
  },
  {
    name: 'StrikeThrough',
    icon: StrikeThroughIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.strike ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleStrike);
    },
  },
  {
    name: 'Code',
    icon: CodeIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.code ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleCode);
    },
  },
  {
    name: 'Link',
    icon: LinkIcon(),
    background: ({ std }) => {
      const [_, { textAttributes }] = std.command.exec(getTextAttributes);
      return textAttributes?.link ? '#00000012' : '';
    },
    action: ({ std }) => {
      std.command.exec(toggleLink);
    },
  },
];

const highlightToolPanel: KeyboardToolPanelConfig = {
  icon: ({ std }) => {
    const [_, { textAttributes }] = std.command.exec(getTextAttributes);
    if (textAttributes?.color) {
      return HighLightDuotoneIcon(textAttributes.color);
    } else {
      return HighLightDuotoneIcon(cssVarV2('icon/primary'));
    }
  },
  groups: [
    {
      name: 'Color',
      items: [
        {
          name: 'Default Color',
          icon: TextColorIcon(cssVarV2('text/highlight/fg/orange')),
        },
        ...(
          [
            'red',
            'orange',
            'yellow',
            'green',
            'teal',
            'blue',
            'purple',
            'grey',
          ] as const
        ).map<KeyboardToolbarActionItem>(color => ({
          name: color.charAt(0).toUpperCase() + color.slice(1),
          icon: TextColorIcon(cssVarV2(`text/highlight/fg/${color}`)),
          action: ({ std }) => {
            const payload = {
              styles: {
                color: cssVarV2(`text/highlight/fg/${color}`),
              } satisfies NexioTextStyleAttributes,
            };
            std.command
              .chain()
              .try(chain => [
                chain
                  .pipe(getTextSelectionCommand)
                  .pipe(formatTextCommand, payload),
                chain
                  .pipe(getBlockSelectionsCommand)
                  .pipe(formatBlockCommand, payload),
                chain.pipe(formatNativeCommand, payload),
              ])
              .run();
          },
        })),
      ],
    },
    {
      name: 'Background',
      items: [
        {
          name: 'Default Color',
          icon: TextBackgroundDuotoneIcon(cssVarV2('text/highlight/bg/orange')),
        },
        ...(
          [
            'red',
            'orange',
            'yellow',
            'green',
            'teal',
            'blue',
            'purple',
            'grey',
          ] as const
        ).map<KeyboardToolbarActionItem>(color => ({
          name: color.charAt(0).toUpperCase() + color.slice(1),
          icon: TextBackgroundDuotoneIcon(
            cssVarV2(`text/highlight/bg/${color}`)
          ),
          action: ({ std }) => {
            const payload = {
              styles: {
                background: cssVarV2(`text/highlight/bg/${color}`),
              } satisfies NexioTextStyleAttributes,
            };
            std.command
              .chain()
              .try(chain => [
                chain
                  .pipe(getTextSelectionCommand)
                  .pipe(formatTextCommand, payload),
                chain
                  .pipe(getBlockSelectionsCommand)
                  .pipe(formatBlockCommand, payload),
                chain.pipe(formatNativeCommand, payload),
              ])
              .run();
          },
        })),
      ],
    },
  ],
};

const textSubToolbarConfig: KeyboardSubToolbarConfig = {
  icon: FontIcon(),
  items: [
    textToolPanel,
    ...textStyleToolItems,
    {
      name: 'InlineTex',
      icon: TeXIcon(),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getTextSelectionCommand)
          .pipe(insertInlineLatex)
          .run();
      },
    },
    highlightToolPanel,
  ],
  autoShow: ({ std }) => {
    return computed(() => {
      const [_, { currentTextSelection: selection }] = std.command.exec(
        getTextSelectionCommand
      );
      return selection ? !selection.isCollapsed() : false;
    });
  },
};

export const defaultKeyboardToolbarConfig: KeyboardToolbarConfig = {
  items: [
    moreToolPanel,
    // TODO(@L-Sun): add ai function in nexio side
    // { icon: AiIcon(iconStyle) },
    textSubToolbarConfig,
    {
      name: 'Image',
      icon: ImageIcon(),
      showWhen: ({ std }) =>
        std.store.schema.flavourSchemaMap.has('nexio:image'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertImagesCommand, { removeEmptyLine: true })
          .run();
      },
    },
    {
      name: 'Attachment',
      icon: AttachmentIcon(),
      showWhen: () => false,
      action: async ({ std }) => {
        const [_, { selectedModels }] = std.command.exec(
          getSelectedModelsCommand
        );
        const model = selectedModels?.[0];
        if (!model) return;

        const file = await openSingleFileWith();
        if (!file) return;

        await addSiblingAttachmentBlocks(std, [file], model);
        if (model.text?.length === 0) {
          std.store.deleteBlock(model);
        }
      },
    },
    {
      name: 'Undo',
      icon: UndoIcon(),
      disableWhen: ({ std }) => !std.store.canUndo,
      action: ({ std }) => {
        std.store.undo();
      },
    },
    {
      name: 'Redo',
      icon: RedoIcon(),
      disableWhen: ({ std }) => !std.store.canRedo,
      action: ({ std }) => {
        std.store.redo();
      },
    },
    {
      name: 'RightTab',
      icon: RightTabIcon(),
      disableWhen: ({ std }) => {
        const [success] = std.command
          .chain()
          .tryAll(chain => [
            chain.pipe(canIndentParagraphCommand),
            chain.pipe(canIndentListCommand),
          ])
          .run();
        return !success;
      },
      action: ({ std }) => {
        std.command
          .chain()
          .tryAll(chain => [
            chain.pipe(canIndentParagraphCommand).pipe(indentParagraphCommand),
            chain.pipe(canIndentListCommand).pipe(indentListCommand),
          ])
          .run();
      },
    },
    ...listToolActionItems,
    ...textToolActionItems.filter(({ name }) => name === 'Divider'),
    {
      name: 'CollapseTab',
      icon: CollapseTabIcon(),
      disableWhen: ({ std }) => {
        const [success] = std.command
          .chain()
          .tryAll(chain => [
            chain.pipe(canDedentParagraphCommand),
            chain.pipe(canDedentListCommand),
          ])
          .run();
        return !success;
      },
      action: ({ std }) => {
        std.command
          .chain()
          .tryAll(chain => [
            chain.pipe(canDedentParagraphCommand).pipe(dedentParagraphCommand),
            chain.pipe(canDedentListCommand).pipe(dedentListCommand),
          ])
          .run();
      },
    },
    {
      name: 'Copy',
      icon: CopyIcon(),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .with({
            onCopy: () => {
              toast(std.host, 'Copied to clipboard');
            },
          })
          .pipe(draftSelectedModelsCommand)
          .pipe(copySelectedModelsCommand)
          .run();
      },
    },
    {
      name: 'Duplicate',
      icon: DuplicateIcon(),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(duplicateSelectedModelsCommand)
          .run();
      },
    },
    {
      name: 'Delete',
      icon: DeleteIcon(),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(deleteSelectedModelsCommand)
          .run();
      },
    },
  ],
};

export const KeyboardToolbarConfigExtension = ConfigExtensionFactory<
  Partial<KeyboardToolbarConfig>
>('nexio:keyboard-toolbar');
