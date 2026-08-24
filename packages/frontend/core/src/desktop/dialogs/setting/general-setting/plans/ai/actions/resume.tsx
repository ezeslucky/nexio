import {
  Button,
  type ButtonProps,
  notify,
  useConfirmModal,
} from '@nexio/component';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { SubscriptionService } from '@nexio/core/modules/cloud';
import { SubscriptionPlan } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { SingleSelectCheckSolidIcon } from '@canvas/icons/rc';
import { useService } from '@ezeslucky/infra';
import { cssVar } from '@ezeslucky/theme';
import { nanoid } from 'nanoid';
import { useState } from 'react';

export const AIResume = (btnProps: ButtonProps) => {
  const t = useI18n();
  const [idempotencyKey, setIdempotencyKey] = useState(nanoid());
  const subscription = useService(SubscriptionService).subscription;

  const [isMutating, setIsMutating] = useState(false);

  const { openConfirmModal } = useConfirmModal();

  const resume = useAsyncCallback(async () => {
    const aiSubscription = subscription.ai$.value;
    if (aiSubscription) {
      track.$.settingsPanel.plans.resumeSubscription({
        plan: SubscriptionPlan.AI,
        recurring: aiSubscription.recurring,
      });
    }

    openConfirmModal({
      title: t['com.nexio.payment.ai.action.resume.confirm.title'](),
      description:
        t['com.nexio.payment.ai.action.resume.confirm.description'](),
      confirmText:
        t['com.nexio.payment.ai.action.resume.confirm.confirm-text'](),
      confirmButtonOptions: {
        variant: 'primary',
      },
      cancelText:
        t['com.nexio.payment.ai.action.resume.confirm.cancel-text'](),
      onConfirm: async () => {
        setIsMutating(true);
        await subscription.resumeSubscription(
          idempotencyKey,
          SubscriptionPlan.AI
        );
        if (aiSubscription) {
          track.$.settingsPanel.plans.confirmResumingSubscription({
            plan: aiSubscription.plan,
            recurring: aiSubscription.recurring,
          });
        }
        notify({
          icon: <SingleSelectCheckSolidIcon />,
          iconColor: cssVar('processingColor'),
          title:
            t['com.nexio.payment.ai.action.resume.confirm.notify.title'](),
          message:
            t['com.nexio.payment.ai.action.resume.confirm.notify.msg'](),
        });
        setIdempotencyKey(nanoid());
      },
    });
  }, [subscription, openConfirmModal, t, idempotencyKey]);

  return (
    <Button
      loading={isMutating}
      onClick={resume}
      variant="primary"
      {...btnProps}
    >
      {t['com.nexio.payment.ai.action.resume.button-label']()}
    </Button>
  );
};
