#!/bin/bash
# Test installation script for agent-speech release
# Usage: ./scripts/test-installation.sh [version] [install_path]

set -e

VERSION=${1:-"0.1.1"}
PACKAGE_NAME="agent-speech"
INSTALL_PATH=${2:-"/tmp/agent-speech-test"}
RELEASE_DIR="release"
ARCHIVE="$RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz"

echo "🧪 Testing Installation for $PACKAGE_NAME v$VERSION"
echo "=================================================="
echo ""

# Clean up previous test installation
echo "🧹 Cleaning up previous test installation..."
rm -rf "$INSTALL_PATH"
mkdir -p "$INSTALL_PATH"

# Extract archive
echo "📦 Extracting archive..."
tar -xzf "$ARCHIVE" -C "$INSTALL_PATH"

cd "$INSTALL_PATH/$PACKAGE_NAME"

echo "📂 Package structure:"
ls -la

echo ""
echo "🔍 Verifying package contents..."

# Check required files
REQUIRED_FILES=(
    "package.json"
    "dist/index.js"
    "dist/index.d.ts"
    "dist/cli.js"
    "dist/mcp-server.js"
    "config/config.schema.json"
    ".claude-plugin/agent-speech/plugin.json"
    "README.md"
    "INSTALL.md"
)

ALL_GOOD=true
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
        ALL_GOOD=false
    fi
done

echo ""
echo "📝 Checking package.json..."
if command -v node &> /dev/null; then
    node -e "const pkg = require('./package.json'); console.log('  Name:', pkg.name); console.log('  Version:', pkg.version); console.log('  Main:', pkg.main);"
else
    echo "  ⚠️  Node.js not found, skipping package.json validation"
fi

echo ""
echo "📦 Testing CLI (if installed globally)..."
if command -v agent-speech &> /dev/null; then
    echo "  ✅ CLI command available"
    agent-speech --help || echo "  ⚠️  CLI help command failed"
else
    echo "  ⚠️  CLI not installed globally (expected for local test)"
fi

echo ""
echo "🔐 Verifying checksums..."
cd - > /dev/null
if [ -f "$ARCHIVE.sha256" ]; then
    echo "  Checking $ARCHIVE..."
    if shasum -a 256 -c "$ARCHIVE.sha256"; then
        echo "  ✅ Checksum verified"
    else
        echo "  ❌ Checksum verification failed"
        ALL_GOOD=false
    fi
else
    echo "  ⚠️  Checksum file not found"
fi

echo ""
if [ "$ALL_GOOD" = true ]; then
    echo "✅ Installation test PASSED"
    echo ""
    echo "📝 Test installation path: $INSTALL_PATH/$PACKAGE_NAME"
    echo "🧹 Clean up with: rm -rf $INSTALL_PATH"
    exit 0
else
    echo "❌ Installation test FAILED"
    echo "📝 Test installation path: $INSTALL_PATH/$PACKAGE_NAME"
    echo "🧹 Clean up with: rm -rf $INSTALL_PATH"
    exit 1
fi
