package server

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/authsession"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/crdt"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/filetype"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/hashcash"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/nbstore"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/tokenizer"
)

type UserInfo struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Email         string   `json:"email"`
	EmailVerified bool     `json:"emailVerified"`
	HasPassword   bool     `json:"hasPassword"`
	AvatarURL     string   `json:"avatarUrl"`
	Features      []string `json:"features"`
}

type AuthState struct {
	mu          sync.RWMutex
	loggedOut   bool
	defaultUser UserInfo
	sessions    map[string]UserInfo
}

type Server struct {
	cfg       Config
	pool      *nbstore.DocStoragePool
	hub       *Hub
	mux       *http.ServeMux
	authState *AuthState
}

func NewServer(cfg Config) *Server {
	pool := nbstore.NewDocStoragePool()
	hub := NewHub(pool)
	go hub.Run()

	defaultUser := UserInfo{
		ID:            "user-dev",
		Name:          "Nexio User",
		Email:         "user@technexio.me",
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	authState := &AuthState{
		loggedOut:   false,
		defaultUser: defaultUser,
		sessions:    make(map[string]UserInfo),
	}

	s := &Server{
		cfg:       cfg,
		pool:      pool,
		hub:       hub,
		mux:       http.NewServeMux(),
		authState: authState,
	}

	s.routes()
	return s
}

func (s *Server) routes() {
	// Root & Installer (User-Agent detection: curl -> install.sh, powershell -> install.ps1)
	s.mux.HandleFunc("GET /{$}", s.handleRootOrInstaller)
	s.mux.HandleFunc("GET /install.sh", s.handleInstallSh)
	s.mux.HandleFunc("GET /install.ps1", s.handleInstallPs1)
	s.mux.HandleFunc("GET /install", s.handleInstallAuto)

	s.mux.HandleFunc("GET /api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"runtime":   "golang",
		})
	})
	s.mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "healthy",
			"timestamp": time.Now().UTC(),
			"runtime":   "golang",
		})
	})

	// Auth Endpoints (Web & Native - both POST and GET supported for preflight/methods)
	for _, prefix := range []string{"/api/auth", "/api/v1/auth"} {
		s.mux.HandleFunc("POST "+prefix+"/preflight", s.handlePreflight)
		s.mux.HandleFunc("GET "+prefix+"/preflight", s.handlePreflight)
		s.mux.HandleFunc("GET "+prefix+"/session", s.handleSession)
		s.mux.HandleFunc("GET "+prefix+"/methods", s.handleMethods)
		s.mux.HandleFunc("POST "+prefix+"/sign-in", s.handleSignIn)
		s.mux.HandleFunc("POST "+prefix+"/sign-out", s.handleSignOut)
		s.mux.HandleFunc("POST "+prefix+"/magic-link", s.handleMagicLink)
		s.mux.HandleFunc("POST "+prefix+"/captcha", s.handleCaptcha)
		s.mux.HandleFunc("GET "+prefix+"/sessions", s.handleListSessions)
		s.mux.HandleFunc("POST "+prefix+"/sessions/revoke-all", s.handleRevokeAllSessions)
		s.mux.HandleFunc("DELETE "+prefix+"/sessions/{id}", s.handleRevokeSession)
		s.mux.HandleFunc("POST "+prefix+"/verify", s.handleVerifyToken)
		s.mux.HandleFunc("POST "+prefix+"/open-app/sign-in", s.handleSignIn)
	}

	// OAuth Endpoints
	for _, prefix := range []string{"/api/oauth", "/api/v1/oauth"} {
		s.mux.HandleFunc("POST "+prefix+"/preflight", s.handleOAuthPreflight)
		s.mux.HandleFunc("GET "+prefix+"/login", s.handleOAuthLogin)
		s.mux.HandleFunc("GET "+prefix+"/callback", s.handleOAuthLogin)
		s.mux.HandleFunc("POST "+prefix+"/callback", s.handleOAuthLogin)
	}
	s.mux.HandleFunc("GET /oauth/login", s.handleOAuthLogin)
	s.mux.HandleFunc("GET /oauth/callback", s.handleOAuthLogin)

	// Download Endpoints (System-wise direct download)
	s.mux.HandleFunc("GET /api/download", s.handleDownload)
	s.mux.HandleFunc("GET /api/v1/download", s.handleDownload)

	// Workspace Endpoints (both /api/workspaces and /api/v1/workspaces)
	for _, prefix := range []string{"/api/workspaces", "/api/v1/workspaces"} {
		s.mux.HandleFunc("POST "+prefix+"/init", s.handleWorkspaceInit)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/docs/{doc_id}", s.handleGetDoc)
		s.mux.HandleFunc("POST "+prefix+"/{workspace_id}/docs/{doc_id}/update", s.handlePushDocUpdate)
		s.mux.HandleFunc("DELETE "+prefix+"/{workspace_id}/docs/{doc_id}", s.handleDeleteDoc)
		s.mux.HandleFunc("PUT "+prefix+"/{workspace_id}/blobs/{key}", s.handlePutBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blobs/{key}", s.handleGetBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blobs/v1/{key}", s.handleGetBlob)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/blob-manifest/v1", s.handleBlobManifest)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/readable-blob-manifest/v1", s.handleBlobManifest)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/public-docs/{doc_id}", s.handleGetDoc)
		s.mux.HandleFunc("GET "+prefix+"/{workspace_id}/public-docs/{doc_id}/root-doc", s.handleGetDoc)
	}

	// Telemetry Endpoints
	for _, prefix := range []string{"/api/telemetry", "/api/v1/telemetry"} {
		s.mux.HandleFunc("POST "+prefix+"/collect", s.handleTelemetry)
	}

	// Socket.IO / Engine.IO v4 Handshake & Realtime
	s.mux.HandleFunc("/socket.io/", s.handleSocketIO)

	// AI & Tokenizer
	s.mux.HandleFunc("POST /api/v1/ai/tokenizer/count", s.handleTokenCount)

	// Security & Hashcash
	s.mux.HandleFunc("POST /api/v1/security/hashcash/mint", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Resource string `json:"resource"`
			Bits     uint32 `json:"bits"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		stamp := hashcash.MintChallengeResponse(req.Resource, req.Bits)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"stamp": stamp})
	})

	// Realtime WebSocket Collaboration
	s.mux.HandleFunc("GET /ws", s.hub.HandleWS)

	// GraphQL Gateway
	s.mux.HandleFunc("/graphql", s.handleGraphQL)
	s.mux.HandleFunc("/api/graphql", s.handleGraphQL)
	s.mux.HandleFunc("/api/v1/graphql", s.handleGraphQL)
}

func (s *Server) getStorage(workspaceID string) (*nbstore.SqliteDocStorage, error) {
	storage, err := s.pool.Get(workspaceID)
	if err == nil {
		return storage, nil
	}
	dbPath := filepath.Join(s.cfg.StoragePath, fmt.Sprintf("%s.db", workspaceID))
	return s.pool.Connect(workspaceID, dbPath)
}

func (s *Server) getSessionUser(r *http.Request) *UserInfo {
	s.authState.mu.RLock()
	defer s.authState.mu.RUnlock()

	if s.authState.loggedOut {
		return nil
	}

	var sessionID string
	if c, err := r.Cookie("affine_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	} else if c, err := r.Cookie("nexio_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	}

	if sessionID != "" {
		if u, ok := s.authState.sessions[sessionID]; ok {
			return &u
		}
	}

	authHeader := r.Header.Get("Authorization")
	if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
		token := strings.TrimSpace(authHeader[7:])
		if u, ok := s.authState.sessions[token]; ok {
			return &u
		}
	}

	u := s.authState.defaultUser
	return &u
}

func (s *Server) handlePreflight(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"registered": true,
		"methods": map[string]any{
			"password":  map[string]any{"available": true},
			"magicLink": map[string]any{"available": true},
			"oauth": map[string]any{
				"available": true,
				"providers": []string{"Google"},
			},
			"passkey": map[string]any{
				"available":    false,
				"discoverable": false,
			},
		},
	})
}

func (s *Server) handleSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "no-store")
	u := s.getSessionUser(r)
	if u == nil {
		json.NewEncoder(w).Encode(map[string]any{
			"user": nil,
		})
		return
	}

	// Ensure cookie exists so browser preserves state
	if c, err := r.Cookie("affine_session"); err != nil || c.Value == "" {
		sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())
		s.authState.mu.Lock()
		s.authState.sessions[sessionID] = *u
		s.authState.mu.Unlock()

		for _, cookieName := range []string{"affine_session", "nexio_session"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    sessionID,
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
		for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    u.ID,
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
		for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
			http.SetCookie(w, &http.Cookie{
				Name:     cookieName,
				Value:    "csrf_token_dev",
				Path:     "/",
				MaxAge:   86400 * 7,
				SameSite: http.SameSiteLaxMode,
			})
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"user": map[string]any{
			"id":            u.ID,
			"name":          u.Name,
			"email":         u.Email,
			"emailVerified": u.EmailVerified,
			"hasPassword":   u.HasPassword,
			"avatarUrl":     u.AvatarURL,
			"features":      u.Features,
		},
	})
}

func (s *Server) handleMethods(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"password": map[string]any{"bound": true},
		"oauth": map[string]any{
			"bound":     true,
			"providers": []string{"Google"},
		},
		"passkey": map[string]any{
			"bound": false,
			"count": 0,
		},
	})
}

func (s *Server) handleSignIn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID   string `json:"user_id"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil && err != io.EOF {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	email := req.Email
	if email == "" {
		email = "user@technexio.me"
	}
	name := ""
	parts := strings.Split(email, "@")
	if len(parts) > 0 && parts[0] != "" {
		name = parts[0]
	} else {
		name = "Nexio User"
	}

	userID := req.UserID
	if userID == "" {
		userID = "user-dev"
	}

	user := UserInfo{
		ID:            userID,
		Name:          name,
		Email:         email,
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())

	s.authState.mu.Lock()
	s.authState.loggedOut = false
	s.authState.defaultUser = user
	s.authState.sessions[sessionID] = user
	s.authState.mu.Unlock()

	now := time.Now().Unix()
	exp := now + 86400*7 // 7 days

	token, _ := authsession.SignAccessToken(user.ID, sessionID, "key-1", []byte(s.cfg.JWTSecret), now, exp)
	refreshToken, _ := authsession.CreateRefreshToken()

	for _, cookieName := range []string{"affine_session", "nexio_session"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    sessionID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    user.ID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "csrf_token_dev",
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"id":            user.ID,
		"name":          user.Name,
		"email":         user.Email,
		"emailVerified": user.EmailVerified,
		"hasPassword":   user.HasPassword,
		"avatarUrl":     user.AvatarURL,
		"features":      user.Features,
		"token":         token,
		"refresh_token": refreshToken,
		"user_id":       user.ID,
		"session_id":    sessionID,
		"expires_at":    exp,
	})
}

