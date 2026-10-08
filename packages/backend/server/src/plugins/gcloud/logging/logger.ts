import { WinstonLogger } from 'nest-winston';

import { NexioLogger as RawNexioLogger } from '../../../base/logger';

export class NexioLogger extends WinstonLogger {
  override error(
    message: any,
    stackOrError?: Error | string | unknown,
    context?: string
  ) {
    super.error(
      message,
      RawNexioLogger.formatStack(stackOrError) as string,
      context
    );
  }
}
