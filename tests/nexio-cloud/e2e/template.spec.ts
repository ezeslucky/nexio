import { test } from '@nexio-test/kit/playwright';
import { createRandomUser, loginUser } from '@nexio-test/kit/utils/cloud';
import { waitForEditorLoad } from '@nexio-test/kit/utils/page-logic';

test.beforeEach(async ({ page }) => {
  const user = await createRandomUser();
  await loginUser(page, user);
});

test('import from template should work', async ({ page }) => {
  await page.goto('https://nexio.pro/templates', { waitUntil: 'load' });

  await page.click('.template-list > a:first-child');
  const importLink = page.getByText('Use this template');

  const href = await importLink.evaluate((el: HTMLElement) => {
    const a = el.closest('a');
    if (!a) {
      throw new Error('Import link not found');
    }
    return a.href;
  });

  const url = new URL(href);

  await page.goto(url.pathname + url.search);

  const btn = page.getByTestId('import-template-to-workspace-btn');

  await btn.isVisible();
  await btn.click();
  await waitForEditorLoad(page);
});
