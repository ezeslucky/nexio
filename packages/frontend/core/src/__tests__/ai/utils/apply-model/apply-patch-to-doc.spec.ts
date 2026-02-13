/**
 * @vitest-environment happy-dom
 */
import { getInternalStoreExtensions } from '@blocksuite/nexio/extensions/store';
import { StoreExtensionManager } from '@blocksuite/nexio-ext-loader';
import { createNexioTemplate } from '@blocksuite/nexio-shared/test-utils';
import { describe, expect, it } from 'vitest';

import { applyPatchToDoc } from '../../../../blocksuite/ai/utils/apply-model/apply-patch-to-doc';
import type { PatchOp } from '../../../../blocksuite/ai/utils/apply-model/markdown-diff';

const manager = new StoreExtensionManager(getInternalStoreExtensions());
const { nexio } = createNexioTemplate(manager.get('store'));

describe('applyPatchToDoc', () => {
  it('should delete a block', async () => {
    const host = nexio`
    <nexio-page id="page">
      <nexio-note id="note">
        <nexio-paragraph id="paragraph-1">Hello</nexio-paragraph>
        <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
      </nexio-note>
    </nexio-page>
  `;

    const patch: PatchOp[] = [{ op: 'delete', id: 'paragraph-1' }];
    await applyPatchToDoc(host.store, patch);

    const expected = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });

  // FIXME: markdown parse error in test mode
  it.skip('should replace a block', async () => {
    const host = nexio`
    <nexio-page id="page">
      <nexio-note id="note">
        <nexio-paragraph id="paragraph-1">Hello</nexio-paragraph>
        <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
      </nexio-note>
    </nexio-page>
  `;

    const patch: PatchOp[] = [
      {
        op: 'replace',
        id: 'paragraph-1',
        content: 'New content',
      },
    ];

    await applyPatchToDoc(host.store, patch);

    const expected = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">New content</nexio-paragraph>
          <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });

  // FIXME: markdown parse error in test mode
  it.skip('should insert a block at index', async () => {
    const host = nexio`
    <nexio-page id="page">
      <nexio-note id="note">
        <nexio-paragraph id="paragraph-1">Hello</nexio-paragraph>
        <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
      </nexio-note>
    </nexio-page>
  `;

    const patch: PatchOp[] = [
      {
        op: 'insert',
        index: 2,
        after: 'paragraph-1',
        block: {
          id: 'paragraph-3',
          type: 'nexio:paragraph',
          content: 'Inserted',
        },
      },
    ];

    await applyPatchToDoc(host.store, patch);

    const expected = nexio`
      <nexio-page id="page">
        <nexio-note id="note">
          <nexio-paragraph id="paragraph-1">Hello</nexio-paragraph>
          <nexio-paragraph id="paragraph-2">World</nexio-paragraph>
          <nexio-paragraph id="paragraph-3">Inserted</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    expect(host.store).toEqualDoc(expected.store, {
      compareId: true,
    });
  });
});
