import { CodeBlockPreviewIdentifier } from '@canvas/nexio/blocks/code';
import { addImages } from '@canvas/nexio/blocks/image';
import { getSurfaceBlock } from '@canvas/nexio/blocks/surface';
import { LoadingIcon } from '@canvas/nexio/components/icons';
import { addTree } from '@canvas/nexio/gfx/mindmap';
import { fitContent } from '@canvas/nexio/gfx/shape';
import { createTemplateJob } from '@canvas/nexio/gfx/template';
import { Bound } from '@canvas/nexio/global/gfx';
import {
  EDGELESS_TEXT_BLOCK_MIN_HEIGHT,
  EDGELESS_TEXT_BLOCK_MIN_WIDTH,
  EdgelessTextBlockModel,
  ImageBlockModel,
  type MindmapElementModel,
  NoteDisplayMode,
  type ShapeElementModel,
} from '@canvas/nexio/model';
import { TelemetryProvider } from '@canvas/nexio/shared/services';
import type { EditorHost } from '@canvas/nexio/std';
import { GfxControllerIdentifier } from '@canvas/nexio/std/gfx';
import { Text } from '@canvas/nexio/store';
import {
  NEXIO_TOOLBAR_WIDGET,
  type NexioToolbarWidget,
} from '@canvas/nexio/widgets/toolbar';
import {
  ChatWithAiIcon,
  DeleteIcon,
  InsertBleowIcon as InsertBelowIcon,
  PenIcon,
  ResetIcon,
} from '@canvas/icons/lit';
import { html, type TemplateResult } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import { insertFromMarkdown } from '../../utils';
import type { ChatContextValue } from '../components/ai-chat-content/type';
import type { AIItemConfig } from '../components/ai-item/types';
import { AIProvider } from '../provider';
import { reportResponse } from '../utils/action-reporter';
import { getAIPanelWidget } from '../utils/ai-widgets';
import type { AIContext } from '../utils/context';
import { getEdgelessCopilotWidget, isMindMapRoot } from '../utils/edgeless';
import { preprocessHtml } from '../utils/html';
import { fetchImageToFile } from '../utils/image';
import {
  getCopilotSelectedElems,
  getSurfaceElementFromEditor,
} from '../utils/selection-utils';
import type { NexioAIPanelWidget } from '../widgets/ai-panel/ai-panel';
import type { EdgelessCopilotWidget } from '../widgets/edgeless-copilot';
import { EXCLUDING_INSERT_ACTIONS, generatingStages } from './consts';

type FinishConfig = Exclude<
  NexioAIPanelWidget['config'],
  null
>['finishStateConfig'];

type ErrorConfig = Exclude<
  NexioAIPanelWidget['config'],
  null
>['errorStateConfig'];

export function getToolbar(host: EditorHost) {
  const rootBlockId = host.store.root?.id as string;
  const toolbar = host.view.getWidget(
    NEXIO_TOOLBAR_WIDGET,
    rootBlockId
  ) as NexioToolbarWidget;

  return toolbar.querySelector('editor-toolbar');
}

export function getTriggerEntry(host: EditorHost) {
  const copilotWidget = getEdgelessCopilotWidget(host);

  return copilotWidget.visible ? 'selection' : 'toolbar';
}

export function discard(
  panel: NexioAIPanelWidget,
  _: EdgelessCopilotWidget
): AIItemConfig {
  return {
    name: 'Discard',
    icon: DeleteIcon(),
    testId: 'answer-discard',
    showWhen: () => !!panel.answer,
    handler: () => {
      panel.discard();
    },
  };
}

export function retry(panel: NexioAIPanelWidget): AIItemConfig {
  return {
    name: 'Retry',
    icon: ResetIcon(),
    testId: 'answer-retry',
    handler: () => {
      reportResponse('result:retry');
      panel.generate();
    },
  };
}

