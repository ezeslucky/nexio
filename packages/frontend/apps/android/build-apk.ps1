Write-Host "==> Building Nexio Android bundle assets..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\..\..\..\"
node .yarn\releases\yarn-4.9.1.cjs nexio bundle -p android

Write-Host "==> Syncing Capacitor Android assets and plugins..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot"
npx cap sync android

Write-Host "==> Compiling Android APK with Gradle..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\App"
.\gradlew.bat assembleCanaryDebug --stacktrace

Write-Host "==> APK Build Complete!" -ForegroundColor Green
Get-ChildItem -Recurse app\build\outputs\apk\*.apk
