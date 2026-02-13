import type { PackageName } from '@nexio-tools/utils/workspace';

import { Option, PackageSelectorCommand } from './command';

export class DevCommand extends PackageSelectorCommand {
  static override paths = [['dev'], ['d']];

  protected override availablePackages: PackageName[] = [
    '@nexio/web',
    '@nexio/server',
    '@nexio/electron',
    '@nexio/electron-renderer',
    '@nexio/mobile',
    '@nexio/ios',
    '@nexio/android',
    '@nexio/admin',
  ];

  protected deps = Option.Boolean('--deps', {
    description: 'Run dev with dependencies',
  });

  async execute() {
    const name = await this.getPackage();
    const args = [];

    if (this.deps) {
      args.push('--deps');
    }

    args.push(name, 'dev');

    await this.cli.run(args);
  }
}