const extraConditions: Record<string, (data: any) => boolean> = {
  createSlides: data => !!data.contents,
};
export function createInsertItems<T extends keyof CanvasPresets.AIActions>(
  id: T,
  host: EditorHost,
  ctx: AIContext,
  variants?: Omit<
    Parameters<CanvasPresets.AIActions[T]>[0],
    keyof CanvasPresets.AITextActionOptions
  >
): AIItemConfig[] {
  const extraCondition = extraConditions[id] || ((_: any) => true);
  const buttonText = getButtonText[id]?.(variants) ?? 'Insert below';
  return [
    {
      name: `${buttonText} - Loading...`,
      icon: html`<div style=${styleMap({ height: '20px', width: '20px' })}>
        ${LoadingIcon()}
      </div>`,
      testId: 'answer-insert-below-loading',
      showWhen: () => {
        const panel = getAIPanelWidget(host);
        const data = ctx.get();
        return (
          !EXCLUDING_INSERT_ACTIONS.includes(id) &&
          !!panel.answer &&
          // required data for insert
          !extraCondition(data)
        );
      },
    },
    {
      name: buttonText,
      icon: InsertBelowIcon(),
      testId:
        buttonText === 'Replace' ? 'answer-replace' : `answer-insert-below`,
      showWhen: () => {
        const panel = getAIPanelWidget(host);
        const data = ctx.get();
        return (
          !EXCLUDING_INSERT_ACTIONS.includes(id) &&
          !!panel.answer &&
          // required data for insert
          !!extraCondition(data)
        );
      },
      handler: () => {
        reportResponse('result:insert');
        edgelessResponseHandler(id, host, ctx).catch(console.error);
        const panel = getAIPanelWidget(host);
        panel.hide();
      },
    },
  ];
}

async function edgelessResponseHandler<
  T extends keyof CanvasPresets.AIActions,
>(id: T, host: EditorHost, ctx: AIContext) {
  switch (id) {
    case 'expandMindmap':
      responseToExpandMindmap(host, ctx);
      break;
    case 'brainstormMindmap':
      responseToBrainstormMindmap(host, ctx);
      break;
    case 'makeItReal':
      responseToMakeItReal(host, ctx);
      break;
    case 'createSlides':
      await responseToCreateSlides(host, ctx);
      break;
    case 'createImage':
    case 'filterImage':
    case 'processImage':
      responseToCreateImage(host);
      break;
    default:
      defaultHandler(host);
      break;
  }
}

export function asCaption<T extends keyof CanvasPresets.AIActions>(
  id: T,
  host: EditorHost
): AIItemConfig {
  return {
    name: 'Use as caption',
    icon: PenIcon(),
    testId: 'answer-use-as-caption',
    showWhen: () => {
      const panel = getAIPanelWidget(host);
      return id === 'generateCaption' && !!panel.answer;
    },
    handler: () => {
      reportResponse('result:use-as-caption');
      const panel = getAIPanelWidget(host);
      const caption = panel.answer;
      if (!caption) return;

      const selectedElements = getCopilotSelectedElems(host);
      if (selectedElements.length !== 1) return;

      const imageBlock = selectedElements[0];
      if (!(imageBlock instanceof ImageBlockModel)) return;

      host.store.updateBlock(imageBlock, { caption });
      panel.hide();
    },
  };
}

function insertBelow(
  host: EditorHost,
  markdown: string,
  parentId: string,
  index = 0
) {
  insertFromMarkdown(host, markdown, host.store, parentId, index)
    .then(() => {
      const gfx = host.std.get(GfxControllerIdentifier);

      gfx.selection.set({
        elements: [parentId],
        editing: false,
      });
    })
    .catch(err => {
      console.error(err);
    });
}

function createBlockAndInsert(
  host: EditorHost,
  markdown: string,
  type: 'edgelessText' | 'note'
) {
  const doc = host.store;
  const edgelessCopilot = getEdgelessCopilotWidget(host);
  doc.transact(() => {
    if (!doc.root) return;
    let blockId = '';
    const bounds = edgelessCopilot.determineInsertionBounds(
      EDGELESS_TEXT_BLOCK_MIN_WIDTH,
      EDGELESS_TEXT_BLOCK_MIN_HEIGHT
    );
    const surfaceBlock = doc.getBlocksByFlavour('nexio:surface')[0];
    if (type === 'edgelessText') {
      blockId = doc.addBlock(
        'nexio:edgeless-text',
        {
          xywh: bounds.serialize(),
        },
        surfaceBlock.id
      );
    } else {
      const bounds = edgelessCopilot.determineInsertionBounds(800, 95);
      blockId = doc.addBlock(
        'nexio:note',
        {
          xywh: bounds.serialize(),
          displayMode: NoteDisplayMode.EdgelessOnly,
        },
        doc.root.id
      );
    }

    insertBelow(host, markdown, blockId);
  });
}

