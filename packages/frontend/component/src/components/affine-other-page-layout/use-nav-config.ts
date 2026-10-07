import { useMemo } from 'react';

export const useNavConfig = () => {
  return useMemo(
    () => [
      {
        title: 'Download Desktop',
        path:
          BUILD_CONFIG.downloadUrl ||
          'https://github.com/ezeslucky/nexio/releases',
      },
    ],
    []
  );
};
