import { SurfaceBlockSchema } from '@canvas/nexio/blocks/surface';
import { BlockService } from '@canvas/nexio/std';

export class MindmapSurfaceBlockService extends BlockService {
  static override readonly flavour = SurfaceBlockSchema.model.flavour;
}
