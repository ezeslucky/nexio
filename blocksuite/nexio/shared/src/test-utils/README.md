# Nexio Test Tools

## Structured Document Creation

`nexio-template.ts` provides a concise way to create test documents, using a html-like syntax.

### Basic Usage

```typescript
import { nexio } from '@blocksuite/nexio-shared/test-utils';

// Create a simple document
const doc = nexio`
  <nexio-page>
    <nexio-note>
      <nexio-paragraph>Hello, World!</nexio-paragraph>
    </nexio-note>
  </nexio-page>
`;
```

### Complex Structure Example

```typescript
// Create a document with multiple notes and paragraphs
const doc = nexio`
  <nexio-page title="My Test Page">
    <nexio-note>
      <nexio-paragraph>First paragraph</nexio-paragraph>
      <nexio-paragraph>Second paragraph</nexio-paragraph>
    </nexio-note>
    <nexio-note>
      <nexio-paragraph>Another note</nexio-paragraph>
    </nexio-note>
  </nexio-page>
`;
```

### Application in Tests

This tool is particularly suitable for creating documents with specific structures in test cases:

```typescript
import { describe, expect, it } from 'vitest';
import { nexio } from '../__tests__/utils/nexio-template';

describe('My Test', () => {
  it('should correctly handle document structure', () => {
    const doc = nexio`
      <nexio-page>
        <nexio-note>
          <nexio-paragraph>Test content</nexio-paragraph>
        </nexio-note>
      </nexio-page>
    `;

    // Get blocks
    const pages = doc.getBlocksByFlavour('nexio:page');
    const notes = doc.getBlocksByFlavour('nexio:note');
    const paragraphs = doc.getBlocksByFlavour('nexio:paragraph');

    expect(pages.length).toBe(1);
    expect(notes.length).toBe(1);
    expect(paragraphs.length).toBe(1);

    // Perform more tests here...
  });
});
```

### Supported Block Types

Currently supports the following block types:

- `nexio-page` → `nexio:page`
- `nexio-note` → `nexio:note`
- `nexio-paragraph` → `nexio:paragraph`
- `nexio-list` → `nexio:list`
- `nexio-image` → `nexio:image`
