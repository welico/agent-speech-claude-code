# agent-speech-claude-code

> **Text-to-speech plugin for AI CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI)**
> **Platform**: macOS | **Level**: Starter
> **Repository**: https://github.com/welico/agent-speech-claude-code

---

## Overview

A macOS-exclusive plugin that converts AI responses into speech using the built-in `say` command. Perfect for developers who prefer listening to long responses or want audio confirmation while multitasking.

### Supported CLI Tools

| Tool | Status | Integration |
|------|--------|-------------|
| **Claude Code** | ✅ Available | MCP Server |
| **OpenCode** | 🚧 Planned | Config Adapter |
| **Codex-CLI** | 🚧 Planned | OpenAI Functions |
| **Gemini-CLI** | 🚧 Planned | Google Tools |

### Key Features

- **macOS Native TTS** - Uses built-in `say` command (no external dependencies)
- **Non-Blocking** - Runs asynchronously without interfering with CLI operation
- **Configurable** - Adjustable voice, rate (50-400 WPM), and volume (0-100)
- **Privacy-Conscious** - Optional filtering for sensitive information

---

## Quick Start

Get speech output in under 2 minutes with Claude Code:

### Option A: Install from Marketplace (Recommended)

```bash
# Add the marketplace and install
claude plugin marketplace add welico https://github.com/welico/agent-speech-claude-code
claude plugin install agent-speech-claude-code

# Restart Claude Code
```

Then test with: **"Say 'Hello World'"**

### Option B: Manual Installation

### 1. Build the Project

```bash
git clone https://github.com/welico/agent-speech-claude-code.git
cd agent-speech-claude-code
pnpm install
pnpm build
```

### 2. Configure Claude Code

Add to `~/.config/claude-code/config.json`:

```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/agent-speech-claude-code/dist/mcp-server.js"]
    }
  }
}
```

**Important**: Use an absolute path, not a relative path.

### 3. Restart Claude Code

Quit and restart Claude Code to load the new MCP server.

### 4. Test It

In Claude Code, ask: **"Say 'Hello World'"**

Claude will use the `speak_text` tool to read the response aloud.

---

## Installation

### Prerequisites

- **macOS 10.15+** (Catalina or later)
- **Node.js 18+**
- **Claude Code CLI** (for MCP integration)

### Option 1: Install from Marketplace (Recommended)

Use Claude Code's built-in plugin marketplace:

```bash
# Add the welico marketplace
claude plugin marketplace add welico https://github.com/welico/agent-speech-claude-code

# Install the plugin
claude plugin install agent-speech-claude-code
```

The plugin will be installed to `~/.claude/plugins/marketplace/welico/` and automatically configured.

### Option 2: Local Development

```bash
# Clone the repository
git clone https://github.com/welico/agent-speech-claude-code.git
cd agent-speech-claude-code

# Install dependencies
pnpm install

# Build the project
pnpm build
```

### Option 2: Global Install (via npm)

```bash
npm install -g agent-speech-claude-code
```

### Verify Installation

```bash
# Check if the MCP server builds correctly
node dist/mcp-server.js

# List available voices
agent-speech list-voices
```

---

## Configuration

### Claude Code MCP Server

Add to `~/.config/claude-code/config.json`:

```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/dist/mcp-server.js"],
      "env": {
        "DEBUG": "true",
        "LOG_FILE": "/tmp/agent-speech-debug.log"
      }
    }
  }
}
```

