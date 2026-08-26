import { ErrorCode } from './code.js';

export class CanvasError extends Error {
  static ErrorCode = ErrorCode;

  code: ErrorCode;

  isFatal: boolean;

  constructor(code: ErrorCode, message: string, options?: { cause: Error }) {
    super(message, options);
    this.name = 'CanvasError';
    this.code = code;
    this.isFatal = code >= 10000;
  }
}

export function handleError(error: Error) {
  if (!(error instanceof CanvasError)) {
    throw error;
  }

  if (error.isFatal) {
    throw new Error(
      'A fatal error for Canvas occurs, please contact the team if you find this.',
      { cause: error }
    );
  }

  console.error(
    "A runtime error for Canvas occurs, you can ignore this error if it won't break the user experience."
  );
  console.error(error.stack);
}

export * from './code.js';
