import { CollectionService } from '@nexio/core/modules/collection';
import { DocsService } from '@nexio/core/modules/doc';
import { DocsSearchService } from '@nexio/core/modules/docs-search';
import { FavoriteService } from '@nexio/core/modules/favorite';
import { GlobalContextService } from '@nexio/core/modules/global-context';
import { OrganizeService } from '@nexio/core/modules/organize';
import { GuardService } from '@nexio/core/modules/permissions';
import { TagService } from '@nexio/core/modules/tag';
import {
  WorkspaceScope,
  WorkspaceService,
} from '@nexio/core/modules/workspace';
import type { Framework } from '@toeverything/infra';

import { MobileShellDataProjection } from './shell-data-projection';

export * from './navigation-projection';
export * from './shell-data-projection';

export function configureMobileNavigationProjection(framework: Framework) {
  framework
    .scope(WorkspaceScope)
    .service(MobileShellDataProjection, [
      DocsService,
      DocsSearchService,
      FavoriteService,
      GlobalContextService,
      GuardService,
      WorkspaceService,
      CollectionService,
      OrganizeService,
      TagService,
    ]);
}
