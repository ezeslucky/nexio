import '@nexio/core/bootstrap/electron';
import '@nexio/core/bootstrap/cleanup';
import '@nexio/component/theme';
import './global.css';

import { apis } from '@nexio/electron-api';
import { bindNativeDBApis } from '@nexio/nbstore/sqlite';
import { bindNativeDBV1Apis } from '@nexio/nbstore/sqlite/v1';

// oxlint-disable-next-line no-non-null-assertion
bindNativeDBApis(apis!.nbstore);
// oxlint-disable-next-line no-non-null-assertion
bindNativeDBV1Apis(apis!.db);
