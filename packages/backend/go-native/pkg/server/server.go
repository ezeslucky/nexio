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
	"time"

	"github.com/toeverything/nexio/packages/backend/go-native/pkg/authsession"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/crdt"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/filetype"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/hashcash"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/nbstore"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/tokenizer"
)

type Server struct {
	cfg  Config
	pool *nbstore.DocStoragePool
	hub  *Hub
	mux  *http.ServeMux
}

func NewServer(cfg Config) *Server {
	pool := nbstore.NewDocStoragePool()
	hub := NewHub(pool)
	go hub.Run()

	s := &Server{
		cfg:  cfg,
		pool: pool,
		hub:  hub,
		mux:  http.NewServeMux(),
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

	// Auth Endpoints
	s.mux.HandleFunc("POST /api/v1/auth/sign-in", s.handleSignIn)
	s.mux.HandleFunc("POST /api/v1/auth/verify", s.handleVerifyToken)

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
}

func (s *Server) getStorage(workspaceID string) (*nbstore.SqliteDocStorage, error) {
	storage, err := s.pool.Get(workspaceID)
	if err == nil {
		return storage, nil
	}
	dbPath := filepath.Join(s.cfg.StoragePath, fmt.Sprintf("%s.db", workspaceID))
	return s.pool.Connect(workspaceID, dbPath)
}

// Handler: Auth Sign-In
func (s *Server) handleSignIn(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID   string `json:"user_id"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	if req.UserID == "" {
		req.UserID = "user_" + fmt.Sprintf("%d", time.Now().UnixNano())
	}

	sessionID := fmt.Sprintf("sess_%d", time.Now().UnixNano())
	now := time.Now().Unix()
	exp := now + 86400*7 // 7 days

	token, err := authsession.SignAccessToken(req.UserID, sessionID, "key-1", []byte(s.cfg.JWTSecret), now, exp)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	refreshToken, _ := authsession.CreateRefreshToken()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"token":         token,
		"refresh_token": refreshToken,
		"user_id":       req.UserID,
		"session_id":    sessionID,
		"expires_at":    exp,
	})
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

	if op == "readNotification" || strings.Contains(query, "readnotification") {
		data["readNotification"] = true
	} else if op == "readAllNotifications" || strings.Contains(query, "readallnotifications") {
		data["readAllNotifications"] = true
	} else if op == "listNotifications" || strings.Contains(query, "listnotifications") || strings.Contains(query, "notifications") {
		data["currentUser"] = map[string]any{
			"__typename": "UserType",
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
		}
	} else if strings.Contains(query, "currentuser") {
		data["currentUser"] = map[string]any{
			"__typename":    "UserType",
			"id":            "user-dev",
			"name":          "Nexio User",
			"email":         "user@technexio.me",
			"avatarUrl":     "",
			"hasPassword":   true,
			"emailVerified": true,
		}
	} else if strings.Contains(query, "serverconfig") || op == "serverConfig" {
		data["serverConfig"] = map[string]any{
			"version":     "0.27.5",
			"flavor":      "canary",
			"initialized": true,
		}
	}

	json.NewEncoder(w).Encode(map[string]any{
		"data": data,
	})
}

// Global CORS Middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Server) Start() error {
	addr := fmt.Sprintf("%s:%s", s.cfg.Host, s.cfg.Port)
	log.Printf("[Nexio Go Server] Starting on http://%s", addr)
	return http.ListenAndServe(addr, corsMiddleware(s.mux))
}
