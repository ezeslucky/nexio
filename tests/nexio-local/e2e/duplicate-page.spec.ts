import { test } from '@nexio-test/kit/playwright';
import { openHomePage } from '@nexio-test/kit/utils/load-page';
import {
  clickNewPageButton,
  clickPageMoreActions,
  getCanvasEditorTitle,
  waitForEditorLoad,
} from '@nexio-test/kit/utils/page-logic';
import { expect } from '@playwright/test';

test('Duplicate page should work', async ({ page }) => {
  await openHomePage(page);
  await waitForEditorLoad(page);
  await clickNewPageButton(page);
  const title = getCanvasEditorTitle(page);
  await expect(title).toBeVisible();
  await title.fill('test');
  await clickPageMoreActions(page);
  const duplicateButton = page.getByTestId('editor-option-menu-duplicate');
  await duplicateButton.click();
  const title2 = getCanvasEditorTitle(page);
  await expect(title2).toHaveText('test(1)');
});
