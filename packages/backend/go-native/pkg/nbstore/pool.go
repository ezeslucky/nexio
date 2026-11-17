package nbstore

import (
	"errors"
	"sync"
)

type DocStoragePool struct {
	mu      sync.RWMutex
	storages map[string]*SqliteDocStorage
}

func NewDocStoragePool() *DocStoragePool {
	return &DocStoragePool{
		storages: make(map[string]*SqliteDocStorage),
	}
}

func (p *DocStoragePool) Connect(universalID, path string) (*SqliteDocStorage, error) {
	p.mu.Lock()
	defer p.mu.Unlock()

	if storage, exists := p.storages[universalID]; exists {
		return storage, nil
	}

	storage, err := OpenDocStorage(path)
	if err != nil {
		return nil, err
	}

	p.storages[universalID] = storage
	return storage, nil
}

func (p *DocStoragePool) Get(universalID string) (*SqliteDocStorage, error) {
	p.mu.RLock()
	defer p.mu.RUnlock()

	storage, exists := p.storages[universalID]
	if !exists {
		return nil, errors.New("storage not connected: " + universalID)
	}
	return storage, nil
}

func (p *DocStoragePool) Disconnect(universalID string) error {
	p.mu.Lock()
	defer p.mu.Unlock()

	storage, exists := p.storages[universalID]
	if !exists {
		return nil
	}

	delete(p.storages, universalID)
	return storage.Close()
}

