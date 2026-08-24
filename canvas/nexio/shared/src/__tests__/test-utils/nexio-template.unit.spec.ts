import { TextSelection } from '@canvas/std';
import { describe, expect, it } from 'vitest';

import { nexio } from '../../test-utils';

describe('helpers/nexio-template', () => {
  it('should create a basic document structure from template', () => {
    const host = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">Hello, world</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    expect(host.store).toBeDefined();

    const pageBlock = host.store.getBlock('page');
    expect(pageBlock).toBeDefined();
    expect(pageBlock?.flavour).toBe('nexio:page');

    const noteBlock = host.store.getBlock('note');
    expect(noteBlock).toBeDefined();
    expect(noteBlock?.flavour).toBe('nexio:note');

    const paragraphBlock = host.store.getBlock('paragraph-1');
    expect(paragraphBlock).toBeDefined();
    expect(paragraphBlock?.flavour).toBe('nexio:paragraph');
  });

  it('should handle nested blocks correctly', () => {
    const host = nexio`
      <nexio-page>
        <nexio-note>
          <nexio-paragraph>First paragraph</nexio-paragraph>
          <nexio-list>List item</nexio-list>
          <nexio-paragraph>Second paragraph</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const noteBlocks = host.store.getBlocksByFlavour('nexio:note');
    const paragraphBlocks = host.store.getBlocksByFlavour('nexio:paragraph');
    const listBlocks = host.store.getBlocksByFlavour('nexio:list');

    expect(noteBlocks.length).toBe(1);
    expect(paragraphBlocks.length).toBe(2);
    expect(listBlocks.length).toBe(1);

    const noteBlock = noteBlocks[0];
    const noteChildren =
      host.store.getBlock(noteBlock.id)?.model.children || [];
    expect(noteChildren.length).toBe(3);

    expect(noteChildren[0].flavour).toBe('nexio:paragraph');
    expect(noteChildren[1].flavour).toBe('nexio:list');
    expect(noteChildren[2].flavour).toBe('nexio:paragraph');
  });

  it('should handle empty blocks correctly', () => {
    const host = nexio`
      <nexio-page>
        <nexio-note>
          <nexio-paragraph></nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const paragraphBlocks = host.store.getBlocksByFlavour('nexio:paragraph');
    expect(paragraphBlocks.length).toBe(1);

    const paragraphBlock = host.store.getBlock(paragraphBlocks[0].id);
    const paragraphText = paragraphBlock?.model.text?.toString() || '';
    expect(paragraphText).toBe('');
  });

  it('should throw error on invalid template', () => {
    expect(() => {
      nexio`
        <unknown-tag></unknown-tag>
      `;
    }).toThrow();
  });

  it('should handle text selection with anchor and focus', () => {
    const host = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">Hel<anchor />lo</nexio-paragraph>
          <nexio-paragraph id="paragraph-2">Wo<focus />rld</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(3);
    expect(selection.from.length).toBe(2);
    expect(selection.to?.blockId).toBe('paragraph-2');
    expect(selection.to?.index).toBe(0);
    expect(selection.to?.length).toBe(2);
  });

  it('should handle cursor position', () => {
    const host = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">Hello<cursor />World</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(5);
    expect(selection.from.length).toBe(0);
    expect(selection.to).toBeNull();
  });

  it('should handle selection in empty blocks', () => {
    const host = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1"><cursor /></nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(0);
    expect(selection.from.length).toBe(0);
    expect(selection.to).toBeNull();
  });

  it('should handle single point selection', () => {
    const host = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">Hello<anchor></anchor>World<focus></focus>Nexio</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    const selection = host.selection.value[0] as TextSelection;
    expect(selection).toBeDefined();
    expect(selection.is(TextSelection)).toBe(true);
    expect(selection.from.blockId).toBe('paragraph-1');
    expect(selection.from.index).toBe(5);
    expect(selection.from.length).toBe(5);
    expect(selection.to).toBeNull();
  });
});
