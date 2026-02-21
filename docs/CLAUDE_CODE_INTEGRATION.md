# Claude Code Integration Guide

This guide shows how to configure Claude Code to use the agent-speech-claude-code locally for development and testing.

## Configuration

### Claude Code Config Location

The Claude Code configuration file is located at:
- **macOS**: `~/.config/claude-code/config.json`

### Adding the Plugin

Add the following to your `config.json`:

```json
{
  "mcpServers": {
    "agent-speech-dev": {
      "command": "node",
      "args": [
        "/Users/welico/Git/GitHub/welico/agent-speech-claude-code/dist/mcp-server.js"
      ],
      "env": {
        "DEBUG": "true",
        "LOG_FILE": "/tmp/agent-speech-debug.log"
      }
    }
  }
}
```

**Important**: Replace `/Users/welico/Git/GitHub/welico/agent-speech-claude-code` with your actual project path.

### Full Example Config

Here's a complete example with other common settings:

```json
{
  "mcpServers": {
    "agent-speech-dev": {
      "command": "node",
      "args": [
        "/Users/welico/Git/GitHub/welico/agent-speech-claude-code/dist/mcp-server.js"
      ],
      "env": {
        "DEBUG": "true",
        "LOG_FILE": "/tmp/agent-speech-debug.log"
      }
    },
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/welico"
      ]
    }
  }
}
```

## Environment Variables

| Variable | Purpose | Default |
|-----------|---------|---------|
| `DEBUG` | Enable debug logging to stderr | `false` |
| `LOG_FILE` | Path to debug log file | `/tmp/agent-speech-debug.log` |
| `LOG_LEVEL` | Minimum log level (debug, info, warn, error) | `debug` |

## Building for Development

Before using the plugin in Claude Code, build the project:

```bash
# Build once
pnpm build

# Or use watch mode for automatic rebuilds
pnpm dev
```

## Testing the Integration

### 1. Restart Claude Code

After modifying `config.json`, restart Claude Code to load the new MCP server.

### 2. Verify Tool Availability

In Claude Code, ask to see available tools:

```
What MCP tools are available?
```

You should see `speak_text` listed.

### 3. Test the Plugin

Ask Claude to speak something:

```
Please say "Hello, this is a test of the text to speech system" using the speak_text tool.
```

## Troubleshooting

### Plugin Not Loading

1. Check the build output exists:
   ```bash
   ls -la dist/mcp-server.js
   ```

2. Check Claude Code logs for errors:
   - Open Claude Code
   - View → Developer → Show Debug Logs

3. Verify the path in `config.json` is absolute (not relative)

### Debug Mode

Enable debug mode to see what's happening:

```json
"env": {
  "DEBUG": "true",
  "LOG_FILE": "/tmp/agent-speech-debug.log"
}
```

Then check the log:
```bash
tail -f /tmp/agent-speech-debug.log
```

### macOS `say` Command Issues

If speech doesn't work:
1. Test macOS `say` directly: `say "test"`
2. List available voices: `say -v "?"`
3. Check if the voice exists: `say -v Samantha "test"`

## Development Workflow

For active development:

1. Terminal 1: Run `pnpm dev` for auto-rebuild
2. Terminal 2: Run `pnpm inspect` for MCP Inspector testing
3. Claude Code: For integration testing

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Terminal   │     │  Inspector  │     │  Claude     │
│  pnpm dev   │     │  Browser UI  │     │  Code       │
│  (watch)    │     │  (testing)   │     │  (testing)   │
└─────────────┘     └─────────────┘     └─────────────┘
        │                     │                     │
        └─────────────────────┴─────────────────────┘
                    dist/mcp-server.js
```

## Production Use

For production deployment (e.g., npm install), the plugin will be installed to:
```
node_modules/agent-speech-claude-code/dist/mcp-server.js
```

Update the config path accordingly.
