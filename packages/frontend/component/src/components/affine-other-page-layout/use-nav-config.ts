import { useMemo } from 'react';

export const useNavConfig = () => {
  return useMemo(
    () => [
      {
        title: 'Download App',
        path: '/download',
      },
    ],
    []
  );
};
