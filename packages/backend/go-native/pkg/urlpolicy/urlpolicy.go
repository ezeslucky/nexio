package urlpolicy

import (
	"errors"
	"net/url"
	"strings"
)

var ErrDenied = errors.New("URL is not allowed")

type UrlQueryPair struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

func parseHttpURL(input, baseURL string) (*url.URL, error) {
	if input == "" {
		return nil, ErrDenied
	}

	base, err := url.Parse(baseURL)
	if err != nil {
		return nil, ErrDenied
	}

	rel, err := url.Parse(input)
	if err != nil {
		return nil, ErrDenied
	}

	resolved := base.ResolveReference(rel)
	scheme := strings.ToLower(resolved.Scheme)
	if scheme != "http" && scheme != "https" {
		return nil, ErrDenied
	}

	if resolved.User != nil {
		return nil, ErrDenied
	}

	return resolved, nil
}

func getOrigin(u *url.URL) string {
	return strings.ToLower(u.Scheme) + "://" + strings.ToLower(u.Host)
}

func hasAllowedOrigin(targetURL *url.URL, allowedOrigins []string) bool {
	targetOrigin := getOrigin(targetURL)
	for _, originStr := range allowedOrigins {
		parsed, err := url.Parse(originStr)
		if err != nil {
			continue
		}
		scheme := strings.ToLower(parsed.Scheme)
		if scheme == "http" || scheme == "https" {
			if targetOrigin == getOrigin(parsed) {
				return true
			}
		}
	}
	return false
}

func matchesTrustedDomain(targetURL *url.URL, trustedDomains []string) bool {
	hostname := strings.TrimSuffix(strings.ToLower(targetURL.Hostname()), ".")
	if hostname == "" {
		return false
	}

	for _, domain := range trustedDomains {
		domain = strings.TrimSuffix(strings.ToLower(domain), ".")
		if domain == "" {
			continue
		}
		if hostname == domain || strings.HasSuffix(hostname, "."+domain) {
			return true
		}
	}
	return false
}

func pathIsWithin(path, basePath string) bool {
	if basePath == "/" || basePath == "" || path == basePath {
		return true
	}
	if strings.HasPrefix(path, basePath) {
		suffix := path[len(basePath):]
		return strings.HasPrefix(suffix, "/")
	}
	return false
}

func applyQueryPairs(targetURL *url.URL, queryPairs []UrlQueryPair) {
	if len(queryPairs) == 0 {
		return
	}
	q := targetURL.Query()
	for _, pair := range queryPairs {
		q.Set(pair.Name, pair.Value)
	}
	targetURL.RawQuery = q.Encode()
}

// BuildSafeCallbackUrl validates that input resolves to an allowed origin and appends query pairs.
func BuildSafeCallbackUrl(input, baseURL string, allowedOrigins []string, queryPairs []UrlQueryPair) (string, error) {
	u, err := parseHttpURL(input, baseURL)
	if err != nil {
		return "", err
	}
	if !hasAllowedOrigin(u, allowedOrigins) {
		return "", ErrDenied
	}
	applyQueryPairs(u, queryPairs)
	return u.String(), nil
}

// EvaluateRedirectUri validates that input matches an allowed origin or trusted domain.
func EvaluateRedirectUri(input, baseURL string, allowedOrigins, trustedDomains []string, queryPairs []UrlQueryPair) (string, error) {
	u, err := parseHttpURL(input, baseURL)
	if err != nil {
		return "", err
	}
	if !hasAllowedOrigin(u, allowedOrigins) && !matchesTrustedDomain(u, trustedDomains) {
		return "", ErrDenied
	}
	applyQueryPairs(u, queryPairs)
	return u.String(), nil
}

// EvaluateLocalRedirect validates that input is strictly within allowed local base URLs.
func EvaluateLocalRedirect(input, baseURL string, allowedBases []string) (string, error) {
	u, err := parseHttpURL(input, baseURL)
	if err != nil {
		return "", err
	}

	targetOrigin := getOrigin(u)
	allowed := false
	for _, allowedBase := range allowedBases {
		base, err := url.Parse(allowedBase)
		if err != nil {
			continue
		}
		scheme := strings.ToLower(base.Scheme)
		if (scheme == "http" || scheme == "https") && targetOrigin == getOrigin(base) {
			basePath := strings.TrimSuffix(base.Path, "/")
			if pathIsWithin(u.Path, basePath) {
				allowed = true
				break
			}
		}
	}

	if !allowed {
		return "", ErrDenied
	}
	return u.String(), nil
}

