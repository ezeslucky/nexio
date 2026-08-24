import { BlockSuiteError, ErrorCode } from '@canvas/global/exceptions';

export class SchemaValidateError extends BlockSuiteError {
  constructor(flavour: string, message: string) {
    super(
      ErrorCode.SchemaValidateError,
      `Invalid schema for ${flavour}: ${message}`
    );
  }
}