/**
 * defaultHandler is the default handler for inserting AI response into the edgeless document.
 * Three situations are handled by this handler:
 * 1. When selection is a single EdgelessText block, insert the response to the last of the block.
 * 2. When selections are multiple EdgelessText blocks, insert the response to a new EdgelessBlock.
 * 3. Otherwise, insert the response to a new Note block.
 * @param host EditorHost
 */
const defaultHandler = (host: EditorHost) => {
  const panel = getAIPanelWidget(host);
  const selectedElements = getCopilotSelectedElems(host);
  if (!panel.answer) return;
  if (
    selectedElements.length === 1 &&
    selectedElements[0] instanceof EdgelessTextBlockModel
  ) {
    const edgelessTextBlockId = selectedElements[0].id;
    const index = selectedElements[0].children.length;
    insertBelow(host, panel.answer, edgelessTextBlockId, index);
  } else if (
    selectedElements.length > 1 &&
    selectedElements.every(el => el instanceof EdgelessTextBlockModel)
  ) {
    createBlockAndInsert(host, panel.answer, 'edgelessText');
  } else {
    createBlockAndInsert(host, panel.answer, 'note');
  }
};

/**
 * Image handler for inserting generated image into the edgeless document.
 * Should make the inserting image size same with the input image if there is an input image.
 * @param host
 */
function responseToCreateImage(host: EditorHost) {
  const aiPanel = getAIPanelWidget(host);
  // `DataURL` or `URL`
  const data = aiPanel.answer;
  if (!data) return;

  const edgelessCopilot = getEdgelessCopilotWidget(host);
  const bounds = edgelessCopilot.determineInsertionBounds();
  const selectedElements = getCopilotSelectedElems(host);
  const selectedImageBlockModel = selectedElements.find(
    model => model instanceof ImageBlockModel
  );
  const selectedBound = selectedImageBlockModel
    ? Bound.deserialize(selectedImageBlockModel.xywh)
    : null;

  edgelessCopilot.hideCopilotPanel();
  aiPanel.hide();

  const filename = 'image';
  const imageProxy = host.std.clipboard.configs.get('imageProxy');

  fetchImageToFile(data, filename, imageProxy)
    .then(img => {
      if (!img) return;

      const { minX, minY } = bounds;
      const gfx = host.std.get(GfxControllerIdentifier);
      const [x, y] = gfx.viewport.toViewCoord(minX, minY);

      host.store.transact(() => {
        addImages(host.std, [img], { point: [x, y] })
          .then(blockIds => {
            const imageBlockId = blockIds[0];
            const imageBlock = host.store.getBlock(imageBlockId);
            if (!imageBlock || !selectedBound) return;

            // Update the image width and height to the same with the selected image
            const imageModel = imageBlock.model as ImageBlockModel;
            const imageBound = Bound.deserialize(imageModel.xywh);
            const newBound = new Bound(
              imageBound.x,
              imageBound.y,
              selectedBound.w,
              selectedBound.h
            );
            host.store.updateBlock(imageModel, { xywh: newBound.serialize() });
          })
          .catch(console.error);
      });
    })
    .catch(console.error);
}

export function responseToExpandMindmap(host: EditorHost, ctx: AIContext) {
  const surface = getSurfaceBlock(host.store);
  if (!surface) return;

  const elements = ctx.get().selectedElements;
  const mindmapNode = ctx.get().node;

  queueMicrotask(() => {
    getAIPanelWidget(host).hide();
  });

  if (!mindmapNode || !elements) return;

  const mindmap = elements[0].group as MindmapElementModel;
  if (mindmapNode.children) {
    mindmapNode.children.forEach(childTree => {
      addTree(mindmap, elements[0].id, childTree);
    });

    const subtree = mindmap.getNode(elements[0].id);

    if (!subtree) return;

    surface.store.transact(() => {
      const updateNodeSize = (node: typeof subtree) => {
        fitContent(node.element as ShapeElementModel);

        node.children.forEach(child => {
          updateNodeSize(child);
        });
      };

      updateNodeSize(subtree);
    });

    setTimeout(() => {
      const gfx = host.std.get(GfxControllerIdentifier);
      gfx.selection.set({
        elements: [subtree.element.id],
        editing: false,
      });
    });
  }
}

