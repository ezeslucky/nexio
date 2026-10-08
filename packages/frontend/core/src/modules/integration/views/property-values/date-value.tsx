import { PropertyValue, Tooltip } from '@nexio/component';
import { i18nTime } from '@nexio/i18n';
import { useMemo } from 'react';

import * as styles from './styles.css';
import type { PropertyValueProps } from './type';

export const DateValue = ({ value }: PropertyValueProps) => {
  const accuracySecond = useMemo(() => {
    return i18nTime(value, { absolute: { accuracy: 'second' } });
  }, [value]);

  const accuracyDay = useMemo(() => {
    return i18nTime(value, { absolute: { accuracy: 'day' } });
  }, [value]);

  return (
    <PropertyValue className={styles.value} hoverable={false}>
      <Tooltip content={accuracySecond} side="right">
        <span>{accuracyDay}</span>
      </Tooltip>
    </PropertyValue>
  );
};