**Important**: Use an absolute path to `mcp-server.js`.

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEBUG` | Enable debug logging to stderr | `false` |
| `LOG_FILE` | Path to debug log file | `/tmp/agent-speech-debug.log` |
| `LOG_LEVEL` | Minimum log level (debug, info, warn, error) | `debug` |

### Config File Location

Configuration is stored at: `~/.agent-speech/config.json`

```json
{
  "enabled": true,
  "voice": "Samantha",
  "rate": 200,
  "volume": 50,
  "minLength": 10,
  "filterSensitive": false,
  "tools": {
    "claude-code": {
      "enabled": true,
      "voice": "Samantha"
    }
  }
}
```

### Voice Selection

List available macOS voices:

```bash
agent-speech list-voices
```

Or use the native macOS command:

```bash
say -v "?"
```

**Popular Voices**: Samantha, Alex, Victoria, Daniel, Fiona, Tessa

---

## Usage

### MCP Server (Claude Code)

Once configured, Claude Code can call the `speak_text` tool:

```typescript
// Claude Code uses this automatically
speak_text({
  text: "Hello, this is a test of the speech synthesis",
  voice: "Samantha",
  rate: 200,
  volume: 50
})
```

### CLI Commands Overview

```bash
agent-speech init              # Initialize configuration
agent-speech enable            # Enable TTS
agent-speech disable           # Disable TTS
agent-speech toggle            # Quick toggle on/off
agent-speech status            # Show current settings
agent-speech reset             # Reset to defaults
agent-speech set-voice <name>  # Set voice
agent-speech set-rate <wpm>    # Set speech rate (50-400)
agent-speech set-volume <0-100> # Set volume
agent-speech list-voices       # List available voices
agent-speech help              # Show help
```

---

## CLI Reference

### Configuration Commands

#### `agent-speech init`

Initialize the configuration file at `~/.agent-speech/config.json`.

```bash
agent-speech init
```

#### `agent-speech enable [tool]`

Enable TTS. Optionally specify a tool (default: claude-code).

```bash
agent-speech enable           # Enable globally
agent-speech enable opencode  # Enable for opencode
```

#### `agent-speech disable [tool]`

Disable TTS.

```bash
agent-speech disable
```

#### `agent-speech toggle [tool]`

Quick toggle on/off.

```bash
agent-speech toggle
```

#### `agent-speech status`

Show current configuration.

```bash
agent-speech status
```

**Output**:
```
Agent Speech Status
├─ Enabled: true
├─ Voice: Samantha
├─ Rate: 200 WPM
└─ Volume: 50
```

#### `agent-speech reset`

Reset to default settings.

```bash
agent-speech reset
```

### Voice Commands

#### `agent-speech set-voice <name>`

Set the voice. Use exact name from `list-voices`.

```bash
agent-speech set-voice Alex
agent-speech set-voice Victoria
```

#### `agent-speech set-rate <wpm>`

Set speech rate (50-400 words per minute).

```bash
agent-speech set-rate 150   # Slower
agent-speech set-rate 250   # Faster
```

#### `agent-speech set-volume <0-100>`

Set volume level.

```bash
agent-speech set-volume 80
```

#### `agent-speech list-voices`

List all available voices.

```bash
agent-speech list-voices
```

**Output**:
```
Available voices:
  - Samantha (Female, English)
  - Alex (Male, English)
  - Victoria (Female, Australian)
  - Daniel (Male, British)
  ...
```

### Help

#### `agent-speech help`

Show all commands.

```bash
agent-speech help
```

---

## Development

### Building

```bash
# Single build
pnpm build

# Watch mode (auto-rebuild on changes)
pnpm dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Coverage report
pnpm test:coverage
```

**Test Results** (64 tests passing):
- logger.test.ts: 13 tests ✅
- tts.test.ts: 11 tests ✅
- filter.test.ts: 15 tests ✅
- config.test.ts: 20 tests ✅
- integration/tts.test.ts: 5 tests ✅

### Debugging

**Using VS Code:**

1. Open the project in VS Code
2. Press `F5` or select "Debug MCP Server" from the Run and Debug panel
3. Set breakpoints in `src/infrastructure/mcp-server.ts`
4. Use the Debug Console to inspect variables

**Using MCP Inspector:**

```bash
pnpm inspect
```

Opens a browser-based tool at http://localhost:5173 for testing MCP tools.

**Debug Logging:**

```bash
# Enable debug output
DEBUG=true LOG_LEVEL=debug node dist/mcp-server.js

