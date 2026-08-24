import { css } from 'lit';

export const embedNoteContentStyles = css`
  .nexio-embed-doc-content-note-blocks nexio-divider,
  .nexio-embed-doc-content-note-blocks nexio-divider > * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .nexio-embed-doc-content-note-blocks nexio-paragraph,
  .nexio-embed-doc-content-note-blocks nexio-list {
    margin-top: 4px !important;
    margin-bottom: 4px !important;
    padding: 0 2px;
  }
  .nexio-embed-doc-content-note-blocks nexio-paragraph *,
  .nexio-embed-doc-content-note-blocks nexio-list * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 20px;
    font-size: var(--nexio-font-xs);
    font-weight: 400;
  }
  .nexio-embed-doc-content-note-blocks nexio-list .nexio-list-block__prefix {
    height: 20px;
  }
  .nexio-embed-doc-content-note-blocks nexio-paragraph .quote {
    padding-left: 15px;
    padding-top: 8px;
    padding-bottom: 8px;
  }
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h1),
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h2),
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h3),
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h4),
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h5),
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h6) {
    margin-top: 6px !important;
    margin-bottom: 4px !important;
    padding: 0 2px;
  }
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h1) *,
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h2) *,
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h3) *,
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h4) *,
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h5) *,
  .nexio-embed-doc-content-note-blocks nexio-paragraph:has(.h6) * {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    padding-top: 0;
    padding-bottom: 0;
    line-height: 20px;
    font-size: var(--nexio-font-xs);
    font-weight: 600;
  }

  .nexio-embed-doc-content-note-blocks inline-comment {
    background-color: unset !important;
    border-bottom: unset !important;
  }

  .nexio-embed-linked-doc-block.horizontal {
    nexio-paragraph,
    nexio-list {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      max-height: 40px;
      overflow: hidden;
      display: flex;
    }
    nexio-paragraph .quote {
      padding-top: 4px;
      padding-bottom: 4px;
      height: 28px;
    }
    nexio-paragraph .quote::after {
      height: 20px;
      margin-top: 4px !important;
      margin-bottom: 4px !important;
    }
  }
`;
