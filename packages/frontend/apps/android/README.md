# Nexio Android Application

Complete Android application for Nexio built with Capacitor, Kotlin, Jetpack Compose, and native UniFFI storage runtime.

## Requirements

- **Node.js**: v20 or v22
- **Java Development Kit**: JDK 21
- **Android SDK & NDK**: Android SDK Platform 36, NDK 27+
- **Rust Toolchain**: `rustup target add aarch64-linux-android`

## Build Android APK

### Automated GitHub Actions Build (Recommended)
1. Go to **Actions** in GitHub: `Build Android APK`
2. Click **Run workflow**, choose flavor (`canary`, `stable`, `beta`), and click **Run workflow**.
3. Download the generated `.apk` file directly from the workflow artifact `Nexio-Android-APK`.
4. Creating a tag `v*` (e.g. `v1.5.0`) automatically attaches the built `.apk` to the GitHub Release.

### Local Build Steps

1. **Install dependencies**:
   ```bash
   corepack enable
   yarn install
   ```

2. **Build frontend assets**:
   ```bash
   node .yarn/releases/yarn-4.9.1.cjs nexio bundle -p android
   ```

3. **Sync Capacitor Android project**:
   ```bash
   cd packages/frontend/apps/android
   npx cap sync android
   ```

4. **Compile APK with Gradle**:
   ```bash
   cd App
   ./gradlew assembleCanaryDebug --stacktrace
   # On Windows:
   # .\gradlew.bat assembleCanaryDebug --stacktrace
   ```

5. Output `.apk` files are generated at:
   `packages/frontend/apps/android/App/app/build/outputs/apk/canary/debug/`
