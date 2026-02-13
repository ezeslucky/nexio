import { Button, notify } from '@nexio/component';
import { SettingRow } from '@nexio/component/setting-components';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { useMutation } from '@nexio/core/components/hooks/use-mutation';
import { UrlService } from '@nexio/core/modules/url';
import { UserFriendlyError } from '@nexio/error';
import { createCustomerPortalMutation } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import { useService } from '@toeverything/infra';

import * as styles from './styles.css';

export const PaymentMethodUpdater = () => {
  const { isMutating, trigger } = useMutation({
    mutation: createCustomerPortalMutation,
  });
  const urlService = useService(UrlService);
  const t = useI18n();

  const update = useAsyncCallback(async () => {
    await trigger(null, {
      onSuccess: data => {
        urlService.openExternal(data.createCustomerPortal);
      },
    }).catch(e => {
      const userFriendlyError = UserFriendlyError.fromAny(e);
      notify.error(userFriendlyError);
    });
  }, [trigger, urlService]);

  return (
    <SettingRow
      className={styles.paymentMethod}
      name={t['com.nexio.payment.billing-setting.payment-method']()}
      desc={t[
        'com.nexio.payment.billing-setting.payment-method.description'
      ]()}
    >
      <Button onClick={update} loading={isMutating} disabled={isMutating}>
        {t['com.nexio.payment.billing-setting.payment-method.go']()}
      </Button>
    </SettingRow>
  );
};
