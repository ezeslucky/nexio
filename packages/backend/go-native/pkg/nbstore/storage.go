package nbstore

import (
	"database/sql"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	_ "modernc.org/sqlite"
)

type DocUpdate struct {
	DocID     string    `json:"doc_id"`
	CreatedAt time.Time `json:"created_at"`
	Data      []byte    `json:"bin"`
}

type DocRecord struct {
	DocID     string    `json:"doc_id"`
	Data      []byte    `json:"bin"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type DocClock struct {
	DocID     string    `json:"doc_id"`
	Timestamp time.Time `json:"timestamp"`
}

type BlobRecord struct {
	Key       string     `json:"key"`
	Data      []byte     `json:"data"`
	Mime      string     `json:"mime"`
	Size      int64      `json:"size"`
	CreatedAt time.Time  `json:"created_at"`
	DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type ListedBlob struct {
	Key       string    `json:"key"`
	Size      int64     `json:"size"`
	Mime      string    `json:"mime"`
	CreatedAt time.Time `json:"created_at"`
}

type SqliteDocStorage struct {
	db   *sql.DB
	path string
	mu   sync.RWMutex
}

func OpenDocStorage(path string) (*SqliteDocStorage, error) {
	if path != ":memory:" {
		dir := filepath.Dir(path)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, err
		}
	}

	dsn := path
	if path != ":memory:" {
		dsn = fmt.Sprintf("file:%s?_pragma=journal_mode(WAL)&_pragma=foreign_keys(0)", path)
	}

	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}

	storage := &SqliteDocStorage{
		db:   db,
		path: path,
	}

	if err := storage.migrate(); err != nil {
		db.Close()
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return storage, nil
}

func (s *SqliteDocStorage) Close() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

func (s *SqliteDocStorage) migrate() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS "meta" (
			space_id VARCHAR PRIMARY KEY NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS "snapshots" (
			doc_id VARCHAR PRIMARY KEY NOT NULL,
			data BLOB NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS "updates" (
			doc_id VARCHAR NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			data BLOB NOT NULL,
			PRIMARY KEY (doc_id, created_at)
		);`,
		`CREATE TABLE IF NOT EXISTS "clocks" (
			doc_id VARCHAR PRIMARY KEY NOT NULL,
			timestamp TIMESTAMP NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS "blobs" (
			key VARCHAR PRIMARY KEY NOT NULL,
			data BLOB NOT NULL,
			mime VARCHAR NOT NULL,
			size INTEGER NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
			deleted_at TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS "peer_clocks" (
			peer VARCHAR NOT NULL,
			doc_id VARCHAR NOT NULL,
			remote_clock TIMESTAMP NOT NULL DEFAULT 0,
			pulled_remote_clock TIMESTAMP NOT NULL DEFAULT 0,
			pushed_clock TIMESTAMP NOT NULL DEFAULT 0,
			PRIMARY KEY (peer, doc_id)
		);`,
		`CREATE INDEX IF NOT EXISTS peer_clocks_doc_id ON peer_clocks (doc_id);`,
		`CREATE TABLE IF NOT EXISTS "peer_blob_sync" (
			peer VARCHAR NOT NULL,
			blob_id VARCHAR NOT NULL,
			uploaded_at TIMESTAMP,
			PRIMARY KEY (peer, blob_id)
		);`,
		`CREATE INDEX IF NOT EXISTS peer_blob_sync_peer ON peer_blob_sync (peer);`,
		`CREATE TABLE IF NOT EXISTS idx_snapshots (
			index_name TEXT PRIMARY KEY NOT NULL,
			data BLOB NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS "indexer_sync" (
			doc_id VARCHAR PRIMARY KEY NOT NULL,
			indexed_clock TIMESTAMP NOT NULL DEFAULT 0,
			indexer_version INTEGER NOT NULL DEFAULT 0
		);`,
	}

	for _, q := range queries {
		if _, err := s.db.Exec(q); err != nil {
			return err
		}
	}
	return nil
}

