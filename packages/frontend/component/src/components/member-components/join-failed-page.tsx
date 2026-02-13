import { AuthPageContainer } from '@nexio/component/auth-components';
import { UserFriendlyError } from '@nexio/error';
import { ErrorNames, type GetInviteInfoQuery } from '@nexio/graphql';
import { Trans, useI18n } from '@nexio/i18n';

import { Avatar } from '../../ui/avatar';
import * as styles from './styles.css';

export const JoinFailedPage = ({
  inviteInfo,
  error,
}: {
  inviteInfo?: GetInviteInfoQuery['getInviteInfo'];
  error?: any;
}) => {
  const userFriendlyError = UserFriendlyError.fromAny(error);
  const t = useI18n();
  return (
    <AuthPageContainer
      title={t['com.nexio.fail-to-join-workspace.title']()}
      subtitle={
        userFriendlyError.name === ErrorNames.MEMBER_QUOTA_EXCEEDED ? (
          <div className={styles.lineHeight}>
            <Trans
              i18nKey={'com.nexio.fail-to-join-workspace.description-1'}
              components={{
                1: (
                  <div className={styles.avatarWrapper}>
                    <Avatar
                      url={`data:image/png;base64,${inviteInfo?.workspace.avatar}`}
                      name={inviteInfo?.workspace.name}
                      size={20}
                      colorfulFallback
                    />
                  </div>
                ),
                2: <span className={styles.inviteName} />,
              }}
              values={{
                workspaceName: inviteInfo?.workspace.name,
              }}
            />
            <div>{t['com.nexio.fail-to-join-workspace.description-2']()}</div>
          </div>
        ) : (
          <div>
            {t['error.' + userFriendlyError.name]()}
            <br />
            {userFriendlyError.message}
          </div>
        )
      }
    />
  );
};
