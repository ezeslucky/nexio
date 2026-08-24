import { type NexioTheme, darkTheme, lightTheme } from '@ezeslucky/theme';
import {
  type NexioThemeKeyV2,
  darkThemeV2,
  lightThemeV2,
} from '@ezeslucky/theme/v2';
import { useTheme } from 'next-themes';

export const useThemeValueV2 = (key: NexioThemeKeyV2) => {
  const { resolvedTheme } = useTheme();

  return resolvedTheme === 'dark' ? darkThemeV2[key] : lightThemeV2[key];
};

export const useThemeValueV1 = (key: keyof Omit<NexioTheme, 'editorMode'>) => {
  const { resolvedTheme } = useTheme();

  return resolvedTheme === 'dark' ? darkTheme[key] : lightTheme[key];
};
