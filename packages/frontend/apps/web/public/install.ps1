# ==============================================================================
# Nexio Windows PowerShell Terminal Installer
# https://www.technexio.me
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "    _   _           _       " -ForegroundColor Cyan
Write-Host "   | \ | | _____  _(_) ___  " -ForegroundColor Cyan
Write-Host "   |  \| |/ _ \ \/ / |/ _ \ " -ForegroundColor Cyan
Write-Host "   | |\  |  __/>  <| | (_) |" -ForegroundColor Cyan
Write-Host "   |_| \_|\___/_/\_\_|\___/ " -ForegroundColor Cyan
Write-Host "   The Next-Gen Multimodal AI Workspace" -ForegroundColor Cyan
Write-Host ""

$arch = if ([System.Environment]::Is64BitOperatingSystem) {
    if ($env:PROCESSOR_ARCHITECTURE -eq "ARM64") { "arm64" } else { "x64" }
} else {
    "x64"
}

Write-Host "==> Detected system: Windows ($arch)" -ForegroundColor Green

$installDir = Join-Path $env:LOCALAPPDATA "Nexio\bin"
if (!(Test-Path -Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

$targetExe = Join-Path $installDir "nexio.exe"
$fileName = "Nexio-Setup-0.27.5-$arch.exe"
$downloadUrl = "https://www.technexio.me/api/download?platform=windows&arch=$arch&format=exe"
$fallbackUrl = "https://github.com/ezeslucky/nexio/releases/latest/download/$fileName"

Write-Host "==> Downloading Nexio from $downloadUrl..." -ForegroundColor Blue

$tempPath = [System.IO.Path]::GetTempFileName() + ".exe"

try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempPath -UseBasicParsing
} catch {
    Write-Host "==> Retrying with GitHub fallback..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $fallbackUrl -OutFile $tempPath -UseBasicParsing
}

Move-Item -Path $tempPath -Destination $targetExe -Force

# Add to user PATH if not present
$userPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    $newPath = "$userPath;$installDir"
    [System.Environment]::SetEnvironmentVariable("Path", $newPath, "User")
    $env:Path = "$env:Path;$installDir"
    Write-Host "==> Added $installDir to User PATH" -ForegroundColor Green
}

# Create Desktop Shortcut
try {
    $wshShell = New-Object -ComObject WScript.Shell
    $desktopPath = [System.Environment]::GetFolderPath("Desktop")
    $shortcut = $wshShell.CreateShortcut((Join-Path $desktopPath "Nexio.lnk"))
    $shortcut.TargetPath = $targetExe
    $shortcut.Description = "Nexio Workspace"
    $shortcut.Save()
    Write-Host "==> Created Desktop shortcut" -ForegroundColor Green
} catch {}

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " Nexio installed successfully!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Installation path: $targetExe" -ForegroundColor Cyan
Write-Host "To launch, simply type: nexio" -ForegroundColor Yellow
Write-Host "Or open from your Desktop shortcut." -ForegroundColor Yellow
Write-Host ""
