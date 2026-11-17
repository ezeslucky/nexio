package urlpolicy

import (
	"testing"
)

func TestBuildSafeCallbackUrl(t *testing.T) {
	baseURL := "https://app.nexio.local"
	allowed := []string{"https://app.nexio.local"}

	// Valid relative url
	res, err := BuildSafeCallbackUrl("/oauth/callback", baseURL, allowed, []UrlQueryPair{
		{Name: "code", Value: "123"},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res != "https://app.nexio.local/oauth/callback?code=123" {
		t.Fatalf("unexpected result: %s", res)
	}

	// Disallowed external origin
	_, err = BuildSafeCallbackUrl("https://evil.com/callback", baseURL, allowed, nil)
	if err != ErrDenied {
		t.Fatalf("expected ErrDenied, got %v", err)
	}
}

func TestEvaluateRedirectUri(t *testing.T) {
	baseURL := "https://app.nexio.local"
	allowed := []string{"https://app.nexio.local"}
	trusted := []string{"nexio.com", "github.com"}

	// Match trusted domain
	res, err := EvaluateRedirectUri("https://sub.nexio.com/auth", baseURL, allowed, trusted, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res != "https://sub.nexio.com/auth" {
		t.Fatalf("unexpected result: %s", res)
	}

	// Untrusted domain
	_, err = EvaluateRedirectUri("https://attacker.com/login", baseURL, allowed, trusted, nil)
	if err != ErrDenied {
		t.Fatalf("expected ErrDenied, got %v", err)
	}
}

func TestEvaluateLocalRedirect(t *testing.T) {
	baseURL := "https://app.nexio.local"
	allowedBases := []string{"https://app.nexio.local/workspace"}

	// Valid subpath
	res, err := EvaluateLocalRedirect("/workspace/doc1", baseURL, allowedBases)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res != "https://app.nexio.local/workspace/doc1" {
		t.Fatalf("unexpected result: %s", res)
	}

	// Outside subpath
	_, err = EvaluateLocalRedirect("/admin", baseURL, allowedBases)
	if err != ErrDenied {
		t.Fatalf("expected ErrDenied, got %v", err)
	}
}

