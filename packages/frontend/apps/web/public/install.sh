#!/bin/sh
set -e

# ==============================================================================
# Nexio Universal Terminal Installer (macOS, Linux, Windows WSL/Git Bash)
# https://www.technexio.me
# ==============================================================================

BOLD="\033[1m"
GREEN="\033[32m"
BLUE="\033[34m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"
RESET="\033[0m"

echo "${CYAN}"
echo "    _   _           _       "
echo "   | \ | | _____  _(_) ___  "
echo "   |  \| |/ _ \ \/ / |/ _ \ "
echo "   | |\  |  __/>  <| | (_) |"
echo "   |_| \_|\___/_/\_\_|\___/ "
echo "   The Next-Gen Multimodal AI Workspace"
echo "${RESET}"

# 1. Detect OS
OS_RAW="$(uname -s)"
case "$OS_RAW" in
  Darwin*)  OS="mac" ;;
  Linux*)   OS="linux" ;;
  MINGW*|MSYS*|CYGWIN*) OS="windows" ;;
  *)        OS="linux" ;;
esac

# 2. Detect Architecture
ARCH_RAW="$(uname -m)"
case "$ARCH_RAW" in
  x86_64|amd64)   ARCH="x64" ;;
  arm64|aarch64)  ARCH="arm64" ;;
  *)              ARCH="x64" ;;
esac

echo "${BOLD}==>${RESET} Detected system: ${GREEN}${OS}${RESET} (${ARCH})"

# 3. Determine target filename and format
INSTALL_DIR="$HOME/.nexio/bin"
mkdir -p "$INSTALL_DIR"

if [ "$OS" = "windows" ]; then
  FILE_NAME="Nexio-Setup-0.27.5-${ARCH}.exe"
  TARGET_PATH="$INSTALL_DIR/nexio.exe"
  DOWNLOAD_URL="https://www.technexio.me/api/download?platform=windows&arch=${ARCH}&format=exe"
elif [ "$OS" = "mac" ]; then
  FILE_NAME="Nexio-0.27.5-${ARCH}.dmg"
  TARGET_PATH="$INSTALL_DIR/nexio"
  DOWNLOAD_URL="https://www.technexio.me/api/download?platform=mac&arch=${ARCH}&format=dmg"
else
  FILE_NAME="Nexio-0.27.5.AppImage"
  TARGET_PATH="$INSTALL_DIR/nexio"
  DOWNLOAD_URL="https://www.technexio.me/api/download?platform=linux&format=appimage"
fi

TMP_FILE="/tmp/${FILE_NAME}"

echo "${BOLD}==>${RESET} Downloading Nexio from ${BLUE}${DOWNLOAD_URL}${RESET}..."

# 4. Download file
if command -v curl >/dev/null 2>&1; then
  curl -fsSL --progress-bar "$DOWNLOAD_URL" -o "$TMP_FILE" || \
  curl -fsSL --progress-bar "https://github.com/ezeslucky/nexio/releases/latest/download/${FILE_NAME}" -o "$TMP_FILE"
elif command -v wget >/dev/null 2>&1; then
  wget -q --show-progress "$DOWNLOAD_URL" -O "$TMP_FILE" || \
  wget -q --show-progress "https://github.com/ezeslucky/nexio/releases/latest/download/${FILE_NAME}" -O "$TMP_FILE"
else
  echo "${RED}Error: Neither curl nor wget was found. Please install curl or wget.${RESET}"
  exit 1
fi

chmod +x "$TMP_FILE"
mv "$TMP_FILE" "$TARGET_PATH"

# 5. Set up PATH
SHELL_CONFIG=""
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
  SHELL_CONFIG="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
  SHELL_CONFIG="$HOME/.bashrc"
elif [ -f "$HOME/.profile" ]; then
  SHELL_CONFIG="$HOME/.profile"
fi

PATH_LINE="export PATH=\"\$HOME/.nexio/bin:\$PATH\""
if [ -n "$SHELL_CONFIG" ]; then
  if ! grep -qs "nexio/bin" "$SHELL_CONFIG"; then
    echo "" >> "$SHELL_CONFIG"
    echo "# Nexio CLI" >> "$SHELL_CONFIG"
    echo "$PATH_LINE" >> "$SHELL_CONFIG"
    echo "${BOLD}==>${RESET} Added Nexio to PATH in ${CYAN}${SHELL_CONFIG}${RESET}"
  fi
fi

# Optional: Link to /usr/local/bin if root/writable
if [ -w "/usr/local/bin" ]; then
  ln -sf "$TARGET_PATH" "/usr/local/bin/nexio" 2>/dev/null || true
fi

echo ""
echo "${GREEN}====================================================${RESET}"
echo "${GREEN}${BOLD}✓ Nexio installed successfully!${RESET}"
echo "${GREEN}====================================================${RESET}"
echo ""
echo "Installation path: ${CYAN}${TARGET_PATH}${RESET}"
echo ""
echo "To get started:"
if [ -n "$SHELL_CONFIG" ]; then
  echo "  1. Run:  ${YELLOW}source ${SHELL_CONFIG}${RESET}"
fi
echo "  2. Run:  ${YELLOW}nexio${RESET}"
echo ""
echo "Or open your browser at: ${BLUE}https://app.technexio.me${RESET}"
echo ""
