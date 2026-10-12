import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response } from 'express';

import { ServerService } from '../config';

@Injectable()
export class SetupMiddleware implements NestMiddleware {
  constructor(private readonly server: ServerService) {}

  use = (req: Request, res: Response, next: (error?: Error | any) => void) => {
    if (!env.selfhosted) {
      next();
      return;
    }

    // never throw
    this.server
      .initialized()
      .then(initialized => {
        // Only guard /admin paths for setup wizard
        if (req.path.startsWith('/admin')) {
          if (!initialized && req.path !== '/admin/setup') {
            res.redirect('/admin/setup');
            return;
          }
          if (initialized && req.path === '/admin/setup') {
            res.redirect('/');
            return;
          }
        }

        next();
      })
      .catch(() => {
        next();
      });
  };
}
