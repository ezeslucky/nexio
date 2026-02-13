import { WinstonLogger } from 'nest-winston';

import { NEXIOLogger as RawNEXIOLogger } from '../../../base/logger';

export class NEXIOLogger extends WinstonLogger {
  override error(
    message: any,
    stackOrError?: Error | string | unknown,
    context?: string
  ) {
    super.error(
      message,
      RawNEXIOLogger.formatStack(stackOrError) as string,
      context
    );
  }
}
