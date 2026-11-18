import { getStoreManager } from '@nexio/core/blocksuite/manager/store';
import { ImportCommitService } from '@nexio/core/desktop/dialogs/import/commit-service';
import { commitNativeImport } from '@nexio/core/desktop/dialogs/import/native-backend';
import {
  preflightWebFilesImport,
  preflightWebZipImport,
} from '@nexio/core/desktop/dialogs/import/web-limits';
import { DebugLogger } from '@nexio/debug';
import { snapshotFile } from '@blocksuite/nexio/shared/utils';
import {
  BearTransformer,
  type ImportWarning,
  MarkdownTransformer,
  NotionHtmlTransformer,
  ObsidianTransformer,
  Unzip,
} from '@blocksuite/nexio/widgets/linked-doc';
import { Service } from '@toeverything/infra';

import type { ExplorerIconService } from '../../explorer-icon/services/explorer-icon';
import type { OrganizeService } from '../../organize';
import type { TagService } from '../../tag';
import type { WorkspaceService } from '../../workspace';
import { getNexioWorkspaceSchema } from '../../workspace';

const logger = new DebugLogger('import');

export type ImportRunContext = {
  signal?: AbortSignal;
  onProgress?: (progress: { completed: number; total: number }) => void;
};

export class ImportService extends Service {
  constructor(
    private readonly workspaceService: WorkspaceService,
    private readonly organizeService: OrganizeService,
    private readonly explorerIconService: ExplorerIconService,
    private readonly tagService: TagService
  ) {
    super();
  }

  async importMarkdownZip(file: File, context?: ImportRunContext) {
    const collection = this.workspaceService.workspace.docCollection;
    const commitService = this.createCommitService({ organize: true });
    if (BUILD_CONFIG.isElectron) {
      return commitNativeImport('markdownZip', file, commitService, context);
    }

    await preflightWebZipImport(file);
    const snapshot = await snapshotFile(file);
    const { batch } = await MarkdownTransformer.planMarkdownZip({
      collection,
      schema: getNexioWorkspaceSchema(),
      imported: snapshot,
      extensions: getStoreManager().config.init().value.get('store'),
    });
    return commitService.commitBatch(batch);
  }

  async importNotionZip(file: File, context?: ImportRunContext) {
    const collection = this.workspaceService.workspace.docCollection;
    const commitService = this.createCommitService({
      organize: true,
      explorerIcon: true,
    });
    if (BUILD_CONFIG.isElectron) {
      return commitNativeImport('notionZip', file, commitService, context);
    }

    await preflightWebZipImport(file);
    const snapshot = await snapshotFile(file);
    const format = await detectNotionZipFormat(snapshot);
    if (format === 'markdown') {
      const { batch } = await MarkdownTransformer.planNotionMarkdownZip({
        collection,
        schema: getNexioWorkspaceSchema(),
        imported: snapshot,
        extensions: getStoreManager().config.init().value.get('store'),
      });
      return commitService.commitBatch(batch);
    }
    const { batch } = await NotionHtmlTransformer.planNotionHtmlZip({
      collection,
      schema: getNexioWorkspaceSchema(),
      imported: snapshot,
      extensions: getStoreManager().config.init().value.get('store'),
    });
    return commitService.commitBatch(batch);
  }

  async importObsidianVault(files: File[], context?: ImportRunContext) {
    const collection = this.workspaceService.workspace.docCollection;
    const commitService = this.createCommitService({
      organize: true,
      explorerIcon: true,
    });
    if (!BUILD_CONFIG.isElectron) {
      await preflightWebFilesImport(files);
    }
    if (BUILD_CONFIG.isElectron) {
      return commitNativeImport('obsidian', files, commitService, context);
    }
    const { files: snapshots, warnings } = await snapshotReadableFiles(files);
    if (!snapshots.length) {
      throw new Error('No readable files were found in the selected folder.');
    }

    const { batch } = await ObsidianTransformer.planObsidianVault({
      collection,
      schema: getNexioWorkspaceSchema(),
      importedFiles: snapshots,
      extensions: getStoreManager().config.init().value.get('store'),
    });
    batch.warnings = [...(batch.warnings ?? []), ...warnings];
    return commitService.commitBatch(batch);
  }

  async importBearBackup(file: File, context?: ImportRunContext) {
    const collection = this.workspaceService.workspace.docCollection;
    const commitService = this.createCommitService({
      organize: true,
      tag: true,
    });
    if (BUILD_CONFIG.isElectron) {
      return commitNativeImport('bearZip', file, commitService, context);
    }

    await preflightWebZipImport(file);
    const snapshot = await snapshotFile(file);
    const { batch } = await BearTransformer.planBearBackup({
      collection,
      schema: getNexioWorkspaceSchema(),
      imported: snapshot,
      extensions: getStoreManager().config.init().value.get('store'),
    });
    return commitService.commitBatch(batch);
  }

