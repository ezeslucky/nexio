import {
  CodeBlockSchemaExtension,
  DatabaseBlockSchemaExtension,
  ImageBlockSchemaExtension,
  ListBlockSchemaExtension,
  NoteBlockSchemaExtension,
  ParagraphBlockSchemaExtension,
  RootBlockSchemaExtension,
} from '@canvas/nexio-model';
import { Container } from '@canvas/global/di';
import { TextSelection } from '@canvas/std';
import {
  type Block,
  type ExtensionType,
  type Store,
  Text,
} from '@canvas/store';
import { TestWorkspace } from '@canvas/store/test';

import { createTestHost } from './create-test-host';

const DEFAULT_EXTENSIONS = [
  RootBlockSchemaExtension,
  NoteBlockSchemaExtension,
  ParagraphBlockSchemaExtension,
  ListBlockSchemaExtension,
  ImageBlockSchemaExtension,
  DatabaseBlockSchemaExtension,
  CodeBlockSchemaExtension,
];

// Mapping from tag names to flavours
const tagToFlavour: Record<string, string> = {
  'nexio-page': 'nexio:page',
  'nexio-note': 'nexio:note',
  'nexio-paragraph': 'nexio:paragraph',
  'nexio-list': 'nexio:list',
  'nexio-image': 'nexio:image',
  'nexio-database': 'nexio:database',
  'nexio-code': 'nexio:code',
};

interface SelectionInfo {
  anchorBlockId?: string;
  anchorOffset?: number;
  focusBlockId?: string;
  focusOffset?: number;
  cursorBlockId?: string;
  cursorOffset?: number;
}

export function createNexioTemplate(
  extensions: ExtensionType[] = DEFAULT_EXTENSIONS
) {

  function nexio(strings: TemplateStringsArray, ...values: any[]) {
    // Merge template strings and values
    let htmlString = '';
    strings.forEach((str, i) => {
      htmlString += str;
      if (i < values.length) {
        htmlString += values[i];
      }
    });

    // Create a new doc
    const workspace = new TestWorkspace({});
    workspace.meta.initialize();
    const doc = workspace.createDoc('test-doc');
    const container = new Container();
    extensions.forEach(extension => {
      extension.setup(container);
    });
    const store = doc.getStore({ extensions, provider: container.provider() });
    let selectionInfo: SelectionInfo = {};

    // Use DOMParser to parse HTML string
    doc.load(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlString.trim(), 'text/html');
      const root = dom.body.firstElementChild;

      if (!root) {
        throw new Error('Template must contain a root element');
      }

      buildDocFromElement(store, root, null, selectionInfo);
    });

    // Create host object
    const host = createTestHost(store);

    // Set selection if needed
    if (selectionInfo.anchorBlockId && selectionInfo.focusBlockId) {
      const anchorBlock = store.getBlock(selectionInfo.anchorBlockId);
      const anchorTextLength = anchorBlock?.model?.text?.length ?? 0;
      const focusOffset = selectionInfo.focusOffset ?? 0;
      const anchorOffset = selectionInfo.anchorOffset ?? 0;

      if (selectionInfo.anchorBlockId === selectionInfo.focusBlockId) {
        const selection = host.selection.create(TextSelection, {
          from: {
            blockId: selectionInfo.anchorBlockId,
            index: anchorOffset,
            length: focusOffset,
          },
          to: null,
        });
        host.selection.setGroup('note', [selection]);
      } else {
        const selection = host.selection.create(TextSelection, {
          from: {
            blockId: selectionInfo.anchorBlockId,
            index: anchorOffset,
            length: anchorTextLength - anchorOffset,
          },
          to: {
            blockId: selectionInfo.focusBlockId,
            index: 0,
            length: focusOffset,
          },
        });
        host.selection.setGroup('note', [selection]);
      }
    } else if (selectionInfo.cursorBlockId) {
      const selection = host.selection.create(TextSelection, {
        from: {
          blockId: selectionInfo.cursorBlockId,
          index: selectionInfo.cursorOffset ?? 0,
          length: 0,
        },
        to: null,
      });
      host.selection.setGroup('note', [selection]);
    }

    return host;
  }

  /**
   * Create a single block from template string
   *
   * Example:
   * ```
   * const block = block`<nexio-note />`
   * ```
   */
  function block(
    strings: TemplateStringsArray,
    ...values: any[]
  ): Block | null {
    // Merge template strings and values
    let htmlString = '';
    strings.forEach((str, i) => {
      htmlString += str;
      if (i < values.length) {
        htmlString += values[i];
      }
    });

    // Create a temporary doc to hold the block
    const workspace = new TestWorkspace({});
    workspace.meta.initialize();
    const doc = workspace.createDoc('temp-doc');
    const store = doc.getStore({ extensions });

    let blockId: string | null = null;
    const selectionInfo: SelectionInfo = {};

    // Use DOMParser to parse HTML string
    doc.load(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(htmlString.trim(), 'text/html');
      const root = dom.body.firstElementChild;

      if (!root) {
        throw new Error('Template must contain a root element');
      }

      // Create a root block if needed
      const flavour = tagToFlavour[root.tagName.toLowerCase()];
      if (
        flavour === 'nexio:paragraph' ||
        flavour === 'nexio:list' ||
        flavour === 'nexio:code'
      ) {
        const pageId = store.addBlock('nexio:page', {});
        const noteId = store.addBlock('nexio:note', {}, pageId);
        blockId = buildDocFromElement(store, root, noteId, selectionInfo);
      } else {
        blockId = buildDocFromElement(store, root, null, selectionInfo);
      }
    });

    // Return the created block
    return blockId ? (store.getBlock(blockId) ?? null) : null;
  }

  return {
    nexio,
    block,
  };
}

