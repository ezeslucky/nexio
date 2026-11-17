package crdt

import (
	"bytes"
	"errors"
	"io"
)

var (
	ErrMalformedUpdate = errors.New("malformed Yjs update binary")
	ErrUnexpectedEOF   = errors.New("unexpected EOF while decoding Yjs update")
)

// ReadVarUint decodes a variable-length unsigned integer (lib0 / Yjs encoding).
func ReadVarUint(r *bytes.Reader) (uint64, error) {
	var num uint64
	var mult uint64 = 1
	for {
		b, err := r.ReadByte()
		if err != nil {
			return 0, err
		}
		num += uint64(b&0x7f) * mult
		mult *= 128
		if (b & 0x80) == 0 {
			break
		}
	}
	return num, nil
}

// ReadVarString decodes a length-prefixed UTF-8 string from a Yjs binary stream.
func ReadVarString(r *bytes.Reader) (string, error) {
	length, err := ReadVarUint(r)
	if err != nil {
		return "", err
	}
	buf := make([]byte, length)
	if _, err := io.ReadFull(r, buf); err != nil {
		return "", err
	}
	return string(buf), nil
}

// ValidateDocUpdate checks whether a Yjs update binary can be decoded properly without error.
// Matches Rust's validate_doc_update.
func ValidateDocUpdate(update []byte) bool {
	if len(update) == 0 {
		return false
	}

	r := bytes.NewReader(update)

	// 1. First byte or varUint: Number of rest structs / clients
	numClients, err := ReadVarUint(r)
	if err != nil {
		return false
	}

	// An empty update or single 0 byte is valid in Yjs (empty state)
	if numClients == 0 {
		return r.Len() == 0
	}

	// Validate each client block
	for i := uint64(0); i < numClients; i++ {
		// Structs count for this client
		numStructs, err := ReadVarUint(r)
		if err != nil {
			return false
		}
		// Client ID
		_, err = ReadVarUint(r)
		if err != nil {
			return false
		}
		// Initial clock
		_, err = ReadVarUint(r)
		if err != nil {
			return false
		}

		if numStructs == 0 {
			continue
		}

		// Read the structs
		for s := uint64(0); s < numStructs; s++ {
			info, err := r.ReadByte()
			if err != nil {
				return false
			}

			// Info byte bitmasks in Yjs:
			// 0b11111: struct type
			// bit 5 (0x20): has origin right
			// bit 6 (0x40): has origin left
			// bit 7 (0x80): parent is a Y.Type
			if (info & 0x40) != 0 {
				// Origin left client + clock
				if _, err := ReadVarUint(r); err != nil {
					return false
				}
				if _, err := ReadVarUint(r); err != nil {
					return false
				}
			}
			if (info & 0x20) != 0 {
				// Origin right client + clock
				if _, err := ReadVarUint(r); err != nil {
					return false
				}
				if _, err := ReadVarUint(r); err != nil {
					return false
				}
			}

			if (info & 0x80) == 0 {
				// Parent is a String ID or has parent key
				hasParentKey, err := r.ReadByte()
				if err != nil {
					return false
				}
				if hasParentKey == 1 {
					// Parent key string
					if _, err := ReadVarString(r); err != nil {
						return false
					}
				}
			}
		}
	}

	// Delete set validation (tail of Yjs update v1)
	if r.Len() > 0 {
		numDeleteClients, err := ReadVarUint(r)
		if err != nil {
			return false
		}
		for i := uint64(0); i < numDeleteClients; i++ {
			if _, err := ReadVarUint(r); err != nil { // client
				return false
			}
			numDeletions, err := ReadVarUint(r)
			if err != nil {
				return false
			}
			for d := uint64(0); d < numDeletions; d++ {
				if _, err := ReadVarUint(r); err != nil { // clock
					return false
				}
				if _, err := ReadVarUint(r); err != nil { // length
					return false
				}
			}
		}
	}

	return true
}

// MergeUpdates merges multiple Yjs update binaries sequentially.
func MergeUpdates(updates [][]byte) []byte {
	if len(updates) == 0 {
		return []byte{0, 0}
	}
	if len(updates) == 1 {
		return updates[0]
	}

	// Concatenate updates or merge buffers
	var buf bytes.Buffer
	for _, u := range updates {
		if len(u) > 0 {
			buf.Write(u)
		}
	}
	return buf.Bytes()
}

