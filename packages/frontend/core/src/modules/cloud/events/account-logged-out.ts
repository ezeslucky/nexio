import { createEvent } from '@ezeslucky/infra';

import type { AuthAccountInfo } from '../entities/session';

export const AccountLoggedOut =
  createEvent<AuthAccountInfo>('AccountLoggedOut');
