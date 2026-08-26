import { z } from 'zod';

import type { Color } from '../themes/color.js';
import { createEnumMap } from '../utils/enum.js';

export enum TextAlign {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export const TextAlignMap = createEnumMap(TextAlign);

export enum TextVerticalAlign {
  Bottom = 'bottom',
  Center = 'center',
  Top = 'top',
}

export type TextStyleProps = {
  color: Color;
  fontFamily: FontFamily;
  fontSize: number;
  fontStyle: FontStyle;
  fontWeight: FontWeight;
  textAlign: TextAlign;
};

export enum FontWeight {
  Bold = '700',
  Light = '300',
  Medium = '500',
  Regular = '400',
  SemiBold = '600',
}

export const FontWeightMap = createEnumMap(FontWeight);

export enum FontStyle {
  Italic = 'italic',
  Normal = 'normal',
}

export enum FontFamily {
  BebasNeue = 'canvas:surface:BebasNeue',
  Inter = 'canvas:surface:Inter',
  Kalam = 'canvas:surface:Kalam',
  Lora = 'canvas:surface:Lora',
  OrelegaOne = 'canvas:surface:OrelegaOne',
  Poppins = 'canvas:surface:Poppins',
  Satoshi = 'canvas:surface:Satoshi',
}

export const FontFamilyMap = createEnumMap(FontFamily);

export const FontFamilyList = Object.entries(FontFamilyMap) as {
  [K in FontFamily]: [K, (typeof FontFamilyMap)[K]];
}[FontFamily][];

export enum TextResizing {
  AUTO_WIDTH_AND_HEIGHT,
  AUTO_HEIGHT,
}

export const FontFamilySchema = z.nativeEnum(FontFamily);
export const FontWeightSchema = z.nativeEnum(FontWeight);
export const FontStyleSchema = z.nativeEnum(FontStyle);
export const TextAlignSchema = z.nativeEnum(TextAlign);
