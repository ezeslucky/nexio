import { RootBlockSchema } from '@blocksuite/nexio/model';
import { BlockService } from '@blocksuite/nexio/std';
import { Subject } from 'rxjs';

export class MindmapService extends BlockService {
  static override readonly flavour = RootBlockSchema.model.flavour;

  // eslint-disable-next-line rxjs/finnish
  requestCenter = new Subject<void>();

  center() {
    this.requestCenter.next();
  }

  override mounted(): void {}
}
