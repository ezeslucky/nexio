import { SurfaceBlockSchema } from '@blocksuite/nexio/blocks/surface';
import { ConnectorElementRendererExtension } from '@blocksuite/nexio/gfx/connector';
import {
  MindmapElementRendererExtension,
  MindMapView,
} from '@blocksuite/nexio/gfx/mindmap';
import { ShapeElementRendererExtension } from '@blocksuite/nexio/gfx/shape';
import { TextElementRendererExtension } from '@blocksuite/nexio/gfx/text';
import { RootBlockSchema } from '@blocksuite/nexio/model';
import {
  DocModeService,
  ThemeService,
} from '@blocksuite/nexio/shared/services';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/nexio/std';
import type { BlockSchema, ExtensionType } from '@blocksuite/nexio/store';
import { literal } from 'lit/static-html.js';
import type { z } from 'zod';

import { MindmapService } from './mindmap-service.js';
import { MindmapSurfaceBlockService } from './surface-service.js';

export const MiniMindmapSpecs: ExtensionType[] = [
  DocModeService,
  ThemeService,
  FlavourExtension('nexio:page'),
  MindmapService,
  BlockViewExtension('nexio:page', literal`mini-mindmap-root-block`),
  FlavourExtension('nexio:surface'),
  MindMapView,
  MindmapSurfaceBlockService,
  BlockViewExtension('nexio:surface', literal`mini-mindmap-surface-block`),
  TextElementRendererExtension,
  MindmapElementRendererExtension,
  ShapeElementRendererExtension,
  ConnectorElementRendererExtension,
];

export const MiniMindmapSchema: z.infer<typeof BlockSchema>[] = [
  RootBlockSchema,
  SurfaceBlockSchema,
];
