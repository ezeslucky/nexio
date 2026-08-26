import { test } from '@nexio-test/kit/playwright';
import { openHomePage } from '@nexio-test/kit/utils/load-page';
import {
  clickNewPageButton,
  getCanvasEditorTitle,
  getPageByTitle,
  getPageOperationButton,
  waitForEditorLoad,
} from '@nexio-test/kit/utils/page-logic';
import { getCurrentDocIdFromUrl } from '@nexio-test/kit/utils/url';
import { expect } from '@playwright/test';

test('New a page , then delete it in all pages, finally find it in trash', async ({
  page,
  workspace,
}) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
  await clickNewPageButton(page);
  await getCanvasEditorTitle(page).click();
  await getCanvasEditorTitle(page).fill('this is a new page to delete');
  const newPageId = getCurrentDocIdFromUrl(page);
  await page.getByTestId('all-pages').click();
  const cell = await getPageByTitle(page, 'this is a new page to delete');
  await expect(cell).toBeVisible();

  await getPageOperationButton(page, newPageId).click();
  const deleteBtn = page.getByTestId('doc-list-operation-trash');
  await deleteBtn.click();
  const confirmTip = page.getByRole('dialog', { name: 'Delete doc?' });
  await expect(confirmTip).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();

  await page.getByTestId('trash-page').click();
  await expect(page.getByText('this is a new page to delete')).toBeVisible();
  const currentWorkspace = await workspace.current();

  expect(currentWorkspace.meta.flavour).toContain('local');
});
