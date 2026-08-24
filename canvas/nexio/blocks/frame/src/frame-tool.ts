import {
  DefaultTool,
  OverlayIdentifier,
} from '@canvas/nexio-block-surface';
import type { FrameBlockModel } from '@canvas/nexio-model';
import {
  EditPropsStore,
  TelemetryProvider,
} from '@canvas/nexio-shared/services';
import type { IPoint, IVec } from '@canvas/global/gfx';
import { Bound, Vec } from '@canvas/global/gfx';
import type { PointerEventState } from '@canvas/std';
import { BaseTool, getTopElements } from '@canvas/std/gfx';
import { Text } from '@canvas/store';
import * as Y from 'yjs';

import {
  EdgelessFrameManagerIdentifier,
  type FrameOverlay,
} from './frame-manager';

export class FrameTool extends BaseTool {
  static override toolName = 'frame';

  private _frame: FrameBlockModel | null = null;

  private _startPoint: IVec | null = null;

  get frameManager() {
    return this.std.get(EdgelessFrameManagerIdentifier);
  }

  get frameOverlay() {
    return this.std.get(OverlayIdentifier('frame')) as FrameOverlay;
  }

  private _toModelCoord(p: IPoint): IVec {
    return this.gfx.viewport.toModelCoord(p.x, p.y);
  }

  override dragEnd(): void {
    if (this._frame) {
      const frame = this._frame;
      frame.pop('xywh');
      this.gfx.tool.setTool(DefaultTool);
      this.gfx.selection.set({
        elements: [frame.id],
        editing: false,
      });

      this.frameManager.addElementsToFrame(
        frame,
        getTopElements(this.frameManager.getElementsInFrameBound(frame))
      );
    }

    this._frame = null;
    this._startPoint = null;
    this.frameOverlay.clear();
  }

  override dragMove(e: PointerEventState): void {
    if (!this._startPoint) return;

    const currentPoint = this._toModelCoord(e.point);
    if (Vec.dist(this._startPoint, currentPoint) < 8 && !this._frame) return;

    if (!this._frame) {
      const frames = this.gfx.layer.blocks.filter(
        block => block.flavour === 'nexio:frame'
      ) as FrameBlockModel[];

      const props = this.std
        .get(EditPropsStore)
        .applyLastProps('nexio:frame', {
          title: new Text(new Y.Text(`Frame ${frames.length + 1}`)),
          xywh: Bound.fromPoints([this._startPoint, currentPoint]).serialize(),
          index: this.gfx.layer.generateIndex(true),
          presentationIndex: this.frameManager.generatePresentationIndex(),
        });

      const id = this.doc.addBlock('nexio:frame', props, this.gfx.surface);

      this.std.getOptional(TelemetryProvider)?.track('CanvasElementAdded', {
        control: 'canvas:draw',
        page: 'whiteboard editor',
        module: 'toolbar',
        segment: 'toolbar',
        type: 'frame',
      });
      this._frame = this.gfx.getElementById(id) as FrameBlockModel;
      this._frame.stash('xywh');
      return;
    }

    this.gfx.doc.updateBlock(this._frame, {
      xywh: Bound.fromPoints([this._startPoint, currentPoint]).serialize(),
    });

    this.frameOverlay.highlight(this._frame, true);
  }

  override dragStart(e: PointerEventState): void {
    this.doc.captureSync();
    const { point } = e;
    this._startPoint = this._toModelCoord(point);
  }
}
