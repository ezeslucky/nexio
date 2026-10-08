import { PackageList, type PackageName } from './yarn';

export const PackageToDistribution = new Map<
  PackageName,
  BUILD_CONFIG_TYPE['distribution']
>([
  ['@nexio/admin', 'admin'],
  ['@nexio/web', 'web'],
  ['@nexio/electron-renderer', 'desktop'],
  ['@nexio/electron', 'desktop'],
  ['@nexio/mobile', 'mobile'],
  ['@nexio/ios', 'ios'],
  ['@nexio/android', 'android'],
]);

export const AliasToPackage = new Map<string, PackageName>([
  ['admin', '@nexio/admin'],
  ['web', '@nexio/web'],
  ['electron', '@nexio/electron'],
  ['desktop', '@nexio/electron-renderer'],
  ['renderer', '@nexio/electron-renderer'],
  ['mobile', '@nexio/mobile'],
  ['ios', '@nexio/ios'],
  ['android', '@nexio/android'],
  ['server', '@nexio/server'],
  ['gql', '@nexio/graphql'],
  ...PackageList.map(
    pkg => [pkg.name.split('/').pop()!, pkg.name] as [string, PackageName]
  ),
]);