func (s *Server) handleSignOut(w http.ResponseWriter, r *http.Request) {
	s.authState.mu.Lock()
	var sessionID string
	if c, err := r.Cookie("affine_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	} else if c, err := r.Cookie("nexio_session"); err == nil && c.Value != "" {
		sessionID = c.Value
	}
	if sessionID != "" {
		delete(s.authState.sessions, sessionID)
	}
	s.authState.loggedOut = true
	s.authState.mu.Unlock()

	for _, cookieName := range []string{"affine_session", "nexio_session", "affine_user_id", "nexio_user_id", "affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			Expires:  time.Unix(0, 0),
			SameSite: http.SameSiteLaxMode,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("{}"))
}

func (s *Server) handleOAuthPreflight(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Provider    string `json:"provider"`
		Client      string `json:"client"`
		RedirectURI string `json:"redirect_uri"`
		ClientNonce string `json:"client_nonce"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	provider := req.Provider
	if provider == "" {
		provider = "Google"
	}
	redirectURI := req.RedirectURI
	if redirectURI == "" {
		redirectURI = "/"
	}

	loginURL := fmt.Sprintf("/api/oauth/login?provider=%s&redirect_uri=%s", provider, redirectURI)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"url": loginURL,
	})
}

func (s *Server) handleOAuthLogin(w http.ResponseWriter, r *http.Request) {
	provider := r.URL.Query().Get("provider")
	if provider == "" {
		provider = "Google"
	}
	redirectURI := r.URL.Query().Get("redirect_uri")
	if redirectURI == "" {
		redirectURI = "/"
	}

	userID := fmt.Sprintf("%s-user", strings.ToLower(provider))
	name := fmt.Sprintf("%s User", provider)
	email := fmt.Sprintf("%s.user@technexio.me", strings.ToLower(provider))

	user := UserInfo{
		ID:            userID,
		Name:          name,
		Email:         email,
		EmailVerified: true,
		HasPassword:   true,
		AvatarURL:     "",
		Features:      []string{},
	}

	sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())

	s.authState.mu.Lock()
	s.authState.loggedOut = false
	s.authState.defaultUser = user
	s.authState.sessions[sessionID] = user
	s.authState.mu.Unlock()

	for _, cookieName := range []string{"affine_session", "nexio_session"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    sessionID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_user_id", "nexio_user_id"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    user.ID,
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}
	for _, cookieName := range []string{"affine_csrf_token", "nexio_csrf_token"} {
		http.SetCookie(w, &http.Cookie{
			Name:     cookieName,
			Value:    "csrf_token_dev",
			Path:     "/",
			MaxAge:   86400 * 7,
			SameSite: http.SameSiteLaxMode,
		})
	}

	http.Redirect(w, r, redirectURI, http.StatusFound)
}

func (s *Server) handleRootOrInstaller(w http.ResponseWriter, r *http.Request) {
	ua := strings.ToLower(r.Header.Get("User-Agent"))
	if strings.Contains(ua, "curl") || strings.Contains(ua, "wget") {
		s.handleInstallSh(w, r)
		return
	}
	if strings.Contains(ua, "powershell") {
		s.handleInstallPs1(w, r)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"service":   "Nexio Backend Go Server",
		"version":   "0.27.5",
		"status":    "running",
		"github":    "https://github.com/ezeslucky/nexio",
		"installer": "https://www.technexio.me/install.sh",
	})
}

func (s *Server) handleInstallSh(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")

	paths := []string{
		"downloads/install.sh",
		"packages/backend/go-native/downloads/install.sh",
		"../../downloads/install.sh",
	}
	for _, p := range paths {
		if content, err := os.ReadFile(p); err == nil && len(content) > 0 {
			w.Write(content)
			return
		}
	}
	w.Write([]byte(defaultInstallSh))
}

func (s *Server) handleInstallPs1(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache")

	paths := []string{
		"downloads/install.ps1",
		"packages/backend/go-native/downloads/install.ps1",
		"../../downloads/install.ps1",
	}
	for _, p := range paths {
		if content, err := os.ReadFile(p); err == nil && len(content) > 0 {
			w.Write(content)
			return
		}
	}
	w.Write([]byte(defaultInstallPs1))
}

func (s *Server) handleInstallAuto(w http.ResponseWriter, r *http.Request) {
	ua := strings.ToLower(r.Header.Get("User-Agent"))
	if strings.Contains(ua, "powershell") {
		s.handleInstallPs1(w, r)
	} else {
		s.handleInstallSh(w, r)
	}
}

func (s *Server) handleBlobManifest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"version":    1,
		"entries":    []any{},
		"nextCursor": nil,
	})
}

func (s *Server) handleTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(`{"success":true}`))
}

func (s *Server) handleSocketIO(w http.ResponseWriter, r *http.Request) {
	// Upgrade to WebSocket if requested
	if strings.ToLower(r.Header.Get("Upgrade")) == "websocket" {
		s.hub.HandleWS(w, r)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=UTF-8")
	w.Header().Set("Cache-Control", "no-store")

	sid := r.URL.Query().Get("sid")
	if r.Method == http.MethodGet {
		if sid == "" {
			// Engine.IO handshake
			newSid := fmt.Sprintf("eio_%d", time.Now().UnixNano())
			handshake := fmt.Sprintf(`0{"sid":"%s","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}`, newSid)
			w.Write([]byte(handshake))
			return
		}
		// Subsequent polling returns connect acknowledgment
		w.Write([]byte("40"))
		return
	}

	if r.Method == http.MethodPost {
		w.Write([]byte("ok"))
		return
	}
}

