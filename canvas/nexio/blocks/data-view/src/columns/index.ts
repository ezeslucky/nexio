import { richTextColumnConfig } from '@canvas/nexio-block-database';
import type { PropertyMetaConfig } from '@canvas/data-view';
import { propertyPresets } from '@canvas/data-view/property-presets';

export const queryBlockColumns = [
  propertyPresets.datePropertyConfig,
  propertyPresets.numberPropertyConfig,
  propertyPresets.progressPropertyConfig,
  propertyPresets.selectPropertyConfig,
  propertyPresets.multiSelectPropertyConfig,
  propertyPresets.checkboxPropertyConfig,
];
export const queryBlockHiddenColumns: PropertyMetaConfig<
  string,
  any,
  any,
  any
>[] = [richTextColumnConfig];
const queryBlockAllColumns = [...queryBlockColumns, ...queryBlockHiddenColumns];
export const queryBlockAllColumnMap = Object.fromEntries(
  queryBlockAllColumns.map(v => [v.type, v as PropertyMetaConfig])
);
