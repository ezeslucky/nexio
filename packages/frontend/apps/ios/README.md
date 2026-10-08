# iOS

AFFiNE iOS app.

## Build

- `yarn install`
- `BUILD_TYPE=canary PUBLIC_PATH="/" yarn affine @nexio/ios build`
- `yarn affine @nexio/ios cap sync`
- `yarn affine @nexio/ios cap open ios`

## Live Reload

> Capacitor doc: https://capacitorjs.com/docs/guides/live-reload#using-with-framework-clis

- `yarn install`
- `yarn dev`
  - select `ios` for the "Distribution" option
- `yarn affine @nexio/ios sync:dev`
- `yarn affine @nexio/ios cap open ios`
