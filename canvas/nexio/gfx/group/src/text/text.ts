import { DefaultTool } from '@canvas/nexio-block-surface';
import type { GroupElementModel } from '@canvas/nexio-model';
import { BlockSuiteError, ErrorCode } from '@canvas/global/exceptions';
import type { BlockComponent } from '@canvas/std';
import { GfxControllerIdentifier } from '@canvas/std/gfx';

import { EdgelessGroupTitleEditor } from './edgeless-group-title-editor';

export function mountGroupTitleEditor(
  group: GroupElementModel,
  edgeless: BlockComponent
) {
  const mountElm = edgeless.querySelector('.edgeless-mount-point');
  if (!mountElm) {
    throw new BlockSuiteError(
      ErrorCode.ValueNotExists,
      "edgeless block's mount point does not exist"
    );
  }

  const gfx = edgeless.std.get(GfxControllerIdentifier);

  gfx.tool.setTool(DefaultTool);
  gfx.selection.set({
    elements: [group.id],
    editing: true,
  });

  const groupEditor = new EdgelessGroupTitleEditor();
  groupEditor.group = group;

  mountElm.append(groupEditor);
}
