package safefetch

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"
)

var (
	ErrBlockedIP      = errors.New("access to private or restricted IP address is blocked")
	ErrInvalidScheme  = errors.New("only http and https schemes are supported")
	ErrMaxBytesExceed = errors.New("response payload exceeded maximum bytes limit")
)

type SafeFetchRequest struct {
	URL                       string            `json:"url"`
	Method                    string            `json:"method"`
	Headers                   map[string]string `json:"headers"`
	Body                      []byte            `json:"body"`
	TimeoutMs                 uint32            `json:"timeout_ms"`
	MaxRedirects              uint32            `json:"max_redirects"`
	MaxBytes                  uint32            `json:"max_bytes"`
	AllowPrivateTargetOrigin  bool              `json:"allow_private_target_origin"`
	AllowedHosts              []string          `json:"allowed_hosts"`
	AllowHTTP                 bool              `json:"allow_http"`
}

type SafeFetchResponse struct {
	Status   int               `json:"status"`
	FinalURL string            `json:"final_url"`
	Headers  map[string]string `json:"headers"`
	Body     []byte            `json:"body"`
}

// IsPrivateOrRestrictedIP returns true if the IP address is internal, private, loopback, or multicast.
func IsPrivateOrRestrictedIP(ip net.IP) bool {
	if ip == nil {
		return true
	}
	if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() {
		return true
	}
	// Check IPv4-mapped IPv6 loopback / private
	if ipv4 := ip.To4(); ipv4 != nil {
		return ipv4.IsLoopback() || ipv4.IsPrivate() || ipv4.IsLinkLocalUnicast() || ipv4.IsLinkLocalMulticast() || ipv4.IsMulticast() || ipv4.IsUnspecified()
	}
	return false
}

// AssertSafeURL verifies that the URL does not resolve to private/internal networks (SSRF prevention).
func AssertSafeURL(rawURL string, allowPrivate bool) error {
	u, err := url.Parse(rawURL)
	if err != nil {
		return err
	}

	scheme := strings.ToLower(u.Scheme)
	if scheme != "http" && scheme != "https" {
		return ErrInvalidScheme
	}

	hostname := u.Hostname()
	if hostname == "" {
		return errors.New("empty hostname in URL")
	}

	if allowPrivate {
		return nil
	}

	// If hostname is directly an IP literal
	if ip := net.ParseIP(hostname); ip != nil {
		if IsPrivateOrRestrictedIP(ip) {
			return ErrBlockedIP
		}
		return nil
	}

	// Resolve hostname
	ips, err := net.LookupIP(hostname)
	if err != nil {
		return fmt.Errorf("DNS resolution failed: %w", err)
	}

	for _, ip := range ips {
		if IsPrivateOrRestrictedIP(ip) {
			return ErrBlockedIP
		}
	}
	return nil
}

// SafeFetch performs an SSRF-safe HTTP request.
func SafeFetch(ctx context.Context, req SafeFetchRequest) (*SafeFetchResponse, error) {
	if err := AssertSafeURL(req.URL, req.AllowPrivateTargetOrigin); err != nil {
		return nil, err
	}

	timeout := 10 * time.Second
	if req.TimeoutMs > 0 {
		timeout = time.Duration(req.TimeoutMs) * time.Millisecond
	}

	maxRedirects := 5
	if req.MaxRedirects > 0 {
		maxRedirects = int(req.MaxRedirects)
	}

	maxBytes := int64(10 * 1024 * 1024) // 10MB default
	if req.MaxBytes > 0 {
		maxBytes = int64(req.MaxBytes)
	}

	// Custom dialer that checks every IP on connection (prevents DNS rebinding)
	dialer := &net.Dialer{
		Timeout: timeout,
	}

	transport := &http.Transport{
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}

			ips, err := net.DefaultResolver.LookupIP(ctx, "ip", host)
			if err != nil {
				return nil, err
			}

			for _, ip := range ips {
				if !req.AllowPrivateTargetOrigin && IsPrivateOrRestrictedIP(ip) {
					return nil, ErrBlockedIP
				}
				conn, err := dialer.DialContext(ctx, network, net.JoinHostPort(ip.String(), port))
				if err == nil {
					return conn, nil
				}
			}
			return nil, fmt.Errorf("failed to connect to any resolved IP for %s", host)
		},
	}

	redirectCount := 0
	client := &http.Client{
		Transport: transport,
		Timeout:   timeout,
		CheckRedirect: func(r *http.Request, via []*http.Request) error {
			redirectCount++
			if redirectCount > maxRedirects {
				return errors.New("stopped after max redirects")
			}
			if err := AssertSafeURL(r.URL.String(), req.AllowPrivateTargetOrigin); err != nil {
				return err
			}
			return nil
		},
	}

	method := req.Method
	if method == "" {
		method = "GET"
	}

	var bodyReader io.Reader
	if len(req.Body) > 0 {
		bodyReader = strings.NewReader(string(req.Body))
	}

	httpReq, err := http.NewRequestWithContext(ctx, strings.ToUpper(method), req.URL, bodyReader)
	if err != nil {
		return nil, err
	}

	for k, v := range req.Headers {
		httpReq.Header.Set(k, v)
	}

	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	reader := io.LimitReader(resp.Body, maxBytes+1)
	bodyBytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if int64(len(bodyBytes)) > maxBytes {
		return nil, ErrMaxBytesExceed
	}

	respHeaders := make(map[string]string)
	for k := range resp.Header {
		respHeaders[strings.ToLower(k)] = resp.Header.Get(k)
	}

	return &SafeFetchResponse{
		Status:   resp.StatusCode,
		FinalURL: resp.Request.URL.String(),
		Headers:  respHeaders,
		Body:     bodyBytes,
	}, nil
}

