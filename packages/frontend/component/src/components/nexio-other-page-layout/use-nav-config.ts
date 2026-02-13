import { useI18n } from '@nexio/i18n';
import { useMemo } from 'react';

export const useNavConfig = () => {
  const t = useI18n();
  return useMemo(
    () => [
      {
        title: t['com.nexio.other-page.nav.official-website'](),
        path: 'https://nexio.pro',
      },
      {
        title: t['com.nexio.other-page.nav.blog'](),
        path: 'https://nexio.pro/blog',
      },
      {
        title: t['com.nexio.other-page.nav.contact-us'](),
        path: 'https://nexio.pro/about-us',
      },
    ],
    [t]
  );
};
