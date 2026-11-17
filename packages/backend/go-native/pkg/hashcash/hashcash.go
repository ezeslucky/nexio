package hashcash

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"math"
	"math/big"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/sha3"
)

const (
	SaltLength   = 16
	DefaultBits  = 20
	TimeFormat   = "20060102150405"
	alphanumeric = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

// Stamp represents a Hashcash stamp compatible with Affine/Nexio Rust native stamp.
type Stamp struct {
	Version  string
	Claim    uint32
	Ts       string
	Resource string
	Ext      string
	Rand     string
	Counter  string
}

func randomString(n int) string {
	b := make([]byte, n)
	max := big.NewInt(int64(len(alphanumeric)))
	for i := range b {
		num, err := rand.Int(rand.Reader, max)
		if err != nil {
			b[i] = alphanumeric[0]
		} else {
			b[i] = alphanumeric[num.Int64()]
		}
	}
	return string(b)
}

// ParseStamp parses a raw Hashcash string into a Stamp.
func ParseStamp(value string) (*Stamp, error) {
	parts := strings.Split(value, ":")
	if len(parts) != 7 {
		return nil, fmt.Errorf("malformed stamp, expected 7 parts, got %d", len(parts))
	}
	for i, part := range parts {
		if i != 4 && len(part) == 0 { // part 4 is Ext which can be empty
			return nil, fmt.Errorf("malformed stamp: part %d is empty", i)
		}
	}

	claim, err := strconv.ParseUint(parts[1], 10, 32)
	if err != nil {
		return nil, fmt.Errorf("malformed stamp claim: %w", err)
	}

	return &Stamp{
		Version:  parts[0],
		Claim:    uint32(claim),
		Ts:       parts[2],
		Resource: parts[3],
		Ext:      parts[4],
		Rand:     parts[5],
		Counter:  parts[6],
	}, nil
}

// Format formats the stamp as standard "version:claim:ts:resource:ext:rand:counter".
func (s *Stamp) Format() string {
	return fmt.Sprintf("%s:%d:%s:%s:%s:%s:%s",
		s.Version, s.Claim, s.Ts, s.Resource, s.Ext, s.Rand, s.Counter)
}

// CheckExpiration checks if the stamp was created within the last 5 minutes.
func (s *Stamp) CheckExpiration() bool {
	t, err := time.ParseInLocation(TimeFormat, s.Ts, time.UTC)
	if err != nil {
		return false
	}
	now := time.Now().UTC()
	// Valid if current time is before or equal to timestamp + 5 minutes
	return now.Before(t.Add(5 * time.Minute)) || now.Equal(t.Add(5*time.Minute))
}

// Check verifies whether the stamp matches the resource and claim bits.
func (s *Stamp) Check(bits uint32, resource string) bool {
	if s.Version != "1" || bits > s.Claim || !s.CheckExpiration() || s.Resource != resource {
		return false
	}

	hexDigits := int(math.Floor(float64(s.Claim) / 4.0))
	hasher := sha3.New256()
	hasher.Write([]byte(s.Format()))
	sum := hex.EncodeToString(hasher.Sum(nil))

	expectedPrefix := strings.Repeat("0", hexDigits)
	if len(sum) < hexDigits || sum[:hexDigits] != expectedPrefix {
		return false
	}
	return true
}

// Mint generates a new valid Hashcash stamp for the given resource and bits.
func Mint(resource string, bits uint32) *Stamp {
	if bits == 0 {
		bits = DefaultBits
	}
	version := "1"
	ts := time.Now().UTC().Format(TimeFormat)
	randStr := randomString(SaltLength)
	challenge := fmt.Sprintf("%s:%d:%s:%s:%s:%s", version, bits, ts, resource, "", randStr)

	hexDigits := int(math.Ceil(float64(bits) / 4.0))
	zeros := strings.Repeat("0", hexDigits)

	var counter uint64
	for {
		counterHex := fmt.Sprintf("%x", counter)
		toHash := fmt.Sprintf("%s:%s", challenge, counterHex)

		hasher := sha3.New256()
		hasher.Write([]byte(toHash))
		sum := hex.EncodeToString(hasher.Sum(nil))

		if len(sum) >= hexDigits && sum[:hexDigits] == zeros {
			return &Stamp{
				Version:  version,
				Claim:    bits,
				Ts:       ts,
				Resource: resource,
				Ext:      "",
				Rand:     randStr,
				Counter:  counterHex,
			}
		}
		counter++
	}
}

// VerifyChallengeResponse is the public helper matching Rust's verify_challenge_response.
func VerifyChallengeResponse(response string, bits uint32, resource string) bool {
	if response == "" || resource == "" {
		return false
	}
	stamp, err := ParseStamp(response)
	if err != nil {
		return false
	}
	return stamp.Check(bits, resource)
}

// MintChallengeResponse is the public helper matching Rust's mint_challenge_response.
func MintChallengeResponse(resource string, bits uint32) string {
	if resource == "" {
		return ""
	}
	stamp := Mint(resource, bits)
	return stamp.Format()
}