func (s *Server) handleDownload(w http.ResponseWriter, r *http.Request) {
	platform := strings.ToLower(r.URL.Query().Get("platform"))
	arch := strings.ToLower(r.URL.Query().Get("arch"))
	format := strings.ToLower(r.URL.Query().Get("format"))

	// Auto-detect from User-Agent if platform query parameter is not passed
	if platform == "" {
		ua := strings.ToLower(r.Header.Get("User-Agent"))
		if strings.Contains(ua, "android") {
			platform = "android"
		} else if strings.Contains(ua, "iphone") || strings.Contains(ua, "ipad") {
			platform = "ios"
		} else if strings.Contains(ua, "mac") {
			platform = "mac"
		} else if strings.Contains(ua, "linux") {
			platform = "linux"
		} else {
			platform = "windows"
		}
	}

	var filename string
	var contentType string

	switch platform {
	case "windows", "win":
		if format == "msi" {
			filename = "Nexio-Setup-0.27.5-x64.msi"
			contentType = "application/x-msi"
		} else if arch == "arm64" {
			filename = "Nexio-Setup-0.27.5-arm64.exe"
			contentType = "application/vnd.microsoft.portable-executable"
		} else {
			filename = "Nexio-Setup-0.27.5-x64.exe"
			contentType = "application/vnd.microsoft.portable-executable"
		}
	case "mac", "darwin", "macos":
		if arch == "intel" || arch == "x64" {
			filename = "Nexio-0.27.5-x64.dmg"
		} else {
			filename = "Nexio-0.27.5-arm64.dmg"
		}
		contentType = "application/x-apple-diskimage"
	case "linux":
		if format == "deb" {
			filename = "nexio_0.27.5_amd64.deb"
			contentType = "application/vnd.debian.binary-package"
		} else if format == "tar.gz" || format == "tar" {
			filename = "nexio-0.27.5-linux-x64.tar.gz"
			contentType = "application/gzip"
		} else {
			filename = "Nexio-0.27.5.AppImage"
			contentType = "application/x-executable"
		}
	case "android":
		if format == "universal" {
			filename = "Nexio-0.27.5-universal.apk"
		} else {
			filename = "Nexio-0.27.5-arm64-v8a.apk"
		}
		contentType = "application/vnd.android.package-archive"
	case "ios":
		http.Redirect(w, r, "https://testflight.apple.com/", http.StatusFound)
		return
	default:
		filename = "Nexio-Setup-0.27.5-x64.exe"
		contentType = "application/vnd.microsoft.portable-executable"
	}

	// Candidate paths on disk
	candidatePaths := []string{
		filepath.Join("downloads", filename),
		filepath.Join("..", "..", "downloads", filename),
		filepath.Join("build-artifacts", filename),
		filepath.Join("..", "..", "build-artifacts", filename),
		filepath.Join("C:\\Users\\aurob\\ALLCODING\\open-source\\nexio\\downloads", filename),
	}

	for _, p := range candidatePaths {
		if fi, err := os.Stat(p); err == nil && !fi.IsDir() {
			w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", filename))
			w.Header().Set("Content-Type", contentType)
			w.Header().Set("Cache-Control", "no-cache")
			http.ServeFile(w, r, p)
			return
		}
	}

	// Fallback redirect to GitHub releases
	http.Redirect(w, r, fmt.Sprintf("https://github.com/ezeslucky/nexio/releases/latest/download/%s", filename), http.StatusFound)
}

