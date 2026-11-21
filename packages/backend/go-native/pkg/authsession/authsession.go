package authsession

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

const (
	AccessTokenType      = "JWT"
	AccessTokenIssuer    = "nexio:auth"
	AccessTokenAudience  = "nexio:app"
	RefreshTokenPrefix   = "nex_rt_v1"
	ClockToleranceSecond = 30
)

type AccessTokenHeader struct {
	Alg string `json:"alg"`
	Typ string `json:"typ"`
	Kid string `json:"kid"`
}

type AccessTokenClaims struct {
	Sub string `json:"sub"`
	Sid string `json:"sid"`
	Typ string `json:"typ"`
	Iss string `json:"iss"`
	Aud string `json:"aud"`
	Iat int64  `json:"iat"`
	Exp int64  `json:"exp"`
}

type VerificationResult struct {
	Status        string  `json:"status"`
	UserID        *string `json:"userId,omitempty"`
	AuthSessionID *string `json:"authSessionId,omitempty"`
}

type RefreshToken struct {
	Token      string `json:"token"`
	ID         string `json:"id"`
	SecretHash string `json:"secretHash"`
}

type ParsedRefreshToken struct {
	ID         string `json:"id"`
	SecretHash string `json:"secretHash"`
}

func invalidResult() VerificationResult {
	return VerificationResult{Status: "invalid"}
}

func decodeSegment(segment string, target any) error {
	bytes, err := base64.RawURLEncoding.DecodeString(segment)
	if err != nil {
		return err
	}
	return json.Unmarshal(bytes, target)
}

func hashRefreshSecret(secret []byte) string {
	sum := sha256.Sum256(secret)
	return hex.EncodeToString(sum[:])
}

func AccessTokenKeyID(token string) (string, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return "", errors.New("invalid segment count")
	}
	var header AccessTokenHeader
	if err := decodeSegment(parts[0], &header); err != nil {
		return "", err
	}
	if header.Alg != "HS256" || header.Typ != AccessTokenType {
		return "", errors.New("unsupported alg or typ")
	}
	return header.Kid, nil
}

func SignAccessToken(userID, authSessionID, keyID string, secret []byte, issuedAt, expiresAt int64) (string, error) {
	if userID == "" || authSessionID == "" || keyID == "" {
		return "", errors.New("access_token_invalid_identity")
	}
	if len(secret) < 32 {
		return "", errors.New("access_token_signing_key_too_short")
	}
	if expiresAt <= issuedAt {
		return "", errors.New("access_token_invalid_expiry")
	}

	headerJSON, err := json.Marshal(AccessTokenHeader{
		Alg: "HS256",
		Typ: AccessTokenType,
		Kid: keyID,
	})
	if err != nil {
		return "", errors.New("access_token_encode_failed")
	}
	header := base64.RawURLEncoding.EncodeToString(headerJSON)

	claimsJSON, err := json.Marshal(AccessTokenClaims{
		Sub: userID,
		Sid: authSessionID,
		Typ: AccessTokenType,
		Iss: AccessTokenIssuer,
		Aud: AccessTokenAudience,
		Iat: issuedAt,
		Exp: expiresAt,
	})
	if err != nil {
		return "", errors.New("access_token_encode_failed")
	}
	claims := base64.RawURLEncoding.EncodeToString(claimsJSON)

	signingInput := fmt.Sprintf("%s.%s", header, claims)
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(signingInput))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return fmt.Sprintf("%s.%s", signingInput, signature), nil
}

func VerifyAccessToken(token, expectedKeyID string, secret []byte, now int64) VerificationResult {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return invalidResult()
	}

	var header AccessTokenHeader
	if err := decodeSegment(parts[0], &header); err != nil {
		return invalidResult()
	}
	if header.Alg != "HS256" || header.Typ != AccessTokenType || header.Kid != expectedKeyID {
		return invalidResult()
	}

	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return invalidResult()
	}

	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(fmt.Sprintf("%s.%s", parts[0], parts[1])))
	if !hmac.Equal(mac.Sum(nil), sigBytes) {
		return invalidResult()
	}

	var claims AccessTokenClaims
	if err := decodeSegment(parts[1], &claims); err != nil {
		return invalidResult()
	}

	if claims.Typ != AccessTokenType ||
		(claims.Iss != AccessTokenIssuer && claims.Iss != "affine:auth") ||
		(claims.Aud != AccessTokenAudience && claims.Aud != "affine:app") ||
		claims.Iat > now+ClockToleranceSecond {
		return invalidResult()
	}

	if claims.Exp+ClockToleranceSecond <= now {
		return VerificationResult{Status: "expired"}
	}

	if claims.Exp <= claims.Iat {
		return invalidResult()
	}

	return VerificationResult{
		Status:        "valid",
		UserID:        &claims.Sub,
		AuthSessionID: &claims.Sid,
	}
}

func CreateRefreshToken() (*RefreshToken, error) {
	idBytes := make([]byte, 18)
	if _, err := rand.Read(idBytes); err != nil {
		return nil, err
	}
	secretBytes := make([]byte, 32)
	if _, err := rand.Read(secretBytes); err != nil {
		return nil, err
	}

	id := base64.RawURLEncoding.EncodeToString(idBytes)
	secret := base64.RawURLEncoding.EncodeToString(secretBytes)
	token := fmt.Sprintf("%s.%s.%s", RefreshTokenPrefix, id, secret)

	return &RefreshToken{
		Token:      token,
		ID:         id,
		SecretHash: hashRefreshSecret(secretBytes),
	}, nil
}

func ParseRefreshToken(token string) (*ParsedRefreshToken, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 || (parts[0] != RefreshTokenPrefix && parts[0] != "aff_rt_v1") {
		return nil, errors.New("invalid refresh token format")
	}

	idBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil || len(idBytes) != 18 {
		return nil, errors.New("invalid refresh token id")
	}

	secretBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || len(secretBytes) != 32 {
		return nil, errors.New("invalid refresh token secret")
	}

	return &ParsedRefreshToken{
		ID:         parts[1],
		SecretHash: hashRefreshSecret(secretBytes),
	}, nil
}

