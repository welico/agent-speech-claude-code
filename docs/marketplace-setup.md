# Marketplace Setup Guide

This guide explains how to set up and distribute the agent-speech-claude-code through Claude Code's plugin marketplace.

## Marketplace Architecture

Claude Code discovers and installs plugins through marketplace repositories. Each marketplace is a GitHub repository containing a `.claude-plugin/marketplace.json` file that lists available plugins.

### File Structure

```
agent-speech-claude-code/                    # Plugin repository
├── .claude-plugin/                     # Marketplace metadata
│   ├── marketplace.json               # Marketplace definition
│   └── agent-speech-claude-code/           # Plugin definition
│       ├── plugin.json               # Plugin metadata
│       ├── .mcp.json                 # MCP server config
│       └── README.md                 # Plugin documentation
├── dist/                              # Compiled JavaScript
│   └── mcp-server.js                  # MCP server entry point
├── src/                               # TypeScript source
└── package.json                       # NPM package metadata
```

### Marketplace Installation Flow

1. User adds marketplace: `claude plugin marketplace add welico <url>`
2. Claude clones repo to: `~/.claude/plugins/marketplaces/welico/`
3. User installs plugin: `claude plugin install agent-speech-claude-code`
4. Plugin is cached at: `~/.claude/plugins/cache/welico/agent-speech-claude-code/`
5. MCP server path becomes: `~/.claude/plugins/cache/welico/agent-speech-claude-code/dist/mcp-server.js`

## Setting Up Your Marketplace

### 1. Marketplace Metadata (`marketplace.json`)

Located at `.claude-plugin/marketplace.json`:

```json
{
  "$schema": "https://anthropic.com/claude-code/marketplace.schema.json",
  "name": "welico",
  "version": "1.0.0",
  "description": "Plugin marketplace by welico",
  "owner": {
    "name": "welico",
    "url": "https://github.com/welico"
  },
  "plugins": [
    {
      "name": "agent-speech-claude-code",
      "description": "Text-to-speech plugin...",
      "version": "1.0.0",
      "author": {
        "name": "welico",
        "url": "https://github.com/welico"
      },
      "repository": "https://github.com/welico/agent-speech-claude-code",
      "source": {
        "source": "url",
        "url": "https://github.com/welico/agent-speech-claude-code.git"
      },
      "category": "accessibility",
      "keywords": ["tts", "text-to-speech", "macos"]
    }
  ]
}
```

### 2. Plugin Metadata (`plugin.json`)

Located at `.claude-plugin/agent-speech-claude-code/plugin.json`:

```json
{
  "name": "agent-speech-claude-code",
  "description": "...",
  "version": "1.0.0",
  "author": {
    "name": "welico"
  },
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["dist/mcp-server.js"]
    }
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "os": ["darwin"],
  "platform": "macos"
}
```

## Distribution Steps

### Step 1: Prepare Release

1. Update version numbers:
   - `package.json` version
   - `.claude-plugin/marketplace.json` version
   - `.claude-plugin/agent-speech-claude-code/plugin.json` version

2. Build the project:
```bash
pnpm build
```

3. Verify the build:
```bash
node dist/mcp-server.js
```

### Step 2: Create Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### Step 3: Update GitHub Release

1. Go to GitHub Releases
2. Create new release from tag
3. Include changelog

### Step 4: Verify Marketplace Installation

Users can now install:

```bash
claude plugin marketplace add welico https://github.com/welico/agent-speech-claude-code
claude plugin install agent-speech-claude-code
```

## Marketplace Source Options

### Option 1: Single Plugin Marketplace (Current)

The marketplace repository IS the plugin repository. This is simplest for single plugins.

```json
"source": {
  "source": "url",
  "url": "https://github.com/welico/agent-speech-claude-code.git"
}
```

### Option 2: Multi-Plugin Marketplace

For multiple plugins, create a separate marketplace repository:

```
welico-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   ├── agent-speech-claude-code/    # Submodule or reference
│   └── another-plugin/
```

Then in marketplace.json:

```json
"plugins": [
  {
    "name": "agent-speech-claude-code",
    "source": {
      "source": "url",
      "url": "https://github.com/welico/agent-speech-claude-code.git"
    }
  }
]
```

## Local Marketplace Testing

Test your marketplace before publishing:

```bash
# Create a test marketplace entry
claude plugin marketplace add welico-test file:///path/to/agent-speech-claude-code

# Install plugin from test marketplace
claude plugin install agent-speech-claude-code

# Verify MCP server is loaded
# Check Claude Code debug logs
```

## Publishing to Public Marketplace

To be listed in Claude Code's official marketplace:

1. Ensure your plugin:
   - Has comprehensive documentation
   - Follows semantic versioning
   - Includes tests
   - Has a clear LICENSE

2. Submit to:
   - GitHub: Create a PR to [anthropics/claude-plugins-public](https://github.com/anthropics/claude-plugins-public)
   - Or maintain your own marketplace (like we're doing)

## Version Bumping Checklist

When releasing a new version:

- [ ] Update `package.json` version
- [ ] Update `.claude-plugin/marketplace.json` version
- [ ] Update `.claude-plugin/agent-speech-claude-code/plugin.json` version
- [ ] Run `pnpm build`
- [ ] Run `pnpm test` to verify
- [ ] Commit changes
- [ ] Create git tag
- [ ] Push to GitHub
- [ ] Create GitHub release
- [ ] Test installation from marketplace

## Troubleshooting

### Plugin not found after marketplace install

**Cause**: MCP server path in `plugin.json` may be relative

**Solution**: Ensure `args` points to correct path relative to plugin root

```json
"args": ["dist/mcp-server.js"]  // Relative to plugin root
```

### Version mismatch

**Cause**: Different version numbers in metadata files

**Solution**: Keep all version fields synchronized across:
- `package.json`
- `marketplace.json` (plugin entry)
- `plugin.json`

### Build artifacts not included

**Cause**: Missing files in npm package

**Solution**: Add to `package.json` files array:

```json
"files": [
  "dist",
  "config",
  ".claude-plugin",
  "README.md",
  "LICENSE"
]
```

## Resources

- [Claude Code Plugin Documentation](https://code.claude.com/docs/en/plugins)
- [Marketplace Guide](https://code.claude.com/docs/en/plugin-marketplaces)
- [Official Marketplace](https://github.com/anthropics/claude-plugins-official)
- [Example Plugins](https://github.com/anthropics/claude-plugins-public)
