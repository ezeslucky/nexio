package crdt

import (
	"bytes"
	"testing"
)

func TestReadVarUint(t *testing.T) {
	// 0 encoded as 0x00
	r := bytes.NewReader([]byte{0x00})
	val, err := ReadVarUint(r)
	if err != nil || val != 0 {
		t.Fatalf("expected 0, got %d (err: %v)", val, err)
	}

	// 127 encoded as 0x7f
	r = bytes.NewReader([]byte{0x7f})
	val, err = ReadVarUint(r)
	if err != nil || val != 127 {
		t.Fatalf("expected 127, got %d (err: %v)", val, err)
	}

	// 128 encoded as 0x80, 0x01
	r = bytes.NewReader([]byte{0x80, 0x01})
	val, err = ReadVarUint(r)
	if err != nil || val != 128 {
		t.Fatalf("expected 128, got %d (err: %v)", val, err)
	}
}

func TestValidateDocUpdate(t *testing.T) {
	// Empty slice should be invalid
	if ValidateDocUpdate([]byte{}) {
		t.Fatalf("expected empty update to be invalid")
	}

	// Single 0 byte (empty Yjs update state with 0 clients) should be valid
	if !ValidateDocUpdate([]byte{0x00}) {
		t.Fatalf("expected valid empty update {0x00} to pass")
	}

	// Corrupted random binary data should fail gracefully without panic
	corrupted := []byte{0xff, 0xff, 0xff}
	if ValidateDocUpdate(corrupted) {
		t.Fatalf("expected truncated binary to fail validation")
	}
}

