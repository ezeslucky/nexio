package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/toeverything/nexio/packages/backend/go-native/pkg/daemon"
)

func main() {
	port := os.Getenv("NEXIO_NATIVE_PORT")
	if port == "" {
		port = "3015"
	}

	addr := fmt.Sprintf("127.0.0.1:%s", port)
	handler := daemon.NewRouter()

	log.Printf("[Nexio Native Go] Starting native daemon on http://%s\n", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Daemon failed: %v", err)
	}
}

