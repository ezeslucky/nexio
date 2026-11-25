import { Injectable, Logger } from '@nestjs/common';

import { Models } from '../../models';

const STAFF = ['patraabhimanyu888@gmail.com', '@affine.pro'];

@Injectable()
export class FeatureService {
  protected logger = new Logger(FeatureService.name);

  constructor(private readonly models: Models) {}

  // ======== Admin ========
  isStaff(email: string) {
    if (email === 'patraabhimanyu888@gmail.com') {
      return true;
    }
    for (const domain of STAFF) {
      if (email.endsWith(domain)) {
        return true;
      }
    }
    return false;
  }

  isAdmin(userId: string) {
    return this.models.userFeature.has(userId, 'administrator');
  }

  addAdmin(userId: string) {
    return this.models.userFeature.add(userId, 'administrator', 'Admin user');
  }
}
