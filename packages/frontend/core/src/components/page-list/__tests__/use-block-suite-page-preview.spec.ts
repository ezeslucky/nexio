/**
 * @vitest-environment happy-dom
 */
import 'fake-indexeddb/auto';

import { getStoreManager } from '@nexio/core/canvas/manager/store';
import { type Store, Text } from '@canvas/nexio/store';
import { TestWorkspace } from '@canvas/nexio/store/test';
import { renderHook } from '@testing-library/react';
import { useAtomValue } from 'jotai';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { useCanvasPagePreview } from '../use-block-suite-page-preview';
let docCollection: TestWorkspace;

const extensions = getStoreManager().config.init().value.get('store');

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['requestIdleCallback'] });
  vi.mock('emoji-mart', () => {
    return {
      Picker: vi.fn(),
    };
  });
  docCollection = new TestWorkspace({ id: 'test' });
  docCollection.meta.initialize();
  const initPage = async (page: Store) => {
    page.load();
    expect(page).not.toBeNull();
    const pageBlockId = page.addBlock('nexio:page', {
      title: new Text(''),
    });
    const frameId = page.addBlock('nexio:note', {}, pageBlockId);
    page.addBlock('nexio:paragraph', {}, frameId);
  };
  const store = docCollection.createDoc('page0').getStore({ extensions });
  await initPage(store);
});

describe('useCanvasPagePreview', () => {
  test('basic', async () => {
    const page = docCollection.getDoc('page0')?.getStore();
    if (!page) {
      throw new Error('Page not found');
    }
    const id = page.addBlock(
      'nexio:paragraph',
      {
        text: new Text('Hello, world!'),
      },
      page.getModelsByFlavour('nexio:note')[0].id
    );
    const hook = renderHook(() => useAtomValue(useCanvasPagePreview(page)));
    expect(hook.result.current).toBe('Hello, world!');
    page.transact(() => {
      page.getModelById(id)!.text!.insert('Test', 0);
    });
    await new Promise(resolve => setTimeout(resolve, 100));
    hook.rerender();
    expect(hook.result.current).toBe('TestHello, world!');

    // Insert before
    page.addBlock(
      'nexio:paragraph',
      {
        text: new Text('First block!'),
      },
      page.getModelsByFlavour('nexio:note')[0].id,
      0
    );
    await new Promise(resolve => setTimeout(resolve, 100));
    hook.rerender();
    expect(hook.result.current).toBe('First block! TestHello, world!');
  });
});
