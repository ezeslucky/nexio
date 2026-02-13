import { SurfaceBlockSchema } from '@blocksuite/nexio/blocks/surface';
import { BlockService } from '@blocksuite/nexio/std';

export class MindmapSurfaceBlockService extends BlockService {
  static override readonly flavour = SurfaceBlockSchema.model.flavour;
}
