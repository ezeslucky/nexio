import { describe, expect, it } from 'vitest';

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'guest';

export interface WorkspaceModuleSettings {
  enableTracker: boolean;
  enableChat: boolean;
  enableDocs: boolean;
  enableOffice: boolean;
}

export function canManageWorkspaceModules(role: WorkspaceRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canInviteMembers(role: WorkspaceRole): boolean {
  return role === 'owner' || role === 'admin';
}

export function canCreateTrackerIssues(role: WorkspaceRole): boolean {
  return role !== 'guest';
}

export function getVisibleModules(
  settings: WorkspaceModuleSettings
): string[] {
  const visible: string[] = [];
  if (settings.enableDocs) visible.push('docs');
  if (settings.enableTracker) visible.push('tracker');
  if (settings.enableChat) visible.push('chat');
  if (settings.enableOffice) visible.push('office');
  return visible;
}

export function resolveModulePath(moduleId: string): string {
  switch (moduleId) {
    case 'docs':
      return '/all';
    case 'tracker':
      return '/tracker';
    case 'chat':
    case 'channels':
      return '/channels';
    case 'office':
      return '/office';
    default:
      return '/all';
  }
}

describe('Workspace Modules and Permissions (Phase 1)', () => {
  it('enables all core modules by default', () => {
    const defaultSettings: WorkspaceModuleSettings = {
      enableTracker: true,
      enableChat: true,
      enableDocs: true,
      enableOffice: true,
    };
    const visible = getVisibleModules(defaultSettings);
    expect(visible).toEqual(['docs', 'tracker', 'chat', 'office']);
  });

  it('correctly filters visible modules when modules are toggled off', () => {
    const customSettings: WorkspaceModuleSettings = {
      enableTracker: true,
      enableChat: false,
      enableDocs: true,
      enableOffice: false,
    };
    const visible = getVisibleModules(customSettings);
    expect(visible).toEqual(['docs', 'tracker']);
  });

  it('verifies owner and admin can manage workspace modules and invite members', () => {
    expect(canManageWorkspaceModules('owner')).toBe(true);
    expect(canManageWorkspaceModules('admin')).toBe(true);
    expect(canManageWorkspaceModules('member')).toBe(false);
    expect(canManageWorkspaceModules('guest')).toBe(false);

    expect(canInviteMembers('owner')).toBe(true);
    expect(canInviteMembers('admin')).toBe(true);
    expect(canInviteMembers('member')).toBe(false);
    expect(canInviteMembers('guest')).toBe(false);
  });

  it('allows owner, admin, and member to create tracker issues, but restricts guests', () => {
    expect(canCreateTrackerIssues('owner')).toBe(true);
    expect(canCreateTrackerIssues('admin')).toBe(true);
    expect(canCreateTrackerIssues('member')).toBe(true);
    expect(canCreateTrackerIssues('guest')).toBe(false);
  });

  it('resolves correct URL routes for each workspace module', () => {
    expect(resolveModulePath('docs')).toBe('/all');
    expect(resolveModulePath('tracker')).toBe('/tracker');
    expect(resolveModulePath('chat')).toBe('/channels');
    expect(resolveModulePath('channels')).toBe('/channels');
    expect(resolveModulePath('office')).toBe('/office');
    expect(resolveModulePath('unknown')).toBe('/all');
  });
});
