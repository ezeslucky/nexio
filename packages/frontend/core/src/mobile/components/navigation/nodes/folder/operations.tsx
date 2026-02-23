import { MenuItem } from '@nexio/component';
import { IsFavoriteIcon } from '@nexio/core/components/pure/icons';
import { CompatibleFavoriteItemsAdapter } from '@nexio/core/modules/favorite';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useMemo } from 'react';

export const FavoriteFolderOperation = ({ id }: { id: string }) => {
  const t = useI18n();
  const compatibleFavoriteItemsAdapter = useService(
    CompatibleFavoriteItemsAdapter
  );

  const favorite = useLiveData(
    useMemo(() => {
      return compatibleFavoriteItemsAdapter.isFavorite$(id, 'folder');
    }, [compatibleFavoriteItemsAdapter, id])
  );

  return (
    <MenuItem
      prefixIcon={<IsFavoriteIcon favorite={favorite} />}
      onClick={() => compatibleFavoriteItemsAdapter.toggle(id, 'folder')}
    >
      {favorite
        ? t['com.nexio.rootAppSidebar.organize.folder-rm-favorite']()
        : t['com.nexio.rootAppSidebar.organize.folder-add-favorite']()}
    </MenuItem>
  );
};
