import type {
  AuthService,
  PublicUserService,
} from '@nexio/core/modules/cloud';
import { UserFriendlyError } from '@nexio/error';
import {
  type NexioUserInfo,
  UserServiceExtension,
} from '@canvas/nexio/shared/services';

export function patchUserExtensions(
  publicUserService: PublicUserService,
  authService: AuthService
) {
  return UserServiceExtension({
    // eslint-disable-next-line rxjs/finnish
    currentUserInfo$: authService.session.account$.map(account => {
      if (!account) {
        return null;
      }
      return {
        id: account.id,
        name: account.label,
        avatar: account.avatar,
        removed: false,
      } as NexioUserInfo;
    }).signal,
    // eslint-disable-next-line rxjs/finnish
    userInfo$(id) {
      return publicUserService.publicUser$(id).signal;
    },
    // eslint-disable-next-line rxjs/finnish
    isLoading$(id) {
      return publicUserService.isLoading$(id).signal;
    },
    // eslint-disable-next-line rxjs/finnish
    error$(id) {
      return publicUserService.error$(id).selector(error => {
        if (error) {
          return UserFriendlyError.fromAny(error).name;
        } else {
          return null;
        }
      }).signal;
    },
    revalidateUserInfo(id) {
      publicUserService.revalidate(id);
    },
  });
}
