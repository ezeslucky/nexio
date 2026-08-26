import { CanvasError, ErrorCode } from '@canvas/global/exceptions';

export class SchemaValidateError extends CanvasError {
  constructor(flavour: string, message: string) {
    super(
      ErrorCode.SchemaValidateError,
      `Invalid schema for ${flavour}: ${message}`
    );
  }
}
