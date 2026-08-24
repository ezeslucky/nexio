import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

export const DataViewBlockSpec: ExtensionType[] = [
  FlavourExtension('nexio:data-view'),
  BlockViewExtension('nexio:data-view', literal`nexio-data-view`),
];
