import { PackageCommand } from './command';

export class BuildCommand extends PackageCommand {
  static override paths = [['build'], ['b']];

  async execute() {
    const args: string[] = [];

    if (this.deps) {
      args.push('--deps', '--wait-deps');
    }

    args.push(this.package, 'build');

    const exitCode = await this.cli.run(args);
    if (exitCode !== 0) {
      process.exit(exitCode ?? 1);
    }
  }
}
