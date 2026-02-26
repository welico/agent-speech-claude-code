# agent-speech v0.4.2 Release Notes

## Installation

### Claude Code Marketplace (Recommended)
```bash
# Add to ~/.claude/plugins.json
{
  "name": "agent-speech",
  "version": "0.4.2",
  "url": "https://github.com/welico/agent-speech-claude-code/releases/download/v0.4.2/agent-speech-claude-code-0.4.2.tar.gz"
}
```

### Manual Installation
```bash
# Download and extract
cd ~/.claude/plugins
curl -L https://github.com/welico/agent-speech-claude-code/releases/download/v0.4.2/agent-speech-claude-code-0.4.2.tar.gz | tar xz

# Or using homebrew tap (coming soon)
brew install welico/tap/agent-speech
```

## What's Included

- **Full TTS Engine**: macOS native say command integration
- **MCP Server**: Standalone MCP server for Model Context Protocol
- **Configuration System**: JSON-based config with schema validation
- **Multi-language Support**: Google Translate API integration
- **Interactive CLI**: Language selection and mute control commands
- **Claude Code Integration**: Plugin hooks and skills

## File Structure

```
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
```

## Verification

### Checksums
```bash
# Verify tar.gz
shasum -a 256 -c agent-speech-0.4.2.tar.gz.sha256

# Verify zip
shasum -a 256 -c agent-speech-0.4.2.zip.sha256
```

### Test Installation
```bash
# Test TTS
agent-speech speak "Hello, world!"

# Check status
agent-speech status

# List available voices
agent-speech list-voices
```

## Requirements

- macOS (for native `say` command)
- Node.js >= 18.0.0
- Claude Code (latest version)

## Support

- **Issues**: https://github.com/welico/agent-speech-claude-code/issues
- **Documentation**: https://github.com/welico/agent-speech-claude-code#readme
- **Author**: @welico

## License

MIT License - see LICENSE file for details
