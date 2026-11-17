package imageinspect

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"testing"
)

func createTestPNG(w, h int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for x := 0; x < w; x++ {
		for y := 0; y < h; y++ {
			img.Set(x, y, color.RGBA{R: 255, G: 0, B: 0, A: 255})
		}
	}
	var buf bytes.Buffer
	_ = png.Encode(&buf, img)
	return buf.Bytes()
}

func TestInspectImageForProxy(t *testing.T) {
	pngData := createTestPNG(120, 80)

	// Valid inspection
	info, err := InspectImageForProxy(pngData, ImageInspectionOptions{})
	if err != nil {
		t.Fatalf("Unexpected error: %v", err)
	}
	if info.Width != 120 || info.Height != 80 || info.MimeType != "image/png" {
		t.Fatalf("Unexpected result: %+v", info)
	}

	// Max width constraint pass
	maxW := uint32(150)
	info, err = InspectImageForProxy(pngData, ImageInspectionOptions{MaxWidth: &maxW})
	if err != nil {
		t.Fatalf("Unexpected error with MaxWidth: %v", err)
	}

	// Max width constraint fail
	smallW := uint32(100)
	_, err = InspectImageForProxy(pngData, ImageInspectionOptions{MaxWidth: &smallW})
	if err == nil {
		t.Fatalf("Expected error when width exceeds MaxWidth")
	}

	// Max pixels constraint fail
	maxPixels := uint32(5000)
	_, err = InspectImageForProxy(pngData, ImageInspectionOptions{MaxPixels: &maxPixels})
	if err == nil {
		t.Fatalf("Expected error when pixels exceed MaxPixels")
	}
}

