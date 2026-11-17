package filetype

import (
	"bytes"
	"net/http"
	"strings"
)

// GetMime returns the MIME type of the given byte slice matching Affine/Nexio's get_mime.
func GetMime(data []byte) string {
	if len(data) == 0 {
		return "application/octet-stream"
	}

	limit := len(data)
	if limit > 4096 {
		limit = 4096
	}
	header := data[:limit]

	// 1. Direct magic bytes detection
	if bytes.HasPrefix(header, []byte("\x89PNG\r\n\x1a\n")) {
		return "image/png"
	}
	if bytes.HasPrefix(header, []byte("\xff\xd8\xff")) {
		return "image/jpeg"
	}
	if bytes.HasPrefix(header, []byte("GIF87a")) || bytes.HasPrefix(header, []byte("GIF89a")) {
		return "image/gif"
	}
	if len(header) >= 12 && string(header[0:4]) == "RIFF" && string(header[8:12]) == "WEBP" {
		return "image/webp"
	}
	if bytes.HasPrefix(header, []byte("%PDF-")) {
		return "application/pdf"
	}
	if bytes.HasPrefix(header, []byte("PK\x03\x04")) {
		return "application/zip"
	}

	// 2. WebM detection
	if bytes.Contains(header, []byte("webm")) || bytes.Contains(header, []byte("WEBM")) {
		return "video/webm"
	}
	if bytes.Contains(header, []byte("matroska")) || bytes.Contains(header, []byte("MATROSKA")) {
		return "video/x-matroska"
	}

	// 3. MP4 / M4A detection
	if len(header) >= 12 && string(header[4:8]) == "ftyp" {
		subtype := string(header[8:12])
		if strings.HasPrefix(subtype, "M4A") || strings.HasPrefix(subtype, "m4a") {
			return "audio/m4a"
		}
		return "video/mp4"
	}

	// 4. SVG detection
	trimmed := bytes.TrimSpace(header)
	if bytes.HasPrefix(trimmed, []byte("<?xml")) || bytes.HasPrefix(trimmed, []byte("<svg")) {
		if bytes.Contains(trimmed, []byte("<svg")) {
			return "image/svg+xml"
		}
	}

	// 5. Standard library fallback
	detected := http.DetectContentType(header)
	if idx := strings.Index(detected, ";"); idx != -1 {
		detected = detected[:idx]
	}
	return detected
}

