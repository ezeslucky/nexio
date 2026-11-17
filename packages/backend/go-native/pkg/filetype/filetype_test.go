package filetype

import (
	"testing"
)

func TestGetMime(t *testing.T) {
	pngHeader := []byte("\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")
	if mime := GetMime(pngHeader); mime != "image/png" {
		t.Fatalf("expected image/png, got %s", mime)
	}

	jpegHeader := []byte("\xff\xd8\xff\xe0\x00\x10JFIF")
	if mime := GetMime(jpegHeader); mime != "image/jpeg" {
		t.Fatalf("expected image/jpeg, got %s", mime)
	}

	pdfHeader := []byte("%PDF-1.4\n%...")
	if mime := GetMime(pdfHeader); mime != "application/pdf" {
		t.Fatalf("expected application/pdf, got %s", mime)
	}

	webmHeader := []byte("\x1a\x45\xdf\xa3\x9f\x42\x86\x81\x01\x42\xf7\x81\x01\x42\xf2\x81\x04\x42\xf3\x81\x08\x42\x82\x84webm")
	if mime := GetMime(webmHeader); mime != "video/webm" {
		t.Fatalf("expected video/webm, got %s", mime)
	}
}

