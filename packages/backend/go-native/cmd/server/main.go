package main

import (
	"log"

	"github.com/toeverything/nexio/packages/backend/go-native/pkg/server"
)

func main() {
	cfg := server.LoadConfig()
	srv := server.NewServer(cfg)

	if err := srv.Start(); err != nil {
		log.Fatalf("[Nexio Go Server] Failed to start: %v", err)
	}
}
