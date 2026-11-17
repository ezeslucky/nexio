package tokenizer

import (
	"strings"
	"sync"

	"github.com/pkoukk/tiktoken-go"
)

var (
	cacheMu sync.RWMutex
	cache   = make(map[string]*Tokenizer)
)

type Tokenizer struct {
	encoding *tiktoken.Tiktoken
	model    string
}

// FromModelName creates or retrieves a cached BPE Tokenizer for the given model name.
func FromModelName(modelName string) (*Tokenizer, error) {
	cacheMu.RLock()
	if t, exists := cache[modelName]; exists {
		cacheMu.RUnlock()
		return t, nil
	}
	cacheMu.RUnlock()

	var enc *tiktoken.Tiktoken
	var err error

	if strings.HasPrefix(modelName, "gpt-5") {
		enc, err = tiktoken.GetEncoding("o200k_base")
	} else {
		enc, err = tiktoken.EncodingForModel(modelName)
		if err != nil {
			// Fallback to cl100k_base (gpt-4 standard)
			enc, err = tiktoken.GetEncoding("cl100k_base")
		}
	}

	if err != nil {
		return nil, err
	}

	t := &Tokenizer{
		encoding: enc,
		model:    modelName,
	}

	cacheMu.Lock()
	cache[modelName] = t
	cacheMu.Unlock()

	return t, nil
}

// Count returns the number of tokens in content matching Rust's Tokenizer.count.
func (t *Tokenizer) Count(content string, allowedSpecial []string) int {
	tokens := t.encoding.Encode(content, allowedSpecial, nil)
	return len(tokens)
}

// Encode converts text into token IDs.
func (t *Tokenizer) Encode(content string, allowedSpecial []string) []int {
	return t.encoding.Encode(content, allowedSpecial, nil)
}

// Decode converts token IDs back into text.
func (t *Tokenizer) Decode(tokens []int) string {
	return t.encoding.Decode(tokens)
}

