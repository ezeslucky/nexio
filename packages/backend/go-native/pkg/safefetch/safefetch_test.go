package safefetch

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAssertSafeURLBlocksLoopback(t *testing.T) {
	// Should block localhost
	err := AssertSafeURL("http://127.0.0.1:8080/secret", false)
	if err != ErrBlockedIP {
		t.Fatalf("expected ErrBlockedIP for 127.0.0.1, got %v", err)
	}

	// Should block 192.168.1.1
	err = AssertSafeURL("http://192.168.1.1/admin", false)
	if err != ErrBlockedIP {
		t.Fatalf("expected ErrBlockedIP for private IP, got %v", err)
	}

	// Should block ftp scheme
	err = AssertSafeURL("ftp://example.com/file", false)
	if err != ErrInvalidScheme {
		t.Fatalf("expected ErrInvalidScheme for ftp, got %v", err)
	}
}

func TestSafeFetchWithAllowedPrivate(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Custom", "test-val")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("hello from test server"))
	}))
	defer server.Close()

	ctx := context.Background()
	resp, err := SafeFetch(ctx, SafeFetchRequest{
		URL:                      server.URL,
		AllowPrivateTargetOrigin: true, // Allow since httptest binds to loopback
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if resp.Status != 200 {
		t.Fatalf("expected status 200, got %d", resp.Status)
	}
	if string(resp.Body) != "hello from test server" {
		t.Fatalf("expected body 'hello from test server', got '%s'", string(resp.Body))
	}
	if resp.Headers["x-custom"] != "test-val" {
		t.Fatalf("expected header 'test-val', got '%s'", resp.Headers["x-custom"])
	}
}

