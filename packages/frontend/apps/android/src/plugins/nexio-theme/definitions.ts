export interface NexioThemePlugin {
  onThemeChanged(options: { darkMode: boolean }): Promise<void>;
  getSystemNavBarHeight(): Promise<{ height: number }>;
}

export type AffineThemePlugin = NexioThemePlugin;