  async importOneNote(file: File, context?: ImportRunContext) {
    const commitService = this.createCommitService({
      organize: true,
    });

    if (BUILD_CONFIG.isElectron) {
      return commitNativeImport('oneNote', file, commitService, context);
    }

    const collection = this.workspaceService.workspace.docCollection;
    const docIds: string[] = [];
    const warnings: ImportWarning[] = [];
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    if (file.name.endsWith('.onepkg') || file.name.endsWith('.zip')) {
      const unzip = new Unzip();
      await unzip.load(file);
      for (const entry of unzip) {
        if (entry.path.endsWith('.one')) {
          const buffer = await entry.content.arrayBuffer();
          const pageTitle = entry.path.replace(/.*[/\\]/, '').replace(/\.one$/, '');
          const parsed = extractOneNoteText(buffer, pageTitle);
          const docId = await MarkdownTransformer.importMarkdownToDoc({
            collection,
            schema: getNexioWorkspaceSchema(),
            markdown: parsed.markdown,
            fileName: parsed.title,
            extensions: getStoreManager().config.init().value.get('store'),
          });
          if (docId) docIds.push(docId);
        }
      }
    } else {
      const buffer = await file.arrayBuffer();
      const parsed = extractOneNoteText(buffer, baseName);
      const docId = await MarkdownTransformer.importMarkdownToDoc({
        collection,
        schema: getNexioWorkspaceSchema(),
        markdown: parsed.markdown,
        fileName: parsed.title,
        extensions: getStoreManager().config.init().value.get('store'),
      });
      if (docId) docIds.push(docId);
    }

    if (!docIds.length) {
      throw new Error('No importable content found in the selected OneNote file.');
    }

    return {
      docIds,
      warnings,
      entryId: docIds[0],
    };
  }

  private createCommitService(options: {
    organize?: boolean;
    explorerIcon?: boolean;
    tag?: boolean;
  }) {
    return new ImportCommitService({
      collection: this.workspaceService.workspace.docCollection,
      schema: getNexioWorkspaceSchema(),
      extensions: getStoreManager().config.init().value.get('store'),
      organizeService: options.organize ? this.organizeService : undefined,
      explorerIconService: options.explorerIcon
        ? this.explorerIconService
        : undefined,
      tagService: options.tag ? this.tagService : undefined,
      logger,
    });
  }
}

async function detectNotionZipFormat(file: File): Promise<'markdown' | 'html'> {
  const unzip = new Unzip();
  await unzip.load(file);
  let hasHtml = false;
  for (const entry of unzip) {
    const lower = entry.path.toLowerCase();
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.html') && !lower.endsWith('/index.html')) {
      hasHtml = true;
    }
  }
  if (hasHtml) return 'html';
  throw new Error('No Notion Markdown or HTML pages found in the archive');
}

async function snapshotReadableFiles(files: File[]) {
  const snapshots: File[] = [];
  const warnings: ImportWarning[] = [];
  for (const file of files) {
    try {
      snapshots.push(await snapshotFile(file));
    } catch (error) {
      const sourcePath = file.webkitRelativePath || file.name;
      const reason = error instanceof Error ? error.message : String(error);
      warnings.push({
        code: 'file-unreadable',
        message: `Skipped unreadable file: ${sourcePath}. ${reason}`,
        sourcePath,
      });
    }
  }
  return { files: snapshots, warnings };
}

function extractOneNoteText(
  buffer: ArrayBuffer,
  fallbackTitle: string
): { title: string; markdown: string } {
  const u16 = new Uint16Array(buffer);
  const strings: string[] = [];
  let current: number[] = [];

  for (let i = 0; i < u16.length; i++) {
    const code = u16[i];
    if (
      (code >= 32 && code < 0xd800) ||
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 0xe000 && code <= 0xfffd)
    ) {
      current.push(code);
    } else {
      if (current.length >= 2) {
        const str = String.fromCharCode(...current).trim();
        if (str.length > 0 && !/^[\x00-\x1f]+$/.test(str)) {
          strings.push(str);
        }
      }
      current = [];
    }
  }
  if (current.length >= 2) {
    const str = String.fromCharCode(...current).trim();
    if (str.length > 0) strings.push(str);
  }

  const cleanStrings = strings.filter(
    s =>
      s.length > 1 &&
      !/^[0-9a-f-]{32,}$/i.test(s) &&
      !/^\{[0-9a-f-]{32,}\}$/i.test(s)
  );

  const title = cleanStrings[0] || fallbackTitle || 'OneNote Page';
  const body =
    cleanStrings.slice(1).join('\n\n') || cleanStrings[0] || 'Imported OneNote content';

  return { title, markdown: `# ${title}\n\n${body}` };
}
