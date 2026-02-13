
// eslint-disable-next-line @typescript-eslint/no-restricted-imports -- import from bundle
import {
  parsePageDoc as parseDocToMarkdown,
  readAllBlocksFromDoc,
  readAllDocIdsFromRootDoc,
} from '@nexio/reader/dist';
import { applyUpdate, Array as YArray, Doc as YDoc, Map as YMap } from 'yjs';

export interface PageDocContent {
  title: string;
  summary: string;
}

export interface WorkspaceDocContent {
  name: string;
  avatarKey: string;
}

type KnownFlavour =
  | 'nexio:page'
  | 'nexio:note'
  | 'nexio:surface'
  | 'nexio:paragraph'
  | 'nexio:list'
  | 'nexio:code'
  | 'nexio:image'
  | 'nexio:attachment'
  | 'nexio:transcription'
  | 'nexio:callout'
  | 'nexio:table';

export function parseWorkspaceDoc(doc: YDoc): WorkspaceDocContent | null {
  // not a workspace doc
  if (!doc.share.has('meta')) {
    return null;
  }

  const meta = doc.getMap('meta');

  return {
    name: meta.get('name') as string,
    avatarKey: meta.get('avatar') as string,
  };
}

export interface ParsePageOptions {
  maxSummaryLength: number;
}

export function parsePageDoc(
  doc: YDoc,
  opts: ParsePageOptions = { maxSummaryLength: 150 }
): PageDocContent | null {
  // not a page doc
  if (!doc.share.has('blocks')) {
    return null;
  }

  const blocks = doc.getMap<YMap<any>>('blocks');

  if (!blocks.size) {
    return null;
  }

  const content: PageDocContent = {
    title: '',
    summary: '',
  };

  let summaryLenNeeded = opts.maxSummaryLength;

  let root: YMap<any> | null = null;
  for (const block of blocks.values()) {
    const flavour = block.get('sys:flavour') as KnownFlavour;
    if (flavour === 'nexio:page') {
      content.title = block.get('prop:title') as string;
      root = block;
    }
  }

  if (!root) {
    return null;
  }

  const queue: string[] = [root.get('sys:id')];

  function pushChildren(block: YMap<any>) {
    const children = block.get('sys:children') as YArray<string> | undefined;
    if (children?.length) {
      for (let i = children.length - 1; i >= 0; i--) {
        queue.push(children.get(i));
      }
    }
  }

  while (queue.length) {
    const blockId = queue.pop();
    const block = blockId ? blocks.get(blockId) : null;
    if (!block) {
      break;
    }

    const flavour = block.get('sys:flavour') as KnownFlavour;

    switch (flavour) {
      case 'nexio:page':
      case 'nexio:note': {
        pushChildren(block);
        break;
      }
      case 'nexio:attachment':
      case 'nexio:transcription':
      case 'nexio:callout': {
        // only extract text in full content mode
        if (summaryLenNeeded === -1) {
          pushChildren(block);
        }
        break;
      }
      case 'nexio:table': {
        // only extract text in full content mode
        if (summaryLenNeeded === -1) {
          const contents: string[] = [...block.keys()]
            .map(key => {
              if (key.startsWith('prop:cells.') && key.endsWith('.text')) {
                return block.get(key)?.toString() ?? '';
              }
              return '';
            })
            .filter(Boolean);
          content.summary += contents.join('|');
        }
        break;
      }
      case 'nexio:paragraph':
      case 'nexio:list':
      case 'nexio:code': {
        pushChildren(block);
        const text = block.get('prop:text');
        if (!text) {
          continue;
        }

        if (summaryLenNeeded === -1) {
          content.summary += text.toString();
        } else if (summaryLenNeeded > 0) {
          content.summary += text.toString();
          summaryLenNeeded -= text.length;
        } else {
          break;
        }
      }
    }
  }

  return content;
}

export function readAllDocIdsFromWorkspaceSnapshot(snapshot: Uint8Array) {
  const rootDoc = new YDoc();
  applyUpdate(rootDoc, snapshot);
  return readAllDocIdsFromRootDoc(rootDoc, {
    includeTrash: false,
  });
}

export async function readAllBlocksFromDocSnapshot(
  workspaceId: string,
  docId: string,
  docSnapshot: Uint8Array,
  workspaceSnapshot?: Uint8Array,
  maxSummaryLength?: number
) {
  let rootYDoc: YDoc | undefined;
  if (workspaceSnapshot) {
    rootYDoc = new YDoc({
      guid: workspaceId,
    });
    applyUpdate(rootYDoc, workspaceSnapshot);
  }
  const ydoc = new YDoc({
    guid: docId,
  });
  applyUpdate(ydoc, docSnapshot);
  return await readAllBlocksFromDoc({
    ydoc,
    rootYDoc,
    spaceId: workspaceId,
    maxSummaryLength,
  });
}

export function parseDocToMarkdownFromDocSnapshot(
  workspaceId: string,
  docId: string,
  docSnapshot: Uint8Array,
  aiEditable = false
) {
  const ydoc = new YDoc({
    guid: docId,
  });
  applyUpdate(ydoc, docSnapshot);

  const parsed = parseDocToMarkdown({
    workspaceId,
    doc: ydoc,
    buildBlobUrl: (blobId: string) => {
      return `/${workspaceId}/blobs/${blobId}`;
    },
    buildDocUrl: (docId: string) => {
      return `/workspace/${workspaceId}/${docId}`;
    },
    aiEditable,
  });

  return {
    title: parsed.title,
    markdown: parsed.md,
  };
}
