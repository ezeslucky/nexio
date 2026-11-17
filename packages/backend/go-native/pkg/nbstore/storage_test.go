package nbstore

import (
	"bytes"
	"testing"
	"time"
)

func TestSqliteDocStorage(t *testing.T) {
	storage, err := OpenDocStorage(":memory:")
	if err != nil {
		t.Fatalf("OpenDocStorage failed: %v", err)
	}
	defer storage.Close()

	// 1. Set Space ID
	if err := storage.SetSpaceID("test-space"); err != nil {
		t.Fatalf("SetSpaceID failed: %v", err)
	}

	// 2. Push Update
	updateData := []byte{1, 2, 3, 4, 5}
	ts, err := storage.PushUpdate("doc-1", updateData)
	if err != nil || ts.IsZero() {
		t.Fatalf("PushUpdate failed: %v", err)
	}

	// 3. Get Updates
	updates, err := storage.GetDocUpdates("doc-1")
	if err != nil {
		t.Fatalf("GetDocUpdates failed: %v", err)
	}
	if len(updates) != 1 || !bytes.Equal(updates[0].Data, updateData) {
		t.Fatalf("Unexpected updates: %+v", updates)
	}

	// 4. Set & Get Snapshot
	snapshotData := []byte{10, 20, 30}
	err = storage.SetDocSnapshot(DocRecord{
		DocID:     "doc-1",
		Data:      snapshotData,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
	})
	if err != nil {
		t.Fatalf("SetDocSnapshot failed: %v", err)
	}

	snap, err := storage.GetDocSnapshot("doc-1")
	if err != nil {
		t.Fatalf("GetDocSnapshot failed: %v", err)
	}
	if snap == nil || !bytes.Equal(snap.Data, snapshotData) {
		t.Fatalf("Snapshot mismatch: %+v", snap)
	}

	// 5. Blob CRUD
	blobBytes := []byte("image data")
	if err := storage.SetBlob("blob-1", "image/png", blobBytes); err != nil {
		t.Fatalf("SetBlob failed: %v", err)
	}

	blob, err := storage.GetBlob("blob-1")
	if err != nil {
		t.Fatalf("GetBlob failed: %v", err)
	}
	if blob == nil || !bytes.Equal(blob.Data, blobBytes) || blob.Mime != "image/png" {
		t.Fatalf("Blob mismatch: %+v", blob)
	}

	blobs, err := storage.ListBlobs()
	if err != nil || len(blobs) != 1 || blobs[0].Key != "blob-1" {
		t.Fatalf("ListBlobs failed: %+v", blobs)
	}

	// 6. Delete Blob
	if err := storage.DeleteBlob("blob-1"); err != nil {
		t.Fatalf("DeleteBlob failed: %v", err)
	}
	blob, err = storage.GetBlob("blob-1")
	if err != nil || blob != nil {
		t.Fatalf("Expected blob-1 to be deleted, got %+v", blob)
	}

	// 7. Delete Doc
	if err := storage.DeleteDoc("doc-1"); err != nil {
		t.Fatalf("DeleteDoc failed: %v", err)
	}
	snap, err = storage.GetDocSnapshot("doc-1")
	if err != nil || snap != nil {
		t.Fatalf("Expected doc-1 snapshot to be deleted")
	}
}

func TestDocStoragePool(t *testing.T) {
	pool := NewDocStoragePool()
	s1, err := pool.Connect("ws-1", ":memory:")
	if err != nil {
		t.Fatalf("Connect failed: %v", err)
	}
	if s1 == nil {
		t.Fatalf("Expected storage pointer")
	}

	s2, err := pool.Get("ws-1")
	if err != nil || s2 != s1 {
		t.Fatalf("Expected same storage instance from pool")
	}

	if err := pool.Disconnect("ws-1"); err != nil {
		t.Fatalf("Disconnect failed: %v", err)
	}

	if _, err := pool.Get("ws-1"); err == nil {
		t.Fatalf("Expected error getting disconnected storage")
	}
}

