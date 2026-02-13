import { createIdentifier } from '@blocksuite/global/di';
import type { DisposableMember } from '@blocksuite/global/disposable';
import type { BaseSelection, ExtensionType } from '@blocksuite/store';

export type CommentId = string;


export interface CommentProvider {
  addComment: (selections: BaseSelection[]) => void;
  resolveComment: (id: CommentId) => void;
  highlightComment: (id: CommentId | null) => void;

  getComments: (
    type: 'resolved' | 'unresolved' | 'all'
  ) => Promise<CommentId[]> | CommentId[];

  onCommentAdded: (
    callback: (id: CommentId, selections: BaseSelection[]) => void
  ) => DisposableMember;
  onCommentResolved: (callback: (id: CommentId) => void) => DisposableMember;
  onCommentDeleted: (callback: (id: CommentId) => void) => DisposableMember;
  onCommentHighlighted: (
    callback: (id: CommentId | null) => void
  ) => DisposableMember;
}

export const CommentProviderIdentifier =
  createIdentifier<CommentProvider>('comment-provider');

export const CommentProviderExtension = (
  provider: CommentProvider
): ExtensionType => {
  return {
    setup: di => {
      di.addImpl(CommentProviderIdentifier, provider);
    },
  };
};
