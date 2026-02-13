import type { DocCustomPropertyInfo } from '@nexio/core/modules/db';

import { SystemPropertyTypes } from '../system-property-types';

const systemProperties = Object.entries(SystemPropertyTypes);


export function generateExplorerPropertyList(
  workspaceProperties: DocCustomPropertyInfo[]
): {
  systemProperty?: (typeof SystemPropertyTypes)[number] & { type: string };
  workspaceProperty?: DocCustomPropertyInfo;
}[] {
  const finalList = [];
  workspaceProperties = [...workspaceProperties];

  for (const [type, info] of systemProperties) {
    const workspacePropertyIndex = workspaceProperties.findIndex(
      p => p.type === type
    );
    if (workspacePropertyIndex === -1) {
      finalList.push({
        systemProperty: { ...info, type },
      });
    } else {
      finalList.push({
        systemProperty: { ...info, type },
        workspaceProperty: workspaceProperties[workspacePropertyIndex],
      });
      workspaceProperties.splice(workspacePropertyIndex, 1);
    }
  }

  for (const workspaceProperty of workspaceProperties) {
    finalList.push({
      workspaceProperty,
    });
  }

  return finalList;
}
