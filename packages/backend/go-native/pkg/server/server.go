package server

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
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
	// Root & Health
	s.mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"service": "Nexio Backend Go Server",
			"version": "1.0.0",
			"status":  "running",
		})
	})

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

	// Auth Endpoints (Web & Native)
	for _, prefix := range []string{"/api/auth", "/api/v1/auth"} {
		s.mux.HandleFunc("POST "+prefix+"/preflight", s.handlePreflight)
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

	// Workspace Endpoints
	s.mux.HandleFunc("POST /api/v1/workspaces/init", s.handleWorkspaceInit)

	// Document Endpoints
	s.mux.HandleFunc("GET /api/v1/workspaces/{workspace_id}/docs/{doc_id}", s.handleGetDoc)
	s.mux.HandleFunc("POST /api/v1/workspaces/{workspace_id}/docs/{doc_id}/update", s.handlePushDocUpdate)
	s.mux.HandleFunc("DELETE /api/v1/workspaces/{workspace_id}/docs/{doc_id}", s.handleDeleteDoc)

	// Blob Endpoints
	s.mux.HandleFunc("PUT /api/v1/workspaces/{workspace_id}/blobs/{key}", s.handlePutBlob)
	s.mux.HandleFunc("GET /api/v1/workspaces/{workspace_id}/blobs/{key}", s.handleGetBlob)

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
		// If cookie is present and not explicitly logged out, restore default user session
		if !s.authState.loggedOut {
			u := s.authState.defaultUser
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

	return nil
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
				"providers": []string{"Google", "GitHub"},
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
			"bound":     false,
			"providers": []string{"Google", "GitHub"},
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
	http.SetCookie(w, &http.Cookie{
		Name:     "affine_user_id",
		Value:    user.ID,
		Path:     "/",
		MaxAge:   86400 * 7,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "affine_csrf_token",
		Value:    "csrf_token_dev",
		Path:     "/",
		MaxAge:   86400 * 7,
		SameSite: http.SameSiteLaxMode,
	})

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

	for _, cookieName := range []string{"affine_session", "nexio_session", "affine_user_id", "affine_csrf_token"} {
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
	http.SetCookie(w, &http.Cookie{
		Name:     "affine_user_id",
		Value:    user.ID,
		Path:     "/",
		MaxAge:   86400 * 7,
		SameSite: http.SameSiteLaxMode,
	})
	http.SetCookie(w, &http.Cookie{
		Name:     "affine_csrf_token",
		Value:    "csrf_token_dev",
		Path:     "/",
		MaxAge:   86400 * 7,
		SameSite: http.SameSiteLaxMode,
	})

	http.Redirect(w, r, redirectURI, http.StatusFound)
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
				"GitHub",
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
					"GitHub",
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

	json.NewEncoder(w).Encode(map[string]any{
		"data": data,
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
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, x-affine-csrf-token, x-nexio-csrf-token, x-affine-version, x-affine-client-kind, x-captcha-token, x-captcha-provider, x-captcha-challenge")
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
	return http.ListenAndServe(addr, corsMiddleware(s.mux))
}
