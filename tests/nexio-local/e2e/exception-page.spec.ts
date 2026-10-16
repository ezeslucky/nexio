import { test } from '@nexio-test/kit/playwright';
import { open404Page } from '@nexio-test/kit/utils/load-page';
import { expect } from '@playwright/test';

test('visit 404 page', async ({ page }) => {
  await open404Page(page);
  const notFoundTip = page.getByTestId('not-found');
  await expect(notFoundTip).toBeVisible();
});
