package imageinspect

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	_ "image/gif"
	_ "image/jpeg"
	_ "image/png"

	_ "golang.org/x/image/webp"
)

type ImageInspectionOptions struct {
	MaxWidth  *uint32 `json:"maxWidth,omitempty"`
	MaxHeight *uint32 `json:"maxHeight,omitempty"`
	MaxPixels *uint32 `json:"maxPixels,omitempty"`
}

type ImageInspection struct {
	MimeType string `json:"mimeType"`
	Width    uint32 `json:"width"`
	Height   uint32 `json:"height"`
}

func InspectImageForProxy(data []byte, options ImageInspectionOptions) (*ImageInspection, error) {
	if len(data) == 0 {
		return nil, errors.New("empty image data")
	}

	cfg, format, err := image.DecodeConfig(bytes.NewReader(data))
	if err != nil {
		return nil, fmt.Errorf("failed to decode image config: %w", err)
	}

	w := uint32(cfg.Width)
	h := uint32(cfg.Height)

	if options.MaxWidth != nil && w > *options.MaxWidth {
		return nil, fmt.Errorf("image width %d exceeds max %d", w, *options.MaxWidth)
	}
	if options.MaxHeight != nil && h > *options.MaxHeight {
		return nil, fmt.Errorf("image height %d exceeds max %d", h, *options.MaxHeight)
	}
	if options.MaxPixels != nil && uint64(w)*uint64(h) > uint64(*options.MaxPixels) {
		return nil, fmt.Errorf("image pixel count %d exceeds max %d", uint64(w)*uint64(h), *options.MaxPixels)
	}

	mimeType := "image/" + format
	if format == "jpeg" {
		mimeType = "image/jpeg"
	}

	return &ImageInspection{
		MimeType: mimeType,
		Width:    w,
		Height:   h,
	}, nil
}

