import type { NativeThemeMode } from './theme-mode';

export interface NexioThemePlugin {
  onThemeChanged(options: { themeMode: NativeThemeMode }): Promise<void>;
}

export type AffineThemePlugin = NexioThemePlugin;