# Tail the debug log
tail -f /tmp/agent-speech-debug.log
```

### Project Structure

```
agent-speech-claude-code/
├── src/
│   ├── core/              # Core TTS logic
│   │   ├── tts.ts         # Text-to-speech implementation
│   │   ├── config.ts      # Configuration management
│   │   └── filter.ts      # Content filtering
│   ├── infrastructure/    # External integrations
│   │   ├── mcp-server.ts  # MCP server implementation
│   │   ├── say.ts         # macOS say command wrapper
│   │   └── fs.ts          # File system operations
│   ├── adapters/          # CLI tool adapters
│   │   ├── claude-code.ts # Claude Code adapter (MCP)
│   │   ├── opencode.ts    # OpenCode adapter (stub)
│   │   ├── codex-cli.ts   # Codex-CLI adapter (stub)
│   │   ├── gemini-cli.ts  # Gemini-CLI adapter (stub)
│   │   └── registry.ts    # Adapter registry
│   ├── commands/          # CLI commands
│   │   ├── init.ts
│   │   ├── enable.ts
│   │   ├── disable.ts
│   │   ├── toggle.ts
│   │   ├── status.ts
│   │   ├── reset.ts
│   │   ├── set-voice.ts
│   │   ├── set-rate.ts
│   │   ├── set-volume.ts
│   │   ├── list-voices.ts
│   │   └── help.ts
│   ├── utils/             # Utilities
│   │   ├── logger.ts      # Debug logging
│   │   ├── error-handler.ts
│   │   ├── schemas.ts     # Zod validation
│   │   └── format.ts      # Output formatting
│   ├── cli.ts             # CLI entry point
│   └── index.ts           # Package entry point
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── docs/                  # Documentation
├── scripts/               # Utility scripts
├── config/                # Configuration files
└── dist/                  # Compiled output
```

---

## Troubleshooting

### Plugin not loading in Claude Code

**Symptoms**: The `speak_text` tool doesn't appear in available tools.

**Solutions**:
1. Check that the path in `config.json` is **absolute** (not relative)
2. Verify `dist/mcp-server.js` exists (`pnpm build`)
3. Check Claude Code debug logs: **View → Developer → Show Debug Logs**
4. Restart Claude Code after config changes

### No speech output

**Symptoms**: Tool executes but no sound plays.

**Solutions**:
1. Check macOS volume is not muted
2. Verify the voice exists: `say -v Samantha "test"`
3. Check if TTS is enabled: `agent-speech status`
4. Try enabling: `agent-speech enable`

### Speech too fast or too slow

**Solution**: Adjust the rate setting

```bash
# Slower (recommended for long content)
agent-speech set-rate 150

# Faster (for brief updates)
agent-speech set-rate 250
```

### "say command not found"

**Symptoms**: Error about `say` command.

**Solution**: This plugin requires macOS. The `say` command is macOS-only and not available on Linux or Windows.

### Voice not found

**Symptoms**: Error about voice name.

**Solution**: List available voices and use an exact name

```bash
agent-speech list-voices
agent-speech set-voice Samantha  # Use exact name from list
```

### Need more help?

1. Check debug logs: `tail -f /tmp/agent-speech-debug.log`
2. Run tests: `pnpm test`
3. Open an issue on [GitHub](https://github.com/welico/agent-speech-claude-code/issues)

---

## MCP Tool Reference

### `speak_text`

Convert text to speech using macOS TTS.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to speak |
| `voice` | string | No | Voice name (e.g., Samantha, Alex, Victoria) |
| `rate` | number | No | Speech rate in words per minute (50-400) |
| `volume` | number | No | Volume level (0-100) |

**Example**:

```json
{
  "text": "Hello, this is a test",
  "voice": "Samantha",
  "rate": 200,
  "volume": 50
}
```

---

## License

MIT

---

**Status**: Active Development
