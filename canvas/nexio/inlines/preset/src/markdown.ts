import { LatexExtension } from '@canvas/nexio-inline-latex';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { InlineMarkdownExtension } from '@canvas/std/inline';
import type { ExtensionType } from '@canvas/store';

// inline markdown match rules:
// covert: ***test*** + space
// covert: ***t est*** + space
// not convert: *** test*** + space
// not convert: ***test *** + space
// not convert: *** test *** + space

export const BoldItalicMarkdown = InlineMarkdownExtension<NexioTextAttributes>(
  {
    name: 'bolditalic',
    pattern: /.*\*{3}([^\s*][^*]*[^\s*])\*{3}\s$|.*\*{3}([^\s*])\*{3}\s$/,
    action: ({
      inlineEditor,
      prefixText,
      inlineRange,
      pattern,
      undoManager,
    }) => {
      const match = prefixText.match(pattern);
      if (!match) return;

      const targetText = match[1] ?? match[2];
      const annotatedText = match[0].slice(
        -(targetText.length + 3 * 2 + 1),
        -1
      );
      const startIndex = inlineRange.index - annotatedText.length - 1;

      undoManager.stopCapturing();

      inlineEditor.formatText(
        {
          index: startIndex,
          length: annotatedText.length,
        },
        {
          bold: true,
          italic: true,
        }
      );

      inlineEditor.deleteText({
        index: inlineRange.index - 4,
        length: 4,
      });
      inlineEditor.deleteText({
        index: startIndex,
        length: 3,
      });
      inlineEditor.setInlineRange({
        index: startIndex + annotatedText.length - 6,
        length: 0,
      });
    },
  }
);

export const BoldMarkdown = InlineMarkdownExtension<NexioTextAttributes>({
  name: 'bold',
  pattern: /.*\*{2}([^\s][^*]*[^\s*])\*{2}\s$|.*\*{2}([^\s*])\*{2}\s$/,
  action: ({ inlineEditor, prefixText, inlineRange, pattern, undoManager }) => {
    const match = prefixText.match(pattern);
    if (!match) return;

    const targetText = match[1] ?? match[2];
    const annotatedText = match[0].slice(-(targetText.length + 2 * 2 + 1), -1);
    const startIndex = inlineRange.index - annotatedText.length - 1;

    undoManager.stopCapturing();

    inlineEditor.formatText(
      {
        index: startIndex,
        length: annotatedText.length,
      },
      {
        bold: true,
      }
    );

    inlineEditor.deleteText({
      index: inlineRange.index - 3,
      length: 3,
    });
    inlineEditor.deleteText({
      index: startIndex,
      length: 2,
    });
    inlineEditor.setInlineRange({
      index: startIndex + annotatedText.length - 4,
      length: 0,
    });
  },
});

export const ItalicExtension = InlineMarkdownExtension<NexioTextAttributes>({
  name: 'italic',
  pattern: /.*\*{1}([^\s][^*]*[^\s*])\*{1}\s$|.*\*{1}([^\s*])\*{1}\s$/,
  action: ({ inlineEditor, prefixText, inlineRange, pattern, undoManager }) => {
    const match = prefixText.match(pattern);
    if (!match) return;

    const targetText = match[1] ?? match[2];
    const annotatedText = match[0].slice(-(targetText.length + 1 * 2 + 1), -1);
    const startIndex = inlineRange.index - annotatedText.length - 1;

    undoManager.stopCapturing();

    inlineEditor.formatText(
      {
        index: startIndex,
        length: annotatedText.length,
      },
      {
        italic: true,
      }
    );

    inlineEditor.deleteText({
      index: inlineRange.index - 2,
      length: 2,
    });
    inlineEditor.deleteText({
      index: startIndex,
      length: 1,
    });
    inlineEditor.setInlineRange({
      index: startIndex + annotatedText.length - 2,
      length: 0,
    });
  },
});

export const StrikethroughExtension =
  InlineMarkdownExtension<NexioTextAttributes>({
    name: 'strikethrough',
    pattern: /.*~{2}([^\s][^~]*[^\s])~{2}\s$|.*~{2}([^\s~])~{2}\s$/,
    action: ({
      inlineEditor,
      prefixText,
      inlineRange,
      pattern,
      undoManager,
    }) => {
      const match = prefixText.match(pattern);
      if (!match) return;

      const targetText = match[1] ?? match[2];
      const annotatedText = match[0].slice(
        -targetText.length - (2 * 2 + 1),
        -1
      );
      const startIndex = inlineRange.index - annotatedText.length - 1;

      undoManager.stopCapturing();

      inlineEditor.formatText(
        {
          index: startIndex,
          length: annotatedText.length,
        },
        {
          strike: true,
        }
      );

      inlineEditor.deleteText({
        index: inlineRange.index - 3,
        length: 3,
      });
      inlineEditor.deleteText({
        index: startIndex,
        length: 2,
      });

      inlineEditor.setInlineRange({
        index: startIndex + annotatedText.length - 4,
        length: 0,
      });
    },
  });

export const UnderthroughExtension =
  InlineMarkdownExtension<NexioTextAttributes>({
    name: 'underthrough',
    pattern: /.*~{1}([^\s][^~]*[^\s~])~{1}\s$|.*~{1}([^\s~])~{1}\s$/,
    action: ({
      inlineEditor,
      prefixText,
      inlineRange,
      pattern,
      undoManager,
    }) => {
      const match = prefixText.match(pattern);
      if (!match) return;

      const targetText = match[1] ?? match[2];
      const annotatedText = match[0].slice(
        -(targetText.length + 1 * 2 + 1),
        -1
      );
      const startIndex = inlineRange.index - annotatedText.length - 1;

      undoManager.stopCapturing();

      inlineEditor.formatText(
        {
          index: startIndex,
          length: annotatedText.length,
        },
        {
          underline: true,
        }
      );

      inlineEditor.deleteText({
        index: inlineRange.index - 2,
        length: 2,
      });
      inlineEditor.deleteText({
        index: startIndex,
        length: 1,
      });

      inlineEditor.setInlineRange({
        index: startIndex + annotatedText.length - 2,
        length: 0,
      });
    },
  });

export const CodeExtension = InlineMarkdownExtension<NexioTextAttributes>({
  name: 'code',
  pattern: /.*`([^\s][^`]*[^\s])`\s$|.*`([^\s`])`\s$/,
  action: ({ inlineEditor, prefixText, inlineRange, pattern, undoManager }) => {
    const match = prefixText.match(pattern);
    if (!match) return;

    const targetText = match[1] ?? match[2];
    const annotatedText = match[0].slice(-(targetText.length + 1 * 2 + 1), -1);
    const startIndex = inlineRange.index - annotatedText.length - 1;

    undoManager.stopCapturing();

    inlineEditor.formatText(
      {
        index: startIndex,
        length: annotatedText.length,
      },
      {
        code: true,
      }
    );

    inlineEditor.deleteText({
      index: inlineRange.index - 2,
      length: 2,
    });
    inlineEditor.deleteText({
      index: startIndex,
      length: 1,
    });

    inlineEditor.setInlineRange({
      index: startIndex + annotatedText.length - 2,
      length: 0,
    });
  },
});

export const MarkdownExtensions: ExtensionType[] = [
  BoldItalicMarkdown,
  BoldMarkdown,
  ItalicExtension,
  StrikethroughExtension,
  UnderthroughExtension,
  CodeExtension,
  LatexExtension,
];
