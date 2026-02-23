import { Button } from '@nexio/component';
import { AuthPageContainer } from '@nexio/component/auth-components';
import { useNavigateHelper } from '@nexio/core/components/hooks/use-navigate-helper';
import { GraphQLService } from '@nexio/core/modules/cloud';
import { UserFriendlyError } from '@nexio/error';
import { verifyEmailMutation } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import { useService } from '@ezeslucky/infra';
import { type FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { AppContainer } from '../../components/app-container';

export const ConfirmVerifiedEmail: FC<{
  onopenNEXIO: () => void;
}> = ({ onopenNEXIO }) => {
  const t = useI18n();
  const graphqlService = useService(GraphQLService);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigateHelper = useNavigateHelper();

  useEffect(() => {
    (async () => {
      const token = searchParams.get('token') ?? '';
      setIsLoading(true);
      await graphqlService
        .gql({
          query: verifyEmailMutation,
          variables: {
            token: token,
          },
        })
        .catch(error => {
          const userFriendlyError = UserFriendlyError.fromAny(error);
          if (userFriendlyError.is('INVALID_EMAIL_TOKEN')) {
            return navigateHelper.jumpToExpired();
          }
          throw error;
        });
    })().catch(err => {
      // TODO(@eyhn): Add error handling
      console.error(err);
    });
  }, [graphqlService, navigateHelper, searchParams]);

  if (isLoading) {
    return <AppContainer fallback />;
  }

  return (
    <AuthPageContainer
      title={t['com.nexio.auth.change.email.page.success.title']()}
      subtitle={t['com.nexio.auth.change.email.page.success.subtitle']()}
    >
      <Button variant="primary" size="large" onClick={onopenNEXIO}>
        {t['com.nexio.auth.open.nexio']()}
      </Button>
    </AuthPageContainer>
  );
};
