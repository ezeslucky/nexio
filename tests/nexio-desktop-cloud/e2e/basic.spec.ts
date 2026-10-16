import { test } from '@nexio-test/kit/electron';
import {
  createRandomUser,
  enableCloudWorkspace,
  loginUser,
} from '@nexio-test/kit/utils/cloud';
import { waitForEditorLoad } from '@nexio-test/kit/utils/page-logic';
import { createLocalWorkspace } from '@nexio-test/kit/utils/workspace';

process.env.DEV_SERVER_URL = 'http://localhost:8080';

let user: {
  name: string;
  email: string;
  password: string;
};

test.beforeEach(async () => {
  user = await createRandomUser();
});

test('new page', async ({ page }) => {
  await loginUser(page, user, {
    isElectron: true,
  });
  await waitForEditorLoad(page);
  await createLocalWorkspace(
    {
      name: 'test',
    },
    page
  );
  await enableCloudWorkspace(page);
});
