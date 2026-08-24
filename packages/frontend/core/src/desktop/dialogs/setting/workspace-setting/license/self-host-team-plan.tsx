import { Button } from '@nexio/component';
import { WorkspacePermissionService } from '@nexio/core/modules/permissions';
import { useI18n } from '@nexio/i18n';
import { DoneIcon } from '@canvas/icons/rc';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useCallback } from 'react';

import * as styles from './self-host-team-plan.css';

const initialQuota = '100 GB';
const quotaPerSeat = '20 GB';
const maxFileSize = '500 MB';

export const SelfHostTeamPlan = () => {
  const t = useI18n();

  const permission = useService(WorkspacePermissionService).permission;
  const isTeam = useLiveData(permission.isTeam$);

  const handleClick = useCallback(() => {
    window.open(BUILD_CONFIG.pricingUrl, '_blank');
  }, []);

  if (isTeam) {
    return null;
  }

  return (
    <div className={styles.pricingPlan}>
      <div className={styles.planCardHeader}>
        <div className={styles.planCardTitle}>
          {t['com.nexio.settings.workspace.license.benefit.team.title']()}
        </div>
        <div className={styles.planCardSubtitle}>
          {t['com.nexio.settings.workspace.license.benefit.team.subtitle']()}
        </div>
      </div>

      <div className={styles.benefitItems}>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g1']()}
        </div>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g2']({
            initialQuota,
            quotaPerSeat,
          })}
        </div>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g3']({
            quota: maxFileSize,
          })}
        </div>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g4']()}
        </div>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g5']()}
        </div>
        <div className={styles.benefitItem}>
          <DoneIcon className={styles.doneIconStyle} />
          {t['com.nexio.settings.workspace.license.benefit.team.g6']()}
        </div>
      </div>

      <div className={styles.leanMoreButtonContainer}>
        <Button onClick={handleClick}>
          {t['com.nexio.settings.workspace.license.lean-more']()}
        </Button>
      </div>
    </div>
  );
};