function responseToBrainstormMindmap(host: EditorHost, ctx: AIContext) {
  const aiPanel = getAIPanelWidget(host);
  const gfx = host.std.get(GfxControllerIdentifier);
  const edgelessCopilot = getEdgelessCopilotWidget(host);
  const selectionRect = edgelessCopilot.selectionModelRect;
  const surface = getSurfaceBlock(host.store);
  if (!surface) return;

  const { node, style, selectedElements } = ctx.get();
  if (!node) return;
  const elements = selectedElements;
  // This means regenerate
  if (elements && isMindMapRoot(elements[0])) {
    const mindmap = elements[0].group as MindmapElementModel;
    const xywh = mindmap.tree.element.xywh;
    surface.deleteElement(mindmap.id);
    node.xywh = xywh;
  } else {
    node.xywh = `[${selectionRect.x + selectionRect.width + 100},${selectionRect.y},0,0]`;
  }

  edgelessCopilot.hideCopilotPanel();
  aiPanel.hide();

  const mindmapId = surface.addElement({
    type: 'mindmap',
    children: node,
    style: style,
  });
  const mindmap = surface.getElementById(mindmapId) as MindmapElementModel;

  host.store.transact(() => {
    mindmap.childElements.forEach(shape => {
      fitContent(shape as ShapeElementModel);
    });
  });

  const telemetryService = host.std.getOptional(TelemetryProvider);
  telemetryService?.track('CanvasElementAdded', {
    control: 'ai',
    page: 'whiteboard editor',
    module: 'toolbar',
    segment: 'toolbar',
    type: 'mindmap',
  });

  // This is a workaround to make sure mindmap and other microtask are done
  setTimeout(() => {
    gfx.viewport.setViewportByBound(
      mindmap.elementBound,
      [20, 20, 20, 20],
      true
    );

    gfx.selection.set({
      elements: [mindmap.tree.element.id],
      editing: false,
    });
  });
}

function getMakeItRealHTML(host: EditorHost) {
  const aiPanel = getAIPanelWidget(host);
  let html = aiPanel.answer;
  if (!html) return;
  html = preprocessHtml(html);
  return html;
}

function responseToMakeItReal(host: EditorHost, ctx: AIContext) {
  const aiPanel = getAIPanelWidget(host);
  const html = getMakeItRealHTML(host);
  if (!html) return;

  const edgelessCopilot = getEdgelessCopilotWidget(host);
  const surface = getSurfaceBlock(host.store);
  if (!surface) return;

  const data = ctx.get();
  const bounds = edgelessCopilot.determineInsertionBounds(
    data.width || 800,
    data.height || 600
  );

  edgelessCopilot.hideCopilotPanel();
  aiPanel.hide();

  host.store.transact(() => {
    const ifUseCodeBlock = host.std.getOptional(
      CodeBlockPreviewIdentifier('html')
    );

    if (ifUseCodeBlock) {
      const note = host.store.addBlock(
        'nexio:note',
        {
          xywh: bounds.serialize(),
        },
        host.store.root
      );
      host.store.addBlock(
        'nexio:code',
        { text: new Text(html), language: 'html', preview: true },
        note
      );
    } else {
      host.store.addBlock(
        'nexio:embed-html',
        {
          html,
          design: 'ai:makeItReal', // as tag
          xywh: bounds.serialize(),
        },
        surface.id
      );
    }
  });
}

async function responseToCreateSlides(host: EditorHost, ctx: AIContext) {
  const data = ctx.get();
  const { contents = [], images = [] } = data;
  if (contents.length === 0) return;

  try {
    for (let i = 0; i < contents.length; i++) {
      const image = images[i] || [];
      const content = contents[i];
      const job = createTemplateJob(host.std, 'template');

      const imagePromises = image.map(async ({ id, url }) => {
        const response = await fetch(url);
        const blob = await response.blob();
        job.job.assets.set(id, blob);
      });

      await Promise.all(imagePromises);
      await job.insertTemplate(content);
    }

    getSurfaceElementFromEditor(host)?.refresh();
  } catch (error) {
    console.error('Error creating slides:', error);
  }
}

const getButtonText: {
  [key in keyof Partial<CanvasPresets.AIActions>]: (
    variants?: Omit<
      Parameters<CanvasPresets.AIActions[key]>[0],
      keyof CanvasPresets.AITextActionOptions
    >
  ) => string | undefined;
} = {
  brainstormMindmap: variants => {
    return variants?.regenerate ? 'Replace' : undefined;
  },
};