func (s *SqliteDocStorage) SetSpaceID(spaceID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, err := s.db.Exec(`INSERT INTO meta (space_id) VALUES (?) ON CONFLICT(space_id) DO UPDATE SET space_id=excluded.space_id`, spaceID)
	return err
}

func (s *SqliteDocStorage) PushUpdate(docID string, update []byte) (time.Time, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	_, err := s.db.Exec(`INSERT INTO updates (doc_id, created_at, data) VALUES (?, ?, ?)`, docID, now, update)
	if err != nil {
		return time.Time{}, err
	}
	_, err = s.db.Exec(`INSERT INTO clocks (doc_id, timestamp) VALUES (?, ?) ON CONFLICT(doc_id) DO UPDATE SET timestamp=excluded.timestamp`, docID, now)
	return now, err
}

func (s *SqliteDocStorage) GetDocSnapshot(docID string) (*DocRecord, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	row := s.db.QueryRow(`SELECT doc_id, data, created_at, updated_at FROM snapshots WHERE doc_id = ?`, docID)
	var rec DocRecord
	if err := row.Scan(&rec.DocID, &rec.Data, &rec.CreatedAt, &rec.UpdatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &rec, nil
}

func (s *SqliteDocStorage) SetDocSnapshot(snapshot DocRecord) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	if snapshot.UpdatedAt.IsZero() {
		snapshot.UpdatedAt = now
	}
	if snapshot.CreatedAt.IsZero() {
		snapshot.CreatedAt = now
	}
	_, err := s.db.Exec(`INSERT INTO snapshots (doc_id, data, created_at, updated_at) VALUES (?, ?, ?, ?)
		ON CONFLICT(doc_id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at`,
		snapshot.DocID, snapshot.Data, snapshot.CreatedAt, snapshot.UpdatedAt)
	return err
}

func (s *SqliteDocStorage) GetDocUpdates(docID string) ([]DocUpdate, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	rows, err := s.db.Query(`SELECT doc_id, created_at, data FROM updates WHERE doc_id = ? ORDER BY created_at ASC`, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var updates []DocUpdate
	for rows.Next() {
		var u DocUpdate
		if err := rows.Scan(&u.DocID, &u.CreatedAt, &u.Data); err != nil {
			return nil, err
		}
		updates = append(updates, u)
	}
	return updates, nil
}

func (s *SqliteDocStorage) DeleteDoc(docID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	_, _ = s.db.Exec(`DELETE FROM updates WHERE doc_id = ?`, docID)
	_, _ = s.db.Exec(`DELETE FROM snapshots WHERE doc_id = ?`, docID)
	_, err := s.db.Exec(`DELETE FROM clocks WHERE doc_id = ?`, docID)
	return err
}

func (s *SqliteDocStorage) SetBlob(key, mime string, data []byte) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	size := int64(len(data))
	_, err := s.db.Exec(`INSERT INTO blobs (key, data, mime, size, created_at) VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(key) DO UPDATE SET data=excluded.data, mime=excluded.mime, size=excluded.size, deleted_at=NULL`,
		key, data, mime, size, now)
	return err
}

func (s *SqliteDocStorage) GetBlob(key string) (*BlobRecord, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	row := s.db.QueryRow(`SELECT key, data, mime, size, created_at FROM blobs WHERE key = ? AND deleted_at IS NULL`, key)
	var b BlobRecord
	if err := row.Scan(&b.Key, &b.Data, &b.Mime, &b.Size, &b.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &b, nil
}

func (s *SqliteDocStorage) DeleteBlob(key string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now().UTC()
	_, err := s.db.Exec(`UPDATE blobs SET deleted_at = ? WHERE key = ?`, now, key)
	return err
}

func (s *SqliteDocStorage) ListBlobs() ([]ListedBlob, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	rows, err := s.db.Query(`SELECT key, size, mime, created_at FROM blobs WHERE deleted_at IS NULL ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var blobs []ListedBlob
	for rows.Next() {
		var b ListedBlob
		if err := rows.Scan(&b.Key, &b.Size, &b.Mime, &b.CreatedAt); err != nil {
			return nil, err
		}
		blobs = append(blobs, b)
	}
	return blobs, nil
}

