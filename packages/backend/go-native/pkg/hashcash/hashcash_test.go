package hashcash

import (
	"testing"
)

func TestMintAndVerify(t *testing.T) {
	resource := "workspace-test-id"
	var bits uint32 = 12 // smaller bit for fast unit test

	stampStr := MintChallengeResponse(resource, bits)
	if stampStr == "" {
		t.Fatalf("expected non-empty stamp")
	}

	if !VerifyChallengeResponse(stampStr, bits, resource) {
		t.Fatalf("expected stamp to verify successfully for resource %s", resource)
	}

	// Verify failure with different resource
	if VerifyChallengeResponse(stampStr, bits, "different-resource") {
		t.Fatalf("expected stamp to fail for different resource")
	}

	// Verify failure with higher bits
	if VerifyChallengeResponse(stampStr, bits+10, resource) {
		t.Fatalf("expected stamp to fail for higher bits demand")
	}
}

func TestStampFormatAndParse(t *testing.T) {
	resource := "test-user-auth"
	stamp := Mint(resource, 8)
	formatted := stamp.Format()

	parsed, err := ParseStamp(formatted)
	if err != nil {
		t.Fatalf("failed to parse stamp: %v", err)
	}

	if parsed.Resource != resource {
		t.Fatalf("expected resource %s, got %s", resource, parsed.Resource)
	}
	if parsed.Claim != 8 {
		t.Fatalf("expected claim 8, got %d", parsed.Claim)
	}
	if !parsed.CheckExpiration() {
		t.Fatalf("expected freshly minted stamp not to be expired")
	}
}

