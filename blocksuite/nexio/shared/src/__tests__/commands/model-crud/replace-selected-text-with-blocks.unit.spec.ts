/**
 * @vitest-environment happy-dom
 */
import type { TextSelection } from '@blocksuite/std';
import { describe, expect, it } from 'vitest';

import { replaceSelectedTextWithBlocksCommand } from '../../../commands/model-crud/replace-selected-text-with-blocks';
import { nexio, block } from '../../../test-utils';

describe('commands/model-crud', () => {
  describe('replaceSelectedTextWithBlocksCommand', () => {
    it('should replace selected text with blocks when both first and last blocks are mergable blocks', () => {
      const host = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph id="111">111</nexio-paragraph>`,
        block`<nexio-code id="code"></nexio-code>`,
        block`<nexio-paragraph id="222">222</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel111</nexio-paragraph>
            <nexio-code id="code"></nexio-code>
            <nexio-paragraph id="paragraph-2">222ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are mergable blocks in single paragraph', () => {
      const host = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel<anchor></anchor>lo Wor<focus></focus>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph id="111">111</nexio-paragraph>`,
        block`<nexio-code id="code"></nexio-code>`,
        block`<nexio-paragraph id="222">222</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel111</nexio-paragraph>
            <nexio-code id="code"></nexio-code>
            <nexio-paragraph id="222">222ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when blocks contains only one mergable block', () => {
      const host = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [block`<nexio-paragraph id="111">111</nexio-paragraph>`]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel111ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when blocks contains only one mergable block in single paragraph', () => {
      const host = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel<anchor></anchor>lo Wor<focus></focus>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [block`<nexio-paragraph id="111">111</nexio-paragraph>`]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page id="page">
          <nexio-note id="note">
            <nexio-paragraph id="paragraph-1">Hel111ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only first block is mergable block', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph>Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph>111</nexio-paragraph>`,
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-paragraph>Hel111</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only first block is mergable block in single paragraph', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph>111</nexio-paragraph>`,
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel111</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only last block is mergable block', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph>Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
        block`<nexio-paragraph>111</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-paragraph>Hel</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>111ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when only last block is mergable block in single paragraph', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
        block`<nexio-paragraph>111</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>111ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when neither first nor last block is mergable block', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph>Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-paragraph>Hel</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when neither first nor last block is mergable block in single paragraph', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor></anchor>lo Wor<focus></focus>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-code></nexio-code>`,
        block`<nexio-code></nexio-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel</nexio-paragraph>
            <nexio-code></nexio-code>
            <nexio-code></nexio-code>
            <nexio-paragraph>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are mergable blocks with different types', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-paragraph>Hel<anchor />lo</nexio-paragraph>
            <nexio-paragraph>Wor<focus />ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-list>1.</nexio-list>`,
        block`<nexio-list>2.</nexio-list>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-paragraph>Hel</nexio-paragraph>
            <nexio-list>1.</nexio-list>
            <nexio-list>2.</nexio-list>
            <nexio-paragraph>ld</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when both first and last blocks are paragraphs, and cursor is at the end of the text-block with different types', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-list>Hel<anchor />lo</nexio-list>
            <nexio-list>Wor<focus />ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph>111</nexio-paragraph>`,
        block`<nexio-paragraph>222</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-list>Hel111</nexio-list>
            <nexio-list>222ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when first block is paragraph, and cursor is at the end of the text-block with different type  ', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-list>Hel<anchor />lo</nexio-list>
            <nexio-list>Wor<focus />ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-paragraph>111</nexio-paragraph>`,
        block`<nexio-code></nexio-code>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-list>Hel111</nexio-list>
            <nexio-code></nexio-code>
            <nexio-list>ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });

    it('should replace selected text with blocks when last block is paragraph, and cursor is at the end of the text-block with different type  ', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note>
            <nexio-list>Hel<anchor />lo</nexio-list>
            <nexio-list>Wor<focus />ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;

      const blocks = [
        block`<nexio-code></nexio-code>`,
        block`<nexio-paragraph>222</nexio-paragraph>`,
      ]
        .filter((b): b is NonNullable<typeof b> => b !== null)
        .map(b => b.model);

      const textSelection = host.selection.value[0] as TextSelection;

      host.command.exec(replaceSelectedTextWithBlocksCommand, {
        textSelection,
        blocks,
      });

      const expected = nexio`
        <nexio-page>
          <nexio-note >
            <nexio-list>Hel</nexio-list>
            <nexio-code></nexio-code>
            <nexio-list>222ld</nexio-list>
          </nexio-note>
        </nexio-page>
      `;
      expect(host.store).toEqualDoc(expected.store);
    });
  });
});
