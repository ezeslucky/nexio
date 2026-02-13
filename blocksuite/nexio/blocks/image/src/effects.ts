import { ImageBlockFallbackCard } from './components/image-block-fallback.js';
import { ImageBlockPageComponent } from './components/page-image-block.js';
import { ImageBlockComponent } from './image-block.js';
import { ImageEdgelessBlockComponent } from './image-edgeless-block.js';
import { ImageEdgelessPlaceholderBlockComponent } from './preview-image/edgeless.js';
import { ImagePlaceholderBlockComponent } from './preview-image/page.js';

export function effects() {
  customElements.define('nexio-image', ImageBlockComponent);
  customElements.define('nexio-edgeless-image', ImageEdgelessBlockComponent);
  customElements.define('nexio-page-image', ImageBlockPageComponent);
  customElements.define('nexio-image-fallback-card', ImageBlockFallbackCard);
  customElements.define(
    'nexio-placeholder-preview-image',
    ImagePlaceholderBlockComponent
  );
  customElements.define(
    'nexio-edgeless-placeholder-preview-image',
    ImageEdgelessPlaceholderBlockComponent
  );
}
