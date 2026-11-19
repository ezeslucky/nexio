package daemon

import (
	"encoding/base64"
	"encoding/json"
	"io"
	"net/http"

	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/authsession"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/crdt"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/filetype"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/hashcash"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/imageinspect"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/nbstore"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/reserveddoc"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/safefetch"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/tokenizer"
	"github.com/ezeslucky/nexio/packages/backend/go-native/pkg/urlpolicy"
)

func NewRouter() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":  "ok",
			"engine":  "golang",
			"version": "1.0.0",
		})
	})

	// Hashcash endpoints
	mux.HandleFunc("POST /hashcash/mint", func(w http.ResponseWriter, r *http.Request) {
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

	mux.HandleFunc("POST /hashcash/verify", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Response string `json:"response"`
			Bits     uint32 `json:"bits"`
			Resource string `json:"resource"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		valid := hashcash.VerifyChallengeResponse(req.Response, req.Bits, req.Resource)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"valid": valid})
	})

	// URL Policy endpoints
	mux.HandleFunc("POST /url/callback", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Input          string                   `json:"input"`
			BaseURL        string                   `json:"base_url"`
			AllowedOrigins []string                 `json:"allowed_origins"`
			QueryPairs     []urlpolicy.UrlQueryPair `json:"query_pairs"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res, err := urlpolicy.BuildSafeCallbackUrl(req.Input, req.BaseURL, req.AllowedOrigins, req.QueryPairs)
		if err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"url": res})
	})

	mux.HandleFunc("POST /url/redirect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Input          string                   `json:"input"`
			BaseURL        string                   `json:"base_url"`
			AllowedOrigins []string                 `json:"allowed_origins"`
			TrustedDomains []string                 `json:"trusted_domains"`
			QueryPairs     []urlpolicy.UrlQueryPair `json:"query_pairs"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res, err := urlpolicy.EvaluateRedirectUri(req.Input, req.BaseURL, req.AllowedOrigins, req.TrustedDomains, req.QueryPairs)
		if err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"url": res})
	})

	mux.HandleFunc("POST /url/local-redirect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Input        string   `json:"input"`
			BaseURL      string   `json:"base_url"`
			AllowedBases []string `json:"allowed_bases"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res, err := urlpolicy.EvaluateLocalRedirect(req.Input, req.BaseURL, req.AllowedBases)
		if err != nil {
			http.Error(w, err.Error(), http.StatusForbidden)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"url": res})
	})

	// FileType endpoint
	mux.HandleFunc("POST /filetype/mime", func(w http.ResponseWriter, r *http.Request) {
		data, err := io.ReadAll(io.LimitReader(r.Body, 1024*1024))
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		mime := filetype.GetMime(data)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"mime": mime})
	})

	// SafeFetch endpoint
	mux.HandleFunc("POST /safefetch", func(w http.ResponseWriter, r *http.Request) {
		var req safefetch.SafeFetchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		resp, err := safefetch.SafeFetch(r.Context(), req)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	})

	// CRDT / Yjs validation endpoint
	mux.HandleFunc("POST /crdt/validate-update", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UpdateBase64 string `json:"update_base64"`
		}
		var updateBytes []byte
		var err error

		if r.Header.Get("Content-Type") == "application/json" {
			if err = json.NewDecoder(r.Body).Decode(&req); err == nil && req.UpdateBase64 != "" {
				updateBytes, err = base64.StdEncoding.DecodeString(req.UpdateBase64)
			}
		} else {
			updateBytes, err = io.ReadAll(io.LimitReader(r.Body, 50*1024*1024))
		}

		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		valid := crdt.ValidateDocUpdate(updateBytes)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"valid": valid})
	})

	// Tokenizer endpoints
	mux.HandleFunc("POST /tokenizer/count", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Model          string   `json:"model"`
			Content        string   `json:"content"`
			AllowedSpecial []string `json:"allowed_special"`
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
		count := tok.Count(req.Content, req.AllowedSpecial)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"count": count})
	})

	// Reserved Doc Authorization endpoint
	mux.HandleFunc("POST /reserved-doc/authorize", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UserID      string `json:"user_id"`
			WorkspaceID string `json:"workspace_id"`
			DocID       string `json:"doc_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		allowed := reserveddoc.AuthorizeReservedDocSubject(req.UserID, req.WorkspaceID, req.DocID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"allowed": allowed})
	})

	// Auth Session endpoints
	mux.HandleFunc("POST /auth/sign-access-token", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UserID        string `json:"user_id"`
			AuthSessionID string `json:"auth_session_id"`
			KeyID         string `json:"key_id"`
			SecretBase64  string `json:"secret_base64"`
			IssuedAt      int64  `json:"issued_at"`
			ExpiresAt     int64  `json:"expires_at"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		secret, err := base64.StdEncoding.DecodeString(req.SecretBase64)
		if err != nil {
			http.Error(w, "invalid secret base64", http.StatusBadRequest)
			return
		}
		token, err := authsession.SignAccessToken(req.UserID, req.AuthSessionID, req.KeyID, secret, req.IssuedAt, req.ExpiresAt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"token": token})
	})

	mux.HandleFunc("POST /auth/verify-access-token", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token         string `json:"token"`
			ExpectedKeyID string `json:"expected_key_id"`
			SecretBase64  string `json:"secret_base64"`
			Now           int64  `json:"now"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		secret, err := base64.StdEncoding.DecodeString(req.SecretBase64)
		if err != nil {
			http.Error(w, "invalid secret base64", http.StatusBadRequest)
			return
		}
		res := authsession.VerifyAccessToken(req.Token, req.ExpectedKeyID, secret, req.Now)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(res)
	})

	mux.HandleFunc("POST /auth/token-key-id", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token string `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		keyID, err := authsession.AccessTokenKeyID(req.Token)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"key_id": keyID})
	})

	mux.HandleFunc("POST /auth/create-refresh-token", func(w http.ResponseWriter, r *http.Request) {
		rt, err := authsession.CreateRefreshToken()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(rt)
	})

	mux.HandleFunc("POST /auth/parse-refresh-token", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			Token string `json:"token"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		parsed, err := authsession.ParseRefreshToken(req.Token)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(parsed)
	})

	// Image Inspection endpoint
	mux.HandleFunc("POST /image/inspect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			ImageBase64 string                         `json:"image_base64"`
			Options     imageinspect.ImageInspectionOptions `json:"options"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		data, err := base64.StdEncoding.DecodeString(req.ImageBase64)
		if err != nil {
			http.Error(w, "invalid image base64", http.StatusBadRequest)
			return
		}
		inspection, err := imageinspect.InspectImageForProxy(data, req.Options)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(inspection)
	})

	// NbStore SQLite Document & Blob Pool endpoints
	nbPool := nbstore.NewDocStoragePool()

	mux.HandleFunc("POST /nbstore/connect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
			Path        string `json:"path"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := nbPool.Connect(req.UniversalID, req.Path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("POST /nbstore/disconnect", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_ = nbPool.Disconnect(req.UniversalID)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("POST /nbstore/set-space-id", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
			SpaceID     string `json:"space_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := storage.SetSpaceID(req.SpaceID); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("POST /nbstore/push-update", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID  string `json:"universal_id"`
			DocID        string `json:"doc_id"`
			UpdateBase64 string `json:"update_base64"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		updateData, err := base64.StdEncoding.DecodeString(req.UpdateBase64)
		if err != nil {
			http.Error(w, "invalid update base64", http.StatusBadRequest)
			return
		}
		ts, err := storage.PushUpdate(req.DocID, updateData)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"timestamp": ts})
	})

	mux.HandleFunc("POST /nbstore/get-snapshot", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
			DocID       string `json:"doc_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		snap, err := storage.GetDocSnapshot(req.DocID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if snap == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{"snapshot": nil})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"snapshot": map[string]any{
				"doc_id":     snap.DocID,
				"bin_base64": base64.StdEncoding.EncodeToString(snap.Data),
				"created_at": snap.CreatedAt,
				"updated_at": snap.UpdatedAt,
			},
		})
	})

	mux.HandleFunc("POST /nbstore/set-blob", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
			Key         string `json:"key"`
			Mime        string `json:"mime"`
			DataBase64  string `json:"data_base64"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		data, err := base64.StdEncoding.DecodeString(req.DataBase64)
		if err != nil {
			http.Error(w, "invalid data base64", http.StatusBadRequest)
			return
		}
		if err := storage.SetBlob(req.Key, req.Mime, data); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"ok": true})
	})

	mux.HandleFunc("POST /nbstore/get-blob", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
			Key         string `json:"key"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		b, err := storage.GetBlob(req.Key)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if b == nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]any{"blob": nil})
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"blob": map[string]any{
				"key":         b.Key,
				"mime":        b.Mime,
				"size":        b.Size,
				"data_base64": base64.StdEncoding.EncodeToString(b.Data),
				"created_at":  b.CreatedAt,
			},
		})
	})

	mux.HandleFunc("POST /nbstore/list-blobs", func(w http.ResponseWriter, r *http.Request) {
		var req struct {
			UniversalID string `json:"universal_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		storage, err := nbPool.Get(req.UniversalID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		blobs, err := storage.ListBlobs()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"blobs": blobs})
	})

	return mux
}
