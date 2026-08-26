import { CloudViewExtension } from '@nexio/core/canvas/view-extensions/cloud';
import { NexioEditorViewExtension } from '@nexio/core/canvas/view-extensions/editor-view/editor-view';
import { NexioThemeViewExtension } from '@nexio/core/canvas/view-extensions/theme';
import { I18n } from '@nexio/i18n';
import { CodeBlockViewExtension } from '@canvas/nexio/blocks/code/view';
import { DividerViewExtension } from '@canvas/nexio/blocks/divider/view';
import { LatexViewExtension as LatexBlockViewExtension } from '@canvas/nexio/blocks/latex/view';
import { ListViewExtension } from '@canvas/nexio/blocks/list/view';
import { NoteViewExtension } from '@canvas/nexio/blocks/note/view';
import { ParagraphViewExtension } from '@canvas/nexio/blocks/paragraph/view';
import { RootViewExtension } from '@canvas/nexio/blocks/root/view';
import {
  PeekViewExtension,
  type PeekViewService,
} from '@canvas/nexio/components/peek';
import {
  type ViewExtensionContext,
  ViewExtensionManager,
  ViewExtensionProvider,
} from '@canvas/nexio/ext-loader';
import { PlainTextClipboardConfig } from '@canvas/nexio/foundation/clipboard';
import { LatexInlineSpecExtension } from '@canvas/nexio/inlines/latex';
import { LatexViewExtension as LatexInlineViewExtension } from '@canvas/nexio/inlines/latex/view';
import { LinkInlineSpecExtension } from '@canvas/nexio/inlines/link';
import { LinkViewExtension } from '@canvas/nexio/inlines/link/view';
import { MentionInlineSpecExtension } from '@canvas/nexio/inlines/mention';
import { MentionViewExtension } from '@canvas/nexio/inlines/mention/view';
import {
  BackgroundInlineSpecExtension,
  BoldInlineSpecExtension,
  CodeInlineSpecExtension,
  ColorInlineSpecExtension,
  InlineSpecExtensions,
  ItalicInlineSpecExtension,
  StrikeInlineSpecExtension,
  UnderlineInlineSpecExtension,
} from '@canvas/nexio/inlines/preset';
import { ReferenceInlineSpecExtension } from '@canvas/nexio/inlines/reference';
import { ReferenceViewExtension } from '@canvas/nexio/inlines/reference/view';
import {
  DefaultOpenDocExtension,
  DocDisplayMetaService,
  DocModeService,
  FileSizeLimitService,
  FontConfigExtension,
  fontConfigSchema,
  FontLoaderService,
  PageViewportServiceExtension,
  ThemeService,
  ToolbarRegistryExtension,
} from '@canvas/nexio/shared/services';
import type { NexioTextAttributes } from '@canvas/nexio/shared/types';
import { InlineManagerExtension } from '@canvas/nexio/std/inline';
import { LinkedDocViewExtension } from '@canvas/nexio/widgets/linked-doc/view';
import { ToolbarViewExtension } from '@canvas/nexio/widgets/toolbar/view';
import { ViewportOverlayViewExtension } from '@canvas/nexio/widgets/viewport-overlay/view';
import type { FrameworkProvider } from '@ezeslucky/infra';
import { z } from 'zod';

import { createCommentLinkedWidgetConfig } from './linked-widget-config';

const commentEditorViewExtensionOptionsSchema = z.object({
  peekView: z.optional(z.custom<PeekViewService>()),
  fontConfig: z.optional(z.array(fontConfigSchema)),
});

export type CommentEditorViewExtensionOptions = z.infer<
  typeof commentEditorViewExtensionOptionsSchema
>;

class CommentEditorViewExtensionProvider extends ViewExtensionProvider<CommentEditorViewExtensionOptions> {
  override name = 'comment-editor';

  override schema = commentEditorViewExtensionOptionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: CommentEditorViewExtensionOptions
  ) {
    super.setup(context, options);
    context.register([
      ThemeService,
      DocModeService,
      DocDisplayMetaService,
      DefaultOpenDocExtension,
      FontLoaderService,
      ToolbarRegistryExtension,
      PageViewportServiceExtension,
      FileSizeLimitService,

      ...InlineSpecExtensions,
      InlineManagerExtension<NexioTextAttributes>({
        id: 'DefaultInlineManager',
        specs: [
          BoldInlineSpecExtension.identifier,
          ItalicInlineSpecExtension.identifier,
          UnderlineInlineSpecExtension.identifier,
          StrikeInlineSpecExtension.identifier,
          CodeInlineSpecExtension.identifier,
          BackgroundInlineSpecExtension.identifier,
          ColorInlineSpecExtension.identifier,
          LatexInlineSpecExtension.identifier,
          ReferenceInlineSpecExtension.identifier,
          LinkInlineSpecExtension.identifier,
          MentionInlineSpecExtension.identifier,
        ],
      }),

      PlainTextClipboardConfig,
    ]);

    if (options?.fontConfig) {
      context.register(FontConfigExtension(options.fontConfig));
    }
    if (options?.peekView) {
      context.register(PeekViewExtension(options.peekView));
    }
  }
}

let manager: ViewExtensionManager | null = null;
export function getCommentEditorViewManager(framework: FrameworkProvider) {
  if (!manager) {
    manager = new ViewExtensionManager([
      CommentEditorViewExtensionProvider,

      // Blocks
      CodeBlockViewExtension,
      DividerViewExtension,
      LatexBlockViewExtension,
      ListViewExtension,

      NoteViewExtension,
      ParagraphViewExtension,
      RootViewExtension,

      // Inline
      LinkViewExtension,
      ReferenceViewExtension,
      MentionViewExtension,
      LatexInlineViewExtension,

      // Widget
      ToolbarViewExtension,
      ViewportOverlayViewExtension,
      LinkedDocViewExtension,

      // nexio side
      NexioThemeViewExtension,
      NexioEditorViewExtension,

      // for rendering mentions
      CloudViewExtension,
    ]);

    manager.configure(ParagraphViewExtension, {
      getPlaceholder: () => {
        return I18n.t('com.nexio.notification.comment-prompt');
      },
    });

    manager.configure(
      LinkedDocViewExtension,
      createCommentLinkedWidgetConfig(framework)
    );

    manager.configure(CloudViewExtension, {
      framework,
      enableCloud: true,
    });
  }
  return manager;
}