export function actionToResponse<T extends keyof CanvasPresets.AIActions>(
  id: T,
  host: EditorHost,
  ctx: AIContext,
  variants?: Omit<
    Parameters<CanvasPresets.AIActions[T]>[0],
    keyof CanvasPresets.AITextActionOptions
  >
): FinishConfig {
  return {
    responses: [
      {
        name: 'Response',
        testId: 'answer-responses',
        items: [
          {
            name: 'Continue in chat',
            testId: 'answer-continue-in-chat',
            icon: ChatWithAiIcon({}),
            handler: () => {
              reportResponse('result:continue-in-chat');
              edgelesContinueResponseHandler(id, host, ctx).catch(
                console.error
              );
            },
          },
          ...createInsertItems(id, host, ctx, variants),
          asCaption(id, host),
          retry(getAIPanelWidget(host)),
          discard(getAIPanelWidget(host), getEdgelessCopilotWidget(host)),
        ],
      },
    ],
    actions: [],
  };
}

function continueExpandMindmap(ctx: AIContext) {
  const mindmapNode = ctx.get().node;
  if (!mindmapNode) {
    return null;
  }
  return {
    snapshot: JSON.stringify(mindmapNode),
  };
}

function continueBrainstormMindmap(ctx: AIContext) {
  const mindmap = ctx.get().node;
  if (!mindmap) {
    return null;
  }
  return {
    snapshot: JSON.stringify(mindmap),
  };
}

function continueMakeItReal(host: EditorHost) {
  const html = getMakeItRealHTML(host);
  if (!html) {
    return null;
  }
  return {
    html,
  };
}

function continueCreateSlides(ctx: AIContext) {
  const { contents = [] } = ctx.get();
  return {
    snapshot: JSON.stringify(contents),
  };
}

async function continueCreateImage(host: EditorHost) {
  const aiPanel = getAIPanelWidget(host);
  // `DataURL` or `URL`
  const data = aiPanel.answer;
  if (!data) return null;

  const filename = 'image';
  const imageProxy = host.std.clipboard.configs.get('imageProxy');

  try {
    const image = await fetchImageToFile(data, filename, imageProxy);
    return image
      ? {
          images: [image],
        }
      : null;
  } catch (error) {
    console.error('Failed fetch image', error);
    return null;
  }
}

function continueDefaultHandler(host: EditorHost) {
  const panel = getAIPanelWidget(host);
  return {
    combinedElementsMarkdown: panel.answer,
  };
}

async function edgelesContinueResponseHandler<
  T extends keyof CanvasPresets.AIActions,
>(id: T, host: EditorHost, ctx: AIContext) {
  let context: Partial<ChatContextValue> | null = null;
  switch (id) {
    case 'expandMindmap':
      context = continueExpandMindmap(ctx);
      break;
    case 'brainstormMindmap':
      context = continueBrainstormMindmap(ctx);
      break;
    case 'makeItReal':
      context = continueMakeItReal(host);
      break;
    case 'createSlides':
      context = continueCreateSlides(ctx);
      break;
    case 'createImage':
    case 'filterImage':
    case 'processImage':
      context = await continueCreateImage(host);
      break;
    default:
      context = continueDefaultHandler(host);
      break;
  }

  const panel = getAIPanelWidget(host);
  AIProvider.slots.requestOpenWithChat.next({
    host,
    context,
    fromAnswer: true,
  });
  panel.hide();
}

export function actionToGenerating<T extends keyof CanvasPresets.AIActions>(
  id: T,
  generatingIcon: TemplateResult<1>
) {
  return {
    generatingIcon,
    stages: generatingStages[id],
  };
}

export function actionToErrorResponse<
  T extends keyof CanvasPresets.AIActions,
>(
  panel: NexioAIPanelWidget,
  id: T,
  host: EditorHost,
  ctx: AIContext,
  variants?: Omit<
    Parameters<CanvasPresets.AIActions[T]>[0],
    keyof CanvasPresets.AITextActionOptions
  >
): ErrorConfig {
  return {
    upgrade: () => {
      AIProvider.slots.requestUpgradePlan.next({ host: panel.host });
      panel.hide();
    },
    login: () => {
      AIProvider.slots.requestLogin.next({ host: panel.host });
      panel.hide();
    },
    cancel: () => {
      panel.hide();
    },
    responses: [
      {
        name: 'Response',
        items: createInsertItems(id, host, ctx, variants),
      },
      {
        name: '',
        items: [
          retry(getAIPanelWidget(host)),
          discard(getAIPanelWidget(host), getEdgelessCopilotWidget(host)),
        ],
      },
    ],
  };
}
