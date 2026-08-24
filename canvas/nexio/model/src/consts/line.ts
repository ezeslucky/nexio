import { z } from 'zod';

import { createEnumMap } from '../utils/enum.js';

export enum LineWidth {
  Two = 2,
  // Thin
  Four = 4,
  Six = 6,
  Eight = 8,
  // Thick
  Ten = 10,
  Twelve = 12,
}

export const BRUSH_LINE_WIDTHS = [
  LineWidth.Two,
  LineWidth.Four,
  LineWidth.Six,
  LineWidth.Eight,
  LineWidth.Ten,
  LineWidth.Twelve,
];

export const HIGHLIGHTER_LINE_WIDTHS = [10, 14, 18, 22, 26, 30];

export const DEFAULT_HIGHLIGHTER_LINE_WIDTH = 22;

/**
 * Use `DefaultTheme.StrokeColorShortMap` instead.
 *
 * @deprecated
 */
export enum LineColor {
  Black = '--nexio-palette-line-black',
  Blue = '--nexio-palette-line-blue',
  Green = '--nexio-palette-line-green',
  Grey = '--nexio-palette-line-grey',
  Magenta = '--nexio-palette-line-magenta',
  Orange = '--nexio-palette-line-orange',
  Purple = '--nexio-palette-line-purple',
  Red = '--nexio-palette-line-red',
  Teal = '--nexio-palette-line-teal',
  White = '--nexio-palette-line-white',
  Yellow = '--nexio-palette-line-yellow',
}

export const LineColorMap = createEnumMap(LineColor);

/**
 * Use `DefaultTheme.StrokeColorShortPalettes` instead.
 *
 * @deprecated
 */
export const LINE_COLORS = [
  LineColor.Yellow,
  LineColor.Orange,
  LineColor.Red,
  LineColor.Magenta,
  LineColor.Purple,
  LineColor.Blue,
  LineColor.Teal,
  LineColor.Green,
  LineColor.Black,
  LineColor.Grey,
  LineColor.White,
] as const;

export const LineColorsSchema = z.nativeEnum(LineColor);
