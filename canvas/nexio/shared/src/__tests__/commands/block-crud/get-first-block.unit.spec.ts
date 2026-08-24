/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';

import { getFirstBlockCommand } from '../../../commands/block-crud/get-first-content-block';
import { nexio } from '../../../test-utils';

describe('commands/block-crud', () => {
  describe('getFirstBlockCommand', () => {
    it('should return null when root is not exists', () => {
      const host = nexio`<nexio-page></nexio-page>`;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        root: undefined,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return first block with content role when found', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1-1">First Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-1-2">Second Paragraph</nexio-paragraph>
          </nexio-note>
          <nexio-note id="note-2">
            <nexio-paragraph id="paragraph-2-1">First Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2-2">Second Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with any role in the array when found', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1-1">First Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-1-2">Second Paragraph</nexio-paragraph>
          </nexio-note>
          <nexio-note id="note-2">
            <nexio-paragraph id="paragraph-2-1">First Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2-2">Second Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: ['hub', 'content'],
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with specified flavour when found', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Paragraph</nexio-paragraph>
            <nexio-list id="list-1">List Item</nexio-list>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: 'nexio:list',
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block with any flavour in the array when found', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Paragraph</nexio-paragraph>
            <nexio-list id="list-1">List Item</nexio-list>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: ['nexio:list', 'nexio:code'],
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block matching both role and flavour when both specified', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Content Paragraph</nexio-paragraph>
            <nexio-list id="list-1">Content List</nexio-list>
            <nexio-paragraph id="paragraph-2">hub Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;
      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        flavour: 'nexio:list',
        root: note,
      });

      expect(firstBlock?.id).toBe('list-1');
    });

    it('should return first block with default roles when role not specified', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">hub Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">Content Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-3">Hub Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        root: undefined,
      });

      expect(firstBlock?.id).toBe('note-1');
    });

    it('should return first block with specified role when found', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Content Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">hub Paragraph</nexio-paragraph>
            <nexio-database id="database-1">Database</nexio-database>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: note,
      });

      expect(firstBlock?.id).toBe('database-1');
    });

    it('should return null when no blocks with specified role are found in children', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Content Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">Another Content Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'hub',
        root: note,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return null when no blocks with specified flavour are found in children', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1">Paragraph</nexio-paragraph>
            <nexio-paragraph id="paragraph-2">Another Paragraph</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-1')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        flavour: 'nexio:list',
        root: note,
      });

      expect(firstBlock).toBeNull();
    });

    it('should return first block with specified role within specified root subtree', () => {
      const host = nexio`
        <nexio-page>
          <nexio-note id="note-1">
            <nexio-paragraph id="paragraph-1-1">1-1 Content</nexio-paragraph>
            <nexio-paragraph id="paragraph-1-2">1-2 hub</nexio-paragraph>
          </nexio-note>
          <nexio-note id="note-2">
            <nexio-paragraph id="paragraph-2-1">2-1 hub</nexio-paragraph>
            <nexio-paragraph id="paragraph-2-2">2-2 Content</nexio-paragraph>
          </nexio-note>
        </nexio-page>
      `;

      const note = host.store.getBlock('note-2')?.model;

      const [_, { firstBlock }] = host.command.exec(getFirstBlockCommand, {
        role: 'content',
        root: note,
      });

      expect(firstBlock?.id).toBe('paragraph-2-1');
    });
  });
});
