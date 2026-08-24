import type { DocMode } from '@canvas/nexio/model';
import type { Chain, EditorHost, InitCommandCtx } from '@canvas/nexio/std';
import type { TemplateResult } from 'lit';

export interface AIItemGroupConfig {
  name?: string;
  testId?: string;
  items: AIItemConfig[];
}

export interface AIItemConfig {
  name: string;
  testId: string;
  icon: TemplateResult | (() => HTMLElement);
  showWhen?: (
    chain: Chain<InitCommandCtx>,
    editorMode: DocMode,
    host: EditorHost
  ) => boolean;
  subItem?: AISubItemConfig[];
  subItemOffset?: [number, number];
  handler?: (host: EditorHost) => void;
  beta?: boolean;
}

export interface AISubItemConfig {
  type: string;
  testId?: string;
  handler?: (host: EditorHost) => void;
}
