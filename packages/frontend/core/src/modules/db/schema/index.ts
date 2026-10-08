export type { DocCustomPropertyInfo, DocProperties } from './schema';
export {
  NEXIO_WORKSPACE_DB_SCHEMA,
  NEXIO_WORKSPACE_USERDATA_DB_SCHEMA,
  type NexioWorkspaceDbSchema,
  type NexioWorkspaceUserdataDbSchema,
} from './schema';

// Backwards compatibility aliases
export { NEXIO_WORKSPACE_DB_SCHEMA as AFFiNE_WORKSPACE_DB_SCHEMA, NEXIO_WORKSPACE_USERDATA_DB_SCHEMA as AFFiNE_WORKSPACE_USERDATA_DB_SCHEMA } from './schema';
export type { NexioWorkspaceDbSchema as AFFiNEWorkspaceDbSchema, NexioWorkspaceUserdataDbSchema as AFFiNEWorkspaceUserdataDbSchema } from './schema';
