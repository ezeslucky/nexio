import * as allIcons from '@canvas/icons/rc';
import type { SVGProps } from 'react';

export const NexioIconRenderer = ({
  name,
  ...props
}: {
  name: string;
} & SVGProps<SVGSVGElement>) => {
  const Icon = allIcons[
    `${name}Icon` as keyof typeof allIcons
  ] as React.ComponentType<React.SVGProps<SVGSVGElement>>;

  if (!Icon) {
    return null;
  }

  return <Icon {...props} />;
};
