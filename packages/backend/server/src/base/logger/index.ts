import { Global, Module } from '@nestjs/common';

import { ConfigModule } from '../config';
import { NexioLogger } from './service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [NexioLogger],
  exports: [NexioLogger],
})
export class LoggerModule {}

export { NexioLogger } from './service';

// Backwards compatibility alias
export { NexioLogger as AFFiNELogger } from './service';
