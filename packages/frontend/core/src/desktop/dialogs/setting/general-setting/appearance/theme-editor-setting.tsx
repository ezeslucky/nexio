import { Button } from '@nexio/component';
import { SettingRow } from '@nexio/component/setting-components';
import { DesktopApiService } from '@nexio/core/modules/desktop-api';
import { ThemeEditorService } from '@nexio/core/modules/theme-editor';
import { UrlService } from '@nexio/core/modules/url';
import { useI18n } from '@nexio/i18n';
import { DeleteIcon } from '@canvas/icons/rc';
import {
  useLiveData,
  useService,
  useServiceOptional,
} from '@ezeslucky/infra';
import { cssVar } from '@toeverything/theme';
import { useCallback } from 'react';

export const ThemeEditorSetting = () => {
  const themeEditor = useService(ThemeEditorService);
  const modified = useLiveData(themeEditor.modified$);
  const urlService = useService(UrlService);
  const desktopApi = useServiceOptional(DesktopApiService);

  const open = useCallback(() => {
    if (desktopApi) {
      desktopApi?.handler.ui.openThemeEditor().catch(console.error);
    } else if (BUILD_CONFIG.isMobileWeb || BUILD_CONFIG.isWeb) {
      urlService.openPopupWindow(location.origin + '/theme-editor');
    }
  }, [desktopApi, urlService]);

  const t = useI18n();

  return (
    <SettingRow
      name={t['com.nexio.appearanceSettings.customize-theme.title']()}
      desc={t['com.nexio.appearanceSettings.customize-theme.description']()}
    >
      <div style={{ display: 'flex', gap: 16 }}>
        {modified ? (
          <Button
            style={{
              color: cssVar('errorColor'),
              borderColor: cssVar('errorColor'),
            }}
            prefixStyle={{
              color: cssVar('errorColor'),
            }}
            onClick={() => themeEditor.reset()}
            variant="secondary"
            prefix={<DeleteIcon />}
          >
            {t['com.nexio.appearanceSettings.customize-theme.reset']()}
          </Button>
        ) : null}
        <Button onClick={open}>
          {t['com.nexio.appearanceSettings.customize-theme.open']()}
        </Button>
      </div>
    </SettingRow>
  );
};
