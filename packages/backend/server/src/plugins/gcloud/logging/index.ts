import { Global, Module } from '@nestjs/common';

import { LoggerProvider } from './service';

@Global()
@Module({
  providers: [LoggerProvider],
  exports: [LoggerProvider],
})
export class GCloudLogging {}

export { NEXIOLogger } from './logger';
