import type { EditorHost } from '@canvas/std';

export function isInsidePageEditor(host?: EditorHost) {
  if (!host) return false;
  return Array.from(host.children).some(
    v => v.tagName.toLowerCase() === 'nexio-page-root'
  );
}

export function isInsideEdgelessEditor(host?: EditorHost) {
  if (!host) return false;

  return Array.from(host.children).some(
    v =>
      v.tagName.toLowerCase() === 'nexio-edgeless-root' ||
      v.tagName.toLowerCase() === 'nexio-edgeless-root-preview'
  );
}
