#!/bin/bash
# Create GitHub Release for agent-speech
# Usage: ./scripts/create-github-release.sh [version]

set -e

VERSION=${1:-"0.1.1"}
PACKAGE_NAME="agent-speech"
RELEASE_DIR="release"

echo "🚀 Preparing GitHub Release for v$VERSION"
echo "========================================"

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI found and authenticated"
echo ""

# Read release notes
if [ -f "$RELEASE_DIR/RELEASE-NOTES-$VERSION.md" ]; then
    RELEASE_BODY=$(cat "$RELEASE_DIR/RELEASE-NOTES-$VERSION.md")
else
    echo "⚠️  Release notes not found. Using default template."
    RELEASE_BODY="## Release v$VERSION

See [RELEASE-NOTES-$VERSION.md](./RELEASE-NOTES-$VERSION.md) for detailed installation instructions.

### Installation

\`\`\`bash
# Using Claude Code Marketplace
claude plugin install https://github.com/welico/agent-speech-claude-code/releases/download/v$VERSION/$PACKAGE_NAME-$VERSION.tar.gz

# Or manual download
wget https://github.com/welico/agent-speech-claude-code/releases/download/v$VERSION/$PACKAGE_NAME-$VERSION.tar.gz
\`\`\`"
fi

# Create draft release
echo "📝 Creating GitHub release (draft)..."
gh release create "v$VERSION" \
  --title "🎤 $PACKAGE_NAME v$VERSION" \
  --notes "$RELEASE_BODY" \
  --draft \
  "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz#tarball" \
  "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.zip#zip archive" \
  "$RELEASE_DIR/RELEASE-NOTES-$VERSION.md#Release notes" \
  "$RELEASE_DIR/INSTALL-MANIFEST-$VERSION.json#Installation manifest" \
  "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz.sha256#SHA256 checksums" \
  "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.zip.sha256#SHA256 checksums"

echo ""
echo "✅ GitHub release created as draft!"
echo ""
echo "📝 Next steps:"
echo "1. Visit the release page to review: https://github.com/welico/agent-speech-claude-code/releases"
echo "2. Test the downloaded assets"
echo "3. Publish the release when ready"
echo ""
echo "🔗 Release URL will be shown above (gh will output it)"
