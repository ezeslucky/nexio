#!/usr/bin/env bash
set -euo pipefail

echo "==> Building Nexio Android bundle assets..."
cd "$(dirname "$0")/../../../../"
node .yarn/releases/yarn-4.9.1.cjs nexio bundle -p android

echo "==> Syncing Capacitor Android assets and plugins..."
cd packages/frontend/apps/android
npx cap sync android

echo "==> Compiling Android APK with Gradle..."
cd App
chmod +x ./gradlew
./gradlew assembleCanaryDebug --stacktrace

echo "==> APK Build Complete!"
find app/build/outputs/apk -name "*.apk"
