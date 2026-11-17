package authsession

import (
	"bytes"
	"testing"
)

func TestAccessTokenVectorAndPolicy(t *testing.T) {
	secret := bytes.Repeat([]byte{7}, 32)
	token, err := SignAccessToken("user-1", "session-1", "key-1", secret, 1700000000, 1700000900)
	if err != nil {
		t.Fatalf("SignAccessToken failed: %v", err)
	}

	keyID, err := AccessTokenKeyID(token)
	if err != nil || keyID != "key-1" {
		t.Fatalf("Expected key-1, got %v (err: %v)", keyID, err)
	}

	valid := VerifyAccessToken(token, "key-1", secret, 1700000100)
	if valid.Status != "valid" || valid.UserID == nil || *valid.UserID != "user-1" {
		t.Fatalf("Expected valid, got %+v", valid)
	}

	v2 := VerifyAccessToken(token, "key-1", secret, 1700000929)
	if v2.Status != "valid" {
		t.Fatalf("Expected valid at 1700000929, got %s", v2.Status)
	}

	v3 := VerifyAccessToken(token, "key-1", secret, 1700000930)
	if v3.Status != "expired" {
		t.Fatalf("Expected expired at 1700000930, got %s", v3.Status)
	}

	v4 := VerifyAccessToken(token, "key-1", secret, 1700001000)
	if v4.Status != "expired" {
		t.Fatalf("Expected expired at 1700001000, got %s", v4.Status)
	}
}

func TestRefreshTokenRoundTripAndRejection(t *testing.T) {
	created, err := CreateRefreshToken()
	if err != nil {
		t.Fatalf("CreateRefreshToken failed: %v", err)
	}

	parsed, err := ParseRefreshToken(created.Token)
	if err != nil {
		t.Fatalf("ParseRefreshToken failed: %v", err)
	}
	if parsed.ID != created.ID {
		t.Fatalf("ID mismatch: %s != %s", parsed.ID, created.ID)
	}
	if parsed.SecretHash != created.SecretHash {
		t.Fatalf("SecretHash mismatch: %s != %s", parsed.SecretHash, created.SecretHash)
	}

	if _, err := ParseRefreshToken("aff_rt_v1.bad.bad"); err == nil {
		t.Fatalf("Expected bad token to fail")
	}

	golden, err := ParseRefreshToken("aff_rt_v1.AAECAwQFBgcICQoLDA0ODxAR.AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8")
	if err != nil {
		t.Fatalf("Failed to parse golden token: %v", err)
	}
	if golden.ID != "AAECAwQFBgcICQoLDA0ODxAR" {
		t.Errorf("Golden ID mismatch: %s", golden.ID)
	}
	if golden.SecretHash != "630dcd2966c4336691125448bbb25b4ff412a49c732db2c8abc1b8581bd710dd" {
		t.Errorf("Golden SecretHash mismatch: %s", golden.SecretHash)
	}
}

