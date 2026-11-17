package server

import (
	"os"
)

type Config struct {
	Host        string
	Port        string
	StoragePath string
	JWTSecret   string
}

func LoadConfig() Config {
	host := os.Getenv("NEXIO_HOST")
	if host == "" {
		host = "0.0.0.0"
	}

	port := os.Getenv("NEXIO_SERVER_PORT")
	if port == "" {
		port = "3010"
	}

	storagePath := os.Getenv("NEXIO_STORAGE_PATH")
	if storagePath == "" {
		storagePath = "./data"
	}

	jwtSecret := os.Getenv("NEXIO_JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "nexio-default-development-jwt-secret-key-32b"
	}

	return Config{
		Host:        host,
		Port:        port,
		StoragePath: storagePath,
		JWTSecret:   jwtSecret,
	}
}
