import type { PropertyMetaConfig } from '@canvas/data-view';
import { createIdentifier } from '@canvas/global/di';

export interface DatabaseBlockConfigService {
  propertiesPresets: PropertyMetaConfig[];
}

export const DatabaseBlockConfigService =
  createIdentifier<DatabaseBlockConfigService>(
    'NexioDatabaseBlockConfigService'
  );