func (s *Server) handleMagicLink(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"verifyToken": "dev-magic-link-token",
	})
}

func (s *Server) handleCaptcha(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"challenge": "challenge_dev",
		"resource":  "auth",
		"bits":      0,
	})
}

func (s *Server) handleListSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode([]any{})
}

func (s *Server) handleRevokeAllSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{})
}

func (s *Server) handleRevokeSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{})
}

// Handler: Verify Token
func (s *Server) handleVerifyToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res := authsession.VerifyAccessToken(req.Token, "key-1", []byte(s.cfg.JWTSecret), time.Now().Unix())
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

// Handler: Workspace Init
func (s *Server) handleWorkspaceInit(w http.ResponseWriter, r *http.Request) {
	var req struct {
		WorkspaceID string `json:"workspace_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	storage, err := s.getStorage(req.WorkspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	_ = storage.SetSpaceID(req.WorkspaceID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"workspace_id": req.WorkspaceID,
		"initialized":  true,
	})
}

// Handler: Get Document Snapshot & Updates
func (s *Server) handleGetDoc(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	snap, _ := storage.GetDocSnapshot(docID)
	updates, _ := storage.GetDocUpdates(docID)

	var snapBase64 *string
	if snap != nil {
		b := base64.StdEncoding.EncodeToString(snap.Data)
		snapBase64 = &b
	}

	var updateList []map[string]any
	for _, u := range updates {
		updateList = append(updateList, map[string]any{
			"timestamp": u.CreatedAt,
			"bin":       base64.StdEncoding.EncodeToString(u.Data),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"doc_id":   docID,
		"snapshot": snapBase64,
		"updates":  updateList,
	})
}

// Handler: Push Document Update
func (s *Server) handlePushDocUpdate(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	data, err := io.ReadAll(io.LimitReader(r.Body, 50*1024*1024))
	if err != nil || len(data) == 0 {
		http.Error(w, "empty update body", http.StatusBadRequest)
		return
	}

	// Validate CRDT binary update format
	if !crdt.ValidateDocUpdate(data) {
		http.Error(w, "invalid CRDT Yjs update binary", http.StatusBadRequest)
		return
	}

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	ts, err := storage.PushUpdate(docID, data)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"doc_id":    docID,
		"timestamp": ts,
		"accepted":  true,
	})
}

// Handler: Delete Document
func (s *Server) handleDeleteDoc(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	docID := r.PathValue("doc_id")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = storage.DeleteDoc(docID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"deleted": true})
}

// Handler: Put Blob
func (s *Server) handlePutBlob(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	key := r.PathValue("key")

	data, err := io.ReadAll(io.LimitReader(r.Body, 100*1024*1024))
	if err != nil || len(data) == 0 {
		http.Error(w, "empty blob data", http.StatusBadRequest)
		return
	}

	mime := r.Header.Get("Content-Type")
	if mime == "" || mime == "application/octet-stream" {
		mime = filetype.GetMime(data)
	}

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := storage.SetBlob(key, mime, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"key":  key,
		"mime": mime,
		"size": len(data),
	})
}

// Handler: Get Blob
func (s *Server) handleGetBlob(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.PathValue("workspace_id")
	key := r.PathValue("key")

	storage, err := s.getStorage(workspaceID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	blob, err := storage.GetBlob(key)
	if err != nil || blob == nil {
		http.NotFound(w, r)
		return
	}

	w.Header().Set("Content-Type", blob.Mime)
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(blob.Data)
}

// Handler: AI Tokenizer Count
func (s *Server) handleTokenCount(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Model   string `json:"model"`
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	tok, err := tokenizer.FromModelName(req.Model)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	count := tok.Count(req.Content, nil)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"count": count})
}

type GraphQLRequest struct {
	Query         string         `json:"query"`
	OperationName string         `json:"operationName"`
	Variables     map[string]any `json:"variables"`
}

func (s *Server) handleGraphQL(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(map[string]any{
			"status": "ok",
			"info":   "Nexio GraphQL Gateway",
		})
		return
	}

	var req GraphQLRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"data": map[string]any{},
		})
		return
	}

	op := req.OperationName
	query := strings.ToLower(req.Query)
	data := make(map[string]any)

	u := s.getSessionUser(r)

	if op == "readNotification" || strings.Contains(query, "readnotification") {
		data["readNotification"] = true
	}
	if op == "readAllNotifications" || strings.Contains(query, "readallnotifications") {
		data["readAllNotifications"] = true
	}

	if strings.Contains(query, "currentuser") || op == "getCurrentUser" || op == "listNotifications" || strings.Contains(query, "notifications") {
		if u != nil {
			data["currentUser"] = map[string]any{
				"__typename":    "UserType",
				"id":            u.ID,
				"name":          u.Name,
				"email":         u.Email,
				"avatarUrl":     u.AvatarURL,
				"hasPassword":   u.HasPassword,
				"emailVerified": u.EmailVerified,
				"features":      u.Features,
				"subscription":  nil,
				"invoices":      []any{},
				"settings": map[string]any{
					"__typename":             "UserSettingsType",
					"receiveInvitationEmail": false,
					"receiveMentionEmail":    false,
					"receiveCommentEmail":    false,
				},
				"notifications": map[string]any{
					"__typename": "NotificationConnection",
					"totalCount": 0,
					"edges":      []any{},
					"pageInfo": map[string]any{
						"__typename":      "PageInfo",
						"startCursor":     nil,
						"endCursor":       nil,
						"hasNextPage":     false,
						"hasPreviousPage": false,
					},
				},
				"copilotQuota": map[string]any{
					"__typename": "CopilotQuotaType",
					"limit":      1000,
					"used":       0,
					"resetAt":    time.Now().Add(24 * time.Hour).Format(time.RFC3339),
				},
			}
		} else {
			data["currentUser"] = nil
		}
	}

	if strings.Contains(query, "serverconfig") || op == "serverConfig" {
		data["serverConfig"] = map[string]any{
			"__typename": "ServerConfigType",
			"version":     "0.27.5",
			"baseUrl":     "http://localhost:8080",
			"name":        "Nexio Cloud",
			"features": []string{
				"LocalWorkspace",
				"Comment",
				"Copilot",
				"OAuth",
			},
			"type":              "selfhosted",
			"initialized":       true,
			"calendarProviders": []string{},
			"oauthProviders": []string{
				"Google",
			},
			"credentialsRequirement": map[string]any{
				"__typename": "CredentialsRequirementType",
				"password": map[string]any{
					"__typename": "PasswordLimitsType",
					"minLength": 8,
					"maxLength": 128,
				},
			},
		}
	}

	if strings.Contains(query, "oauthproviders") || op == "oauthProviders" {
		if _, ok := data["serverConfig"]; !ok {
			data["serverConfig"] = map[string]any{
				"__typename": "ServerConfigType",
				"oauthProviders": []string{
					"Google",
				},
			}
		}
	}

	if strings.Contains(query, "usersettings") {
		data["userSettings"] = map[string]any{
			"receiveInvitationEmail": false,
			"receiveMentionEmail":    false,
			"receiveCommentEmail":    false,
		}
	}

	if strings.Contains(query, "updateuserprofile") || strings.Contains(query, "updateprofile") {
		if u != nil {
			data["updateProfile"] = map[string]any{
				"id": u.ID,
			}
		}
	}

	if strings.Contains(query, "workspace") || op == "getDocCreatedByUpdatedByList" || op == "getDocLastAccessedMembers" || op == "getWorkspace" || op == "getWorkspaceSubscription" || op == "getWorkspacePageMetaById" || op == "getWorkspacePublicById" || op == "getWorkspacePublicPages" {
		wsID := "CBdG2zZTBOsRKKI03pxDm"
		if v, ok := req.Variables["workspaceId"].(string); ok && v != "" {
			wsID = v
		} else if v, ok := req.Variables["id"].(string); ok && v != "" {
			wsID = v
		}
		data["workspace"] = map[string]any{
			"__typename": "WorkspaceType",
			"id":         wsID,
			"public":     false,
			"publicDocs": []any{},
			"docs": map[string]any{
				"__typename": "DocConnection",
				"totalCount": 0,
				"edges":      []any{},
				"pageInfo": map[string]any{
					"__typename":      "PageInfo",
					"hasNextPage":     false,
					"hasPreviousPage": false,
					"startCursor":     nil,
					"endCursor":       nil,
				},
			},
			"doc": map[string]any{
				"__typename": "DocType",
				"summary":    "",
				"lastAccessedMembers": map[string]any{
					"__typename": "LastAccessedMembersConnection",
					"totalCount": 0,
					"edges":      []any{},
					"pageInfo": map[string]any{
						"__typename":      "PageInfo",
						"hasNextPage":     false,
						"hasPreviousPage": false,
						"startCursor":     nil,
						"endCursor":       nil,
					},
				},
			},
			"pageMeta": map[string]any{
				"__typename": "PageMetaType",
				"createdAt":  time.Now().UTC().Format(time.RFC3339),
				"updatedAt":  time.Now().UTC().Format(time.RFC3339),
				"createdBy": map[string]any{
					"name":      "Nexio User",
					"avatarUrl": "",
				},
				"updatedBy": map[string]any{
					"name":      "Nexio User",
					"avatarUrl": "",
				},
			},
			"subscription": map[string]any{
				"__typename": "WorkspaceSubscriptionType",
				"id":         "sub_free",
				"status":     "active",
				"plan":       "Free",
				"recurring":  "monthly",
				"start":      time.Now().UTC().Format(time.RFC3339),
				"end":        time.Now().Add(365 * 24 * time.Hour).UTC().Format(time.RFC3339),
			},
		}
	}

	if strings.Contains(query, "workspaces") || op == "getWorkspaces" {
		ownerID := "user-dev"
		if u != nil {
			ownerID = u.ID
		}
		data["workspaces"] = []any{
			map[string]any{
				"__typename":  "WorkspaceType",
				"id":          "CBdG2zZTBOsRKKI03pxDm",
				"initialized": true,
				"team":        false,
				"owner": map[string]any{
					"id": ownerID,
				},
			},
		}
	}

	if strings.Contains(query, "prices") {
		data["prices"] = []any{}
	}

	if strings.Contains(query, "subscription") && !strings.Contains(query, "workspace") {
		data["subscription"] = nil
	}

	json.NewEncoder(w).Encode(map[string]any{
		"data": data,
	})
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		next.ServeHTTP(lrw, r)
		if !strings.HasPrefix(r.URL.Path, "/assets/") {
			log.Printf("[HTTP] %s %s -> %d", r.Method, r.URL.Path, lrw.statusCode)
		}
	})
}

// Global CORS Middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Access-Control-Allow-Credentials", "true")
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-affine-csrf-token, x-nexio-csrf-token, x-affine-version, x-nexio-version, x-affine-client-kind, x-nexio-client-kind, x-captcha-token, x-captcha-provider, x-captcha-challenge")
		w.Header().Set("Access-Control-Expose-Headers", "Set-Cookie")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) Start() error {
	addr := fmt.Sprintf(":%s", s.cfg.Port)
	log.Printf("[Nexio Go Server] Starting on http://0.0.0.0%s (dual-stack)", addr)
	handler := corsMiddleware(s.mux)
	handler = loggingMiddleware(handler)
	return http.ListenAndServe(addr, handler)
}

const defaultInstallSh = `#!/bin/sh
set -e
echo "Nexio Terminal Installer: https://www.technexio.me"
`

const defaultInstallPs1 = `# Nexio PowerShell Installer
Write-Host "Nexio Terminal Installer: https://www.technexio.me"
`
