export enum WorkspaceSettingsTab {
  members = 'workspace:members',
}

type SettingsPathParams = {
  workspaceId: string;
  tab: WorkspaceSettingsTab;
};


export function generateWorkspaceSettingsPath(params: SettingsPathParams) {
  const search = new URLSearchParams({
    tab: params.tab,
  });
  return `/workspace/${params.workspaceId}/settings?${search.toString()}`;
}
