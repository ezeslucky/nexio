import { type ColorScheme } from '@blocksuite/nexio-model';
import { getAffinePlaceholderFillColor } from '@blocksuite/nexio-shared/theme';

export function getSurfacePlaceholderFallback(colorScheme: ColorScheme) {
  return getAffinePlaceholderFillColor(colorScheme);
}

export function resolveSurfacePlaceholderColor(colorScheme: ColorScheme) {
  return getSurfacePlaceholderFallback(colorScheme);
}