export const { nexio, block } = createNexioTemplate();

/**
 * Recursively build document structure
 * @param doc
 * @param element
 * @param parentId
 * @param selectionInfo
 * @returns
 */
function buildDocFromElement(
  doc: Store,
  element: Element,
  parentId: string | null,
  selectionInfo: SelectionInfo
): string {
  const tagName = element.tagName.toLowerCase();

  // Handle selection tags
  if (tagName === 'anchor') {
    if (!parentId) return '';
    const parentBlock = doc.getBlock(parentId);
    if (parentBlock) {
      const textBeforeCursor = element.previousSibling?.textContent ?? '';
      selectionInfo.anchorBlockId = parentId;
      selectionInfo.anchorOffset = textBeforeCursor.length;
    }
    return parentId;
  } else if (tagName === 'focus') {
    if (!parentId) return '';
    const parentBlock = doc.getBlock(parentId);
    if (parentBlock) {
      const textBeforeCursor = element.previousSibling?.textContent ?? '';
      selectionInfo.focusBlockId = parentId;
      selectionInfo.focusOffset = textBeforeCursor.length;
    }
    return parentId;
  } else if (tagName === 'cursor') {
    if (!parentId) return '';
    const parentBlock = doc.getBlock(parentId);
    if (parentBlock) {
      const textBeforeCursor = element.previousSibling?.textContent ?? '';
      selectionInfo.cursorBlockId = parentId;
      selectionInfo.cursorOffset = textBeforeCursor.length;
    }
    return parentId;
  }

  const flavour = tagToFlavour[tagName];

  if (!flavour) {
    throw new Error(`Unknown tag name: ${tagName}`);
  }

  const props: Record<string, any> = {};

  const customId = element.getAttribute('id');

  // If ID is specified, add it to props
  if (customId) {
    props.id = customId;
  }

  // Process element attributes
  Array.from(element.attributes).forEach(attr => {
    if (attr.name !== 'id') {
      // Skip id attribute, we already handled it
      props[attr.name] = attr.value;
    }
  });

  // Special handling for different block types based on their flavours
  switch (flavour) {
    case 'nexio:paragraph':
    case 'nexio:list':
      if (element.textContent) {
        props.text = new Text(element.textContent);
      }
      break;
  }

  // Create block
  const blockId = doc.addBlock(flavour, props, parentId);

  // Process all child nodes, including text nodes
  Array.from(element.children).forEach(child => {
    if (child.nodeType === Node.ELEMENT_NODE) {
      // Handle element nodes
      buildDocFromElement(doc, child as Element, blockId, selectionInfo);
    } else if (child.nodeType === Node.TEXT_NODE) {
      // Handle text nodes
      console.log('buildDocFromElement text node:', child.textContent);
    }
  });

  return blockId;
}
