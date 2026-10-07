import clsx from 'clsx';
import type { FC } from 'react';

import { NexioIcon } from './logo';
import { authHeaderWrapper } from './share.css';

export const AuthHeader: FC<{
  title: string;
  subTitle?: string;
  className?: string;
}> = ({ title, subTitle, className }) => {
  return (
    <div className={clsx(authHeaderWrapper, className)}>
      <p>
        <NexioIcon className="logo" size={24} />
        {title}
      </p>
      <p>{subTitle}</p>
    </div>
  );
};
