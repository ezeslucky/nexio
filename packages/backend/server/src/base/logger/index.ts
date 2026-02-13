import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { NEXIOLogger } from './service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NEXIOLogger],
  exports: [NEXIOLogger],
})
export class LoggerModule {}

export { NEXIOLogger } from './service';
