import { BaseTool } from '@canvas/std/gfx';

/**
 * Empty tool that does nothing.
 */
export class EmptyTool extends BaseTool {
  static override toolName: string = 'empty';
}
