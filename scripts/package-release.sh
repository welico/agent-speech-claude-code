#!/bin/bash
# Release packaging script for agent-speech
# Usage: ./scripts/package-release.sh [version]

set -e

VERSION=${1:-"0.1.1"}
PACKAGE_NAME="agent-speech"
RELEASE_DIR="release"
TEMP_DIR="$RELEASE_DIR/.temp"

echo "📦 Packaging $PACKAGE_NAME v$VERSION for release"
echo "============================================="

# Clean previous release
rm -rf "$RELEASE_DIR"
mkdir -p "$TEMP_DIR"

echo "📋 Creating package structure..."

# Create package directory
PKG_DIR="$TEMP_DIR/$PACKAGE_NAME"
mkdir -p "$PKG_DIR"

# Copy required files (based on package.json files field)
echo "📄 Copying distribution files..."
cp -r dist "$PKG_DIR/"
cp -r config "$PKG_DIR/"
cp -r .claude-plugin "$PKG_DIR/"
cp README.md "$PKG_DIR/"
cp INSTALL.md "$PKG_DIR/"
if [ -f LICENSE ]; then
    cp LICENSE "$PKG_DIR/"
fi

# Create package.json
echo "📝 Creating package.json..."
cat > "$PKG_DIR/package.json" << EOF
{
  "name": "$PACKAGE_NAME",
  "version": "$VERSION",
  "description": "Claude Code text-to-speech plugin using macOS native say command",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "agent-speech": "./dist/cli.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./mcp": {
      "import": "./dist/mcp-server.js",
      "types": "./dist/mcp-server.d.ts"
    }
  },
  "keywords": [
    "mcp",
    "tts",
    "text-to-speech",
    "claude-code",
    "macos",
    "say",
    "accessibility"
  ],
  "author": "welico",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.4"
  }
}
EOF

# Create archive
echo "📦 Creating archives..."
cd "$TEMP_DIR"
tar -czf "../$PACKAGE_NAME-$VERSION.tar.gz" "$PACKAGE_NAME"
zip -rq "../$PACKAGE_NAME-$VERSION.zip" "$PACKAGE_NAME"
cd -

# Calculate checksums
echo "🔐 Generating checksums..."
cd "$RELEASE_DIR"
shasum -a 256 "$PACKAGE_NAME-$VERSION.tar.gz" > "$PACKAGE_NAME-$VERSION.tar.gz.sha256"
shasum -a 256 "$PACKAGE_NAME-$VERSION.zip" > "$PACKAGE_NAME-$VERSION.zip.sha256"
cd -

# Create release notes
echo "📝 Creating release notes..."
cat > "$RELEASE_DIR/RELEASE-NOTES-$VERSION.md" << EOF
# agent-speech v$VERSION Release Notes

## Installation

### Claude Code Marketplace (Recommended)
\`\`\`bash
# Add to ~/.claude/plugins.json
{
  "name": "agent-speech",
  "version": "$VERSION",
  "url": "https://github.com/welico/agent-speech-claude-code/releases/download/v$VERSION/agent-speech-claude-code-$VERSION.tar.gz"
}
\`\`\`

### Manual Installation
\`\`\`bash
# Download and extract
cd ~/.claude/plugins
curl -L https://github.com/welico/agent-speech-claude-code/releases/download/v$VERSION/agent-speech-claude-code-$VERSION.tar.gz | tar xz

# Or using homebrew tap (coming soon)
brew install welico/tap/agent-speech
\`\`\`

## What's Included

- **Full TTS Engine**: macOS native say command integration
- **MCP Server**: Standalone MCP server for Model Context Protocol
- **Configuration System**: JSON-based config with schema validation
- **Multi-language Support**: Google Translate API integration
- **Interactive CLI**: Language selection and mute control commands
- **Claude Code Integration**: Plugin hooks and skills

## File Structure

\`\`\`
agent-speech/
├── dist/                    # Compiled JavaScript
│   ├── index.js            # Main entry point
│   ├── cli.js              # CLI commands
│   ├── mcp-server.js       # MCP server
│   └── *.d.ts              # TypeScript definitions
├── config/                  # Configuration files
│   ├── config.schema.json  # JSON schema
│   └── config.example.json # Example config
├── .claude-plugin/          # Claude Code plugin
│   ├── plugin.json         # Plugin manifest
│   ├── hooks/              # Plugin hooks
│   └── README.md           # Plugin documentation
├── README.md               # General documentation
├── INSTALL.md              # Installation guide
└── package.json            # NPM manifest
\`\`\`

## Verification

### Checksums
\`\`\`bash
# Verify tar.gz
shasum -a 256 -c agent-speech-$VERSION.tar.gz.sha256

# Verify zip
shasum -a 256 -c agent-speech-$VERSION.zip.sha256
\`\`\`

### Test Installation
\`\`\`bash
# Test TTS
agent-speech speak "Hello, world!"

# Check status
agent-speech status

# List available voices
agent-speech list-voices
\`\`\`

## Requirements

- macOS (for native \`say\` command)
- Node.js >= 18.0.0
- Claude Code (latest version)

## Support

- **Issues**: https://github.com/welico/agent-speech-claude-code/issues
- **Documentation**: https://github.com/welico/agent-speech-claude-code#readme
- **Author**: @welico

## License

MIT License - see LICENSE file for details
EOF

# Create installation manifest
cat > "$RELEASE_DIR/INSTALL-MANIFEST-$VERSION.json" << EOF
{
  "version": "$VERSION",
  "package": "$PACKAGE_NAME",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "files": {
    "tarball": "$PACKAGE_NAME-$VERSION.tar.gz",
    "zip": "$PACKAGE_NAME-$VERSION.zip",
    "checksums": {
      "tarball": "$PACKAGE_NAME-$VERSION.tar.gz.sha256",
      "zip": "$PACKAGE_NAME-$VERSION.zip.sha256"
    },
    "notes": "RELEASE-NOTES-$VERSION.md",
    "manifest": "INSTALL-MANIFEST-$VERSION.json"
  },
  "checksums": {
    "tarball": "$(shasum -a 256 "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz" | cut -d' ' -f1)",
    "zip": "$(shasum -a 256 "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.zip" | cut -d' ' -f1)"
  },
  "sizes": {
    "tarball": "$(du -h "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz" | cut -f1)",
    "zip": "$(du -h "$RELEASE_DIR/$PACKAGE_NAME-$VERSION.zip" | cut -f1)"
  }
}
EOF

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Package creation complete!"
echo "📦 Release directory: $RELEASE_DIR/"
echo ""
echo "Files created:"
ls -lh "$RELEASE_DIR/"
echo ""
echo "📝 Next steps:"
echo "1. Review the package contents"
echo "2. Test the installation: tar -xzf $RELEASE_DIR/$PACKAGE_NAME-$VERSION.tar.gz -C /tmp/"
echo "3. Create GitHub release with the generated files"
echo "4. Upload release assets:"
echo "   - $PACKAGE_NAME-$VERSION.tar.gz"
echo "   - $PACKAGE_NAME-$VERSION.zip"
echo "   - RELEASE-NOTES-$VERSION.md"
echo "   - INSTALL-MANIFEST-$VERSION.json"
