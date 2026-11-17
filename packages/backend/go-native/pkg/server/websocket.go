package server

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"github.com/toeverything/nexio/packages/backend/go-native/pkg/nbstore"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow cross-origin WebSocket connections
	},
}

type Client struct {
	hub  *Hub
	conn *websocket.Conn
	room string
	send chan []byte
}

type Hub struct {
	mu         sync.RWMutex
	rooms      map[string]map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan struct {
		room    string
		sender  *Client
		message []byte
	}
	pool *nbstore.DocStoragePool
}

func NewHub(pool *nbstore.DocStoragePool) *Hub {
	return &Hub{
		rooms:      make(map[string]map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast: make(chan struct {
			room    string
			sender  *Client
			message []byte
		}),
		pool: pool,
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.rooms[client.room]; !ok {
				h.rooms[client.room] = make(map[*Client]bool)
			}
			h.rooms[client.room][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if clients, ok := h.rooms[client.room]; ok {
				if _, exists := clients[client]; exists {
					delete(clients, client)
					close(client.send)
					if len(clients) == 0 {
						delete(h.rooms, client.room)
					}
				}
			}
			h.mu.Unlock()

		case item := <-h.broadcast:
			h.mu.RLock()
			clients := h.rooms[item.room]
			for client := range clients {
				if client != item.sender {
					select {
					case client.send <- item.message:
					default:
						close(client.send)
						delete(clients, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		messageType, message, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
		if messageType == websocket.BinaryMessage || messageType == websocket.TextMessage {
			c.hub.broadcast <- struct {
				room    string
				sender  *Client
				message []byte
			}{
				room:    c.room,
				sender:  c,
				message: message,
			}
		}
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for message := range c.send {
		w, err := c.conn.NextWriter(websocket.BinaryMessage)
		if err != nil {
			return
		}
		if _, err := w.Write(message); err != nil {
			return
		}
		if err := w.Close(); err != nil {
			return
		}
	}
}

func (h *Hub) HandleWS(w http.ResponseWriter, r *http.Request) {
	workspaceID := r.URL.Query().Get("workspace_id")
	docID := r.URL.Query().Get("doc_id")
	if workspaceID == "" || docID == "" {
		http.Error(w, "missing workspace_id or doc_id", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}

	room := workspaceID + ":" + docID
	client := &Client{
		hub:  h,
		conn: conn,
		room: room,
		send: make(chan []byte, 256),
	}

	h.register <- client

	go client.writePump()
	go client.readPump()
}
