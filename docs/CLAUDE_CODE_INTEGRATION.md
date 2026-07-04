# Claude Code Integration Guide

This guide shows how to load agent-speech-claude-code locally for development and testing, following the official [Claude Code plugin](https://code.claude.com/docs/en/plugins) workflow.

## Configuration

### Loading the Plugin (Recommended)

Claude Code loads a plugin directly from its working directory with the `--plugin-dir` flag — no config file editing required. This picks up the skill, hooks, and the `.mcp.json`-defined MCP server together:

```bash
claude --plugin-dir /Users/warezio/Git/GitHub/welico/agent-speech-claude-code
```

**Important**: Use an absolute path. Replace it with your actual project path.

While iterating, run `/reload-plugins` inside the session to pick up changes without restarting Claude Code.

### MCP-Server-Only Setup (Alternative)

To register only the MCP server, without the bundled skill or hooks, use `claude mcp add`. This writes to `.mcp.json` (project scope) or `~/.claude.json` (user scope):

```bash
claude mcp add --scope project --env DEBUG=true --env LOG_FILE=/tmp/agent-speech-debug.log \
  agent-speech-dev -- node /Users/warezio/Git/GitHub/welico/agent-speech-claude-code/dist/mcp-server.js
```

**Important**: Replace the path with your actual project path.

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

### 1. Load or Reload the Plugin

Start Claude Code with `--plugin-dir` as shown above, or run `/reload-plugins` in an existing session after rebuilding.

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

2. Run Claude Code with `--debug` to see plugin loading details, manifest errors, and MCP server initialization:
   ```bash
   claude --debug --plugin-dir /path/to/agent-speech-claude-code
   ```

3. Verify the path passed to `--plugin-dir` (or `claude mcp add`) is absolute (not relative)

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

For everyday use (not local development), install the plugin from the marketplace instead of pointing at a local checkout:

```bash
claude plugin marketplace add welico/agent-speech-claude-code
claude plugin install agent-speech@welico
```

Claude Code copies the plugin into its local plugin cache (`~/.claude/plugins/cache`) and resolves `${CLAUDE_PLUGIN_ROOT}` in `.mcp.json` and `hooks/hooks.json` automatically — no manual path configuration needed.
