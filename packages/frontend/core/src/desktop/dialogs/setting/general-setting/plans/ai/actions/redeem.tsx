import { Button, type ButtonProps } from '@nexio/component';
import { generateSubscriptionCallbackLink } from '@nexio/core/components/hooks/nexio/use-subscription-notify';
import { AuthService } from '@nexio/core/modules/cloud';
import {
  SubscriptionPlan,
  SubscriptionRecurring,
  SubscriptionVariant,
} from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import track from '@nexio/track';
import { useService } from '@toeverything/infra';
import { useCallback, useMemo } from 'react';

import { CheckoutSlot } from '../../checkout-slot';

export const AIRedeemCodeButton = (btnProps: ButtonProps) => {
  const t = useI18n();
  const authService = useService(AuthService);

  const onBeforeCheckout = useCallback(() => {
    track.$.settingsPanel.plans.checkout({
      plan: SubscriptionPlan.AI,
      recurring: SubscriptionRecurring.Yearly,
    });
  }, []);
  const checkoutOptions = useMemo(
    () => ({
      recurring: SubscriptionRecurring.Yearly,
      plan: SubscriptionPlan.AI,
      variant: SubscriptionVariant.Onetime,
      coupon: null,
      successCallbackLink: generateSubscriptionCallbackLink(
        authService.session.account$.value,
        SubscriptionPlan.AI,
        SubscriptionRecurring.Yearly
      ),
    }),
    [authService.session.account$.value]
  );

  return (
    <CheckoutSlot
      onBeforeCheckout={onBeforeCheckout}
      checkoutOptions={checkoutOptions}
      renderer={props => (
        <Button variant="primary" {...btnProps} {...props}>
          {t['com.nexio.payment.redeem-code']()}
        </Button>
      )}
    />
  );
};
