import { buttonVariants } from '@nexio/admin/components/ui/button';
import { Separator } from '@nexio/admin/components/ui/separator';
import { cn } from '@nexio/admin/utils';
import {
  AlbumIcon,
  ChevronRightIcon,
  DownloadIcon,
  GithubIcon,
  MailWarningIcon,
} from 'lucide-react';

type Channel = 'stable' | 'canary' | 'beta' | 'internal';

const appNames = {
  stable: 'Nexio',
  canary: 'Nexio Canary',
  beta: 'Nexio Beta',
  internal: 'Nexio Internal',
} satisfies Record<Channel, string>;
const appName = appNames[BUILD_CONFIG.appBuildType];

const links = [
  {
    href: 'https://github.com/ezeslucky/nexio',
    icon: <GithubIcon size={20} />,
    label: 'Star Nexio on GitHub',
  },
  {
    href: '/download',
    icon: <DownloadIcon size={20} />,
    label: 'Download Nexio (Desktop & Mobile)',
  },
  {
    href: 'https://github.com/ezeslucky/nexio/issues',
    icon: <MailWarningIcon size={20} />,
    label: 'Report an Issue',
  },
  {
    href: 'https://github.com/ezeslucky/nexio#readme',
    icon: <AlbumIcon size={20} />,
    label: 'Self-host Document',
  },
];

export function AboutAFFiNE() {
  return (
    <div className="flex flex-col h-full gap-3 py-5 px-6 w-full">
      <div className="flex items-center">
        <span className="text-xl font-semibold">About Nexio</span>
      </div>
      <div className="overflow-y-auto space-y-[10px]">
        <div className="flex flex-col rounded-md border">
          {links.map(({ href, icon, label }, index) => (
            <div key={label + index}>
              <a
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'justify-between cursor-pointer w-full'
                )}
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span>{label}</span>
                </div>
                <div>
                  <ChevronRightIcon size={20} />
                </div>
              </a>
              {index < links.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 text-sm font-normal text-muted-foreground">
        <div>{`App Version: ${appName} ${BUILD_CONFIG.appVersion}`}</div>
        <div>{`Editor Version: ${BUILD_CONFIG.editorVersion}`}</div>
      </div>
    </div>
  );
}
