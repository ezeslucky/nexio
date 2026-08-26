import '../../style.css';

import * as databaseBlocks from '@canvas/nexio/blocks/database';
import * as noteBlocks from '@canvas/nexio/blocks/note';
import * as globalUtils from '@canvas/nexio/global/utils';
import * as services from '@canvas/nexio/shared/services';
import * as blockStd from '@canvas/nexio/std';
import * as store from '@canvas/nexio/store';
import * as nexioModel from '@canvas/nexio-model';
import * as editor from '@canvas/integration-test';
import { effects as itEffects } from '@canvas/integration-test/effects';
import { getTestStoreManager } from '@canvas/integration-test/store';

import { setupEdgelessTemplate } from '../_common/setup.js';
import { effects as commentEffects } from '../comment/effects.js';
import {
  createStarterDocCollection,
  initStarterDocCollection,
} from './utils/collection.js';
import { mountDefaultDocEditor } from './utils/setup-playground';
import { prepareTestApp } from './utils/test';

itEffects();
const storeManager = getTestStoreManager();
commentEffects();

async function main() {
  if (window.collection) return;

  setupEdgelessTemplate();

  const params = new URLSearchParams(location.search);
  const room = params.get('room') ?? Math.random().toString(16).slice(2, 8);
  const isE2E = room.startsWith('playwright');
  const collection = createStarterDocCollection(storeManager);

  if (isE2E) {
    Object.defineProperty(window, '$canvas', {
      value: Object.freeze({
        store,
        blocks: {
          database: databaseBlocks,
          note: noteBlocks,
        },
        global: { utils: globalUtils },
        services,
        editor,
        blockStd: blockStd,
        nexioModel: nexioModel,
      }),
    });
    await prepareTestApp(collection);

    return;
  }

  await initStarterDocCollection(collection);
  await mountDefaultDocEditor(collection);
}

main().catch(console.error);
