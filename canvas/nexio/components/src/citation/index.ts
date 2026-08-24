import { CitationCard } from './citation';

export * from './citation';

export function effects() {
  customElements.define('nexio-citation-card', CitationCard);
}
