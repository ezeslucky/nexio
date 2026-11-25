import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface RecordChangeDto {
  docId: string;
  workspaceId?: string;
  userId: string;
  authorType: 'user' | 'agent' | 'sub_agent';
  authorId: string;
  authorName: string;
  changeSummary: string;
  previousSnapshot?: string;
  currentSnapshot: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  lineNum: number;
}

@Injectable()
export class VersionHistoryService {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Compute line-by-line diff between previous and current snapshots
   */
  computeDiff(prevText: string = '', currText: string = ''): DiffLine[] {
    const prevLines = prevText.split('\n');
    const currLines = currText.split('\n');
    const diff: DiffLine[] = [];

    let p = 0;
    let c = 0;

    while (p < prevLines.length || c < currLines.length) {
      if (p < prevLines.length && c < currLines.length) {
        if (prevLines[p] === currLines[c]) {
          diff.push({ type: 'unchanged', text: currLines[c], lineNum: c + 1 });
          p++;
          c++;
        } else {
          // Line changed / removed / added
          diff.push({ type: 'removed', text: prevLines[p], lineNum: p + 1 });
          diff.push({ type: 'added', text: currLines[c], lineNum: c + 1 });
          p++;
          c++;
        }
      } else if (p < prevLines.length) {
        diff.push({ type: 'removed', text: prevLines[p], lineNum: p + 1 });
        p++;
      } else if (c < currLines.length) {
        diff.push({ type: 'added', text: currLines[c], lineNum: c + 1 });
        c++;
      }
    }

    return diff;
  }

  /**
   * Record a document change with author attribution (User vs Agent)
   */
  async recordChange(dto: RecordChangeDto) {
    if (!dto.docId || !dto.currentSnapshot) {
      throw new BadRequestException('docId and currentSnapshot are required.');
    }

    const diff = this.computeDiff(dto.previousSnapshot || '', dto.currentSnapshot);

    const additions = diff.filter(d => d.type === 'added').length;
    const deletions = diff.filter(d => d.type === 'removed').length;

    const diffData = {
      lines: diff,
      stats: { additions, deletions, totalLines: dto.currentSnapshot.split('\n').length },
    };

    return this.db.aiDocumentChangeHistory.create({
      data: {
        docId: dto.docId,
        workspaceId: dto.workspaceId,
        userId: dto.userId,
        authorType: dto.authorType,
        authorId: dto.authorId,
        authorName: dto.authorName,
        changeSummary: dto.changeSummary,
        diffData: diffData as any,
        previousSnapshot: dto.previousSnapshot,
        currentSnapshot: dto.currentSnapshot,
        isRestored: false,
      },
    });
  }

  /**
   * Get version history revisions for a document
   */
  async getDocumentHistory(docId: string, limit: number = 30) {
    return this.db.aiDocumentChangeHistory.findMany({
      where: { docId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        docId: true,
        authorType: true,
        authorId: true,
        authorName: true,
        changeSummary: true,
        diffData: true,
        isRestored: true,
        createdAt: true,
      },
    });
  }

  /**
   * Get full diff and snapshots for a specific revision
   */
  async getRevisionDiff(historyId: string) {
    const record = await this.db.aiDocumentChangeHistory.findUnique({
      where: { id: historyId },
    });

    if (!record) {
      throw new NotFoundException('Revision not found.');
    }

    return {
      id: record.id,
      docId: record.docId,
      authorType: record.authorType,
      authorName: record.authorName,
      changeSummary: record.changeSummary,
      diffData: record.diffData,
      previousSnapshot: record.previousSnapshot,
      currentSnapshot: record.currentSnapshot,
      createdAt: record.createdAt,
    };
  }

  /**
   * Restore document back to a historical version snapshot
   */
  async restoreRevision(historyId: string, userId: string, userName: string) {
    const targetRevision = await this.db.aiDocumentChangeHistory.findUnique({
      where: { id: historyId },
    });

    if (!targetRevision) {
      throw new NotFoundException('Revision to restore not found.');
    }

    // Get latest revision to compute restore diff
    const latestRevision = await this.db.aiDocumentChangeHistory.findFirst({
      where: { docId: targetRevision.docId },
      orderBy: { createdAt: 'desc' },
    });

    const restoreSummary = `Restored back to revision from ${new Date(targetRevision.createdAt).toLocaleString()} by ${targetRevision.authorName} (${targetRevision.authorType})`;

    // Create a new version history event marking the restore
    const restoredRecord = await this.recordChange({
      docId: targetRevision.docId,
      workspaceId: targetRevision.workspaceId || undefined,
      userId,
      authorType: 'user',
      authorId: userId,
      authorName: userName,
      changeSummary: restoreSummary,
      previousSnapshot: latestRevision?.currentSnapshot,
      currentSnapshot: targetRevision.currentSnapshot,
    });

    await this.db.aiDocumentChangeHistory.update({
      where: { id: restoredRecord.id },
      data: { isRestored: true },
    });

    return {
      success: true,
      restoredFromId: historyId,
      newRevisionId: restoredRecord.id,
      restoredContent: targetRevision.currentSnapshot,
      summary: restoreSummary,
    };
  }
}
