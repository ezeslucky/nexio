package tokenizer

import (
	"testing"
)

func TestTokenizerCount(t *testing.T) {
	tok, err := FromModelName("gpt-4")
	if err != nil {
		t.Fatalf("unexpected error getting tokenizer: %v", err)
	}

	content := "Hello, world! This is a test from Nexio."
	count := tok.Count(content, nil)
	if count <= 0 {
		t.Fatalf("expected count > 0, got %d", count)
	}

	tokens := tok.Encode(content, nil)
	if len(tokens) != count {
		t.Fatalf("expected encoded token length %d to match count %d", len(tokens), count)
	}

	decoded := tok.Decode(tokens)
	if decoded != content {
		t.Fatalf("expected decoded '%s' to match original '%s'", decoded, content)
	}
}

func TestGpt5Fallback(t *testing.T) {
	tok, err := FromModelName("gpt-5-preview")
	if err != nil {
		t.Fatalf("unexpected error getting gpt-5 tokenizer: %v", err)
	}

	count := tok.Count("Testing GPT-5 model tokenizer", nil)
	if count <= 0 {
		t.Fatalf("expected token count > 0, got %d", count)
	}
}

