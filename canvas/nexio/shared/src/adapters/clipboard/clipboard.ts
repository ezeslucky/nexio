import { CanvasError, ErrorCode } from '@canvas/global/exceptions';
import type {
  BlockSnapshot,
  DocSnapshot,
  FromBlockSnapshotPayload,
  FromBlockSnapshotResult,
  FromDocSnapshotPayload,
  FromDocSnapshotResult,
  FromSliceSnapshotPayload,
  FromSliceSnapshotResult,
  SliceSnapshot,
  ToBlockSnapshotPayload,
  ToDocSnapshotPayload,
  ToSliceSnapshotPayload,
} from '@canvas/store';
import { BaseAdapter } from '@canvas/store';

import { NotificationProvider } from '../../services/notification-service.js';
import { decodeClipboardBlobs, encodeClipboardBlobs } from './utils.js';

export type FileSnapshot = {
  name: string;
  type: string;
  content: string;
};

export class ClipboardAdapter extends BaseAdapter<string> {
  static MIME = 'CANVAS/SNAPSHOT';

  private readonly _onError = (message: string) => {
    const notification = this.provider.getOptional(NotificationProvider);
    if (!notification) return;

    notification.toast(message);
  };

  override fromBlockSnapshot(
    _payload: FromBlockSnapshotPayload
  ): Promise<FromBlockSnapshotResult<string>> {
    throw new CanvasError(
      ErrorCode.TransformerNotImplementedError,
      'ClipboardAdapter.fromBlockSnapshot is not implemented'
    );
  }

  override fromDocSnapshot(
    _payload: FromDocSnapshotPayload
  ): Promise<FromDocSnapshotResult<string>> {
    throw new CanvasError(
      ErrorCode.TransformerNotImplementedError,
      'ClipboardAdapter.fromDocSnapshot is not implemented'
    );
  }

  override async fromSliceSnapshot(
    payload: FromSliceSnapshotPayload
  ): Promise<FromSliceSnapshotResult<string>> {
    const snapshot = payload.snapshot;
    const assets = payload.assets;
    if (!assets) {
      throw new CanvasError(
        ErrorCode.ValueNotExists,
        'ClipboardAdapter.fromSliceSnapshot: assets is not found'
      );
    }
    const map = assets.getAssets();
    const blobs: Record<string, FileSnapshot> = await encodeClipboardBlobs(
      map,
      this._onError
    );
    return {
      file: JSON.stringify({
        snapshot,
        blobs,
      }),
      assetsIds: [],
    };
  }

  override toBlockSnapshot(
    _payload: ToBlockSnapshotPayload<string>
  ): Promise<BlockSnapshot> {
    throw new CanvasError(
      ErrorCode.TransformerNotImplementedError,
      'ClipboardAdapter.toBlockSnapshot is not implemented'
    );
  }

  override toDocSnapshot(
    _payload: ToDocSnapshotPayload<string>
  ): Promise<DocSnapshot> {
    throw new CanvasError(
      ErrorCode.TransformerNotImplementedError,
      'ClipboardAdapter.toDocSnapshot is not implemented'
    );
  }

  override toSliceSnapshot(
    payload: ToSliceSnapshotPayload<string>
  ): Promise<SliceSnapshot> {
    const json = JSON.parse(payload.file);
    const { blobs, snapshot } = json;
    const map = payload.assets?.getAssets();
    decodeClipboardBlobs(blobs, map);
    return Promise.resolve(snapshot);
  }
}
