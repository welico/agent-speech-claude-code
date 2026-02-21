# Design: README Usage Documentation

> **Feature**: Update README.md with comprehensive usage documentation
> **Project**: agent-speech-claude-code
> **Date**: 2026-02-13
> **Status**: Design
> **Author**: welico
> **Plan Doc**: [readme-usage-docs.plan.md](../../01-plan/features/readme-usage-docs.plan.md)

---

## 1. Current README Analysis

### 1.1 Issues Identified

| Issue | Location | Severity |
|-------|----------|----------|
| Wrong config path | `~/.claude/mcp.json` | High |
| Wrong config path | `~/.config/claude-code/config.json` | High |
| Excessive whitespace | Architecture diagram (lines 158-262) | Medium |
| Missing quick start | Top of README | Medium |
| CLI command examples outdated | CLI Commands section | Low |
| No troubleshooting section | - | Medium |
| Missing dev testing guide | Development section | Medium |
| No environment variables section | - | Medium |

### 1.2 Current Structure

```
README.md (309 lines)
├── Overview (lines 1-29)
├── Installation (lines 32-73)
├── Usage with Claude Code (lines 75-87)
├── CLI Commands (lines 89-102)
├── Project Structure (lines 104-122)
├── Key Features (lines 124-143)
├── Architecture (lines 145-275) ⚠️ Excessive whitespace
├── License (line 278)
└── MCP Tool Reference (lines 282-308)
```

---

## 2. Target README Structure

```markdown
# agent-speech-claude-code

[Badges]

## Overview
[What it does, supported tools, platform]

## Quick Start
[Fastest path to first speech output]

## Installation
  ### Via npm (global)
  ### Local Development
  ### Verify Installation

## Configuration
  ### Claude Code Setup (MCP)
  ### Environment Variables
  ### Config File Location
  ### Voice Selection

## Usage
  ### MCP Server (Claude Code)
  ### CLI Commands Overview

## CLI Reference
  ### Configuration Commands
    - init, enable, disable, toggle, status, reset
  ### Voice Commands
    - set-voice, list-voices, set-rate, set-volume
  ### Help Command

## Development
  ### Building
  ### Testing
  ### Debugging
  ### Project Structure

## Troubleshooting
  [Common issues and solutions]

## License
```

---

## 3. Detailed Section Designs

### 3.1 Quick Start Section

**Goal**: Get users to first speech output in under 2 minutes

```markdown
## Quick Start

### For Claude Code (Recommended)

1. **Add to Claude Code config** (`~/.config/claude-code/config.json`):

\`\`\`json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/path/to/agent-speech-claude-code/dist/mcp-server.js"]
    }
  }
}
\`\`\`

2. **Restart Claude Code**

3. **Ask Claude to speak**: "Say 'Hello World'"

That's it! Claude will now use the `speak_text` tool to read responses aloud.
```

### 3.2 Installation Section

**Goal**: Clear installation paths for different use cases

```markdown
## Installation

### Prerequisites

- **macOS 10.15+** (Catalina or later)
- **Node.js 18+**
- **Claude Code CLI** (for MCP integration)

### Option 1: Local Development (Recommended for testing)

\`\`\`bash
# Clone the repository
git clone https://github.com/welico/agent-speech-claude-code.git
cd agent-speech-claude-code

# Install dependencies
pnpm install

# Build the project
pnpm build

# Verify installation
pnpm test
\`\`\`

### Option 2: Global Install (via npm)

\`\`\`bash
npm install -g agent-speech-claude-code

# Verify
agent-speech status
\`\`\`

### Verify Installation

\`\`\`bash
# Check if the MCP server builds correctly
node dist/mcp-server.js

# List available voices
agent-speech list-voices
\`\`\`
```

### 3.3 Configuration Section

**Goal**: All configuration options in one place

```markdown
## Configuration

### Claude Code MCP Server

Add to `~/.config/claude-code/config.json`:

\`\`\`json
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
\`\`\`

**Important**: Use an absolute path, not a relative path.

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEBUG` | Enable debug logging | `false` |
| `LOG_FILE` | Path to debug log file | `/tmp/agent-speech-debug.log` |
| `LOG_LEVEL` | Minimum log level (debug, info, warn, error) | `debug` |

### Config File Location

Configuration is stored at: `~/.agent-speech/config.json`

\`\`\`json
{
  "enabled": true,
  "voice": "Samantha",
  "rate": 200,
  "volume": 50,
  "minLength": 10,
  "tools": {
    "claude-code": {
      "enabled": true,
      "voice": "Samantha"
    }
  }
}
\`\`\`

### Voice Selection

List available macOS voices:

\`\`\`bash
agent-speech list-voices
\`\`\`

Or use the native macOS command:

\`\`\`bash
say -v "?"
\`\`\`

**Popular voices**: Samantha, Alex, Victoria, Daniel, Fiona, Tessa
```

### 3.4 CLI Reference Section

**Goal**: Complete command reference with examples

```markdown
## CLI Reference

### Configuration Commands

#### `agent-speech init`
Initialize the configuration file.

\`\`\`bash
agent-speech init
\`\`\`

#### `agent-speech enable [tool]`
Enable TTS for a tool (default: claude-code).

\`\`\`bash
agent-speech enable           # Enable global
agent-speech enable opencode  # Enable for opencode
\`\`\`

#### `agent-speech disable [tool]`
Disable TTS for a tool.

\`\`\`bash
agent-speech disable
\`\`\`

#### `agent-speech toggle [tool]`
Quick toggle on/off.

\`\`\`bash
agent-speech toggle
\`\`\`

#### `agent-speech status`
Show current configuration.

\`\`\`bash
agent-speech status
# Output:
# Agent Speech Status
# ├─ Enabled: true
# ├─ Voice: Samantha
# ├─ Rate: 200 WPM
# └─ Volume: 50
\`\`\`

#### `agent-speech reset`
Reset to default settings.

\`\`\`bash
agent-speech reset
\`\`\`

### Voice Commands

#### `agent-speech set-voice <name>`
Set the voice.

\`\`\`bash
agent-speech set-voice Alex
agent-speech set-voice Victoria
\`\`\`

#### `agent-speech set-rate <wpm>`
Set speech rate (50-400 words per minute).

\`\`\`bash
agent-speech set-rate 150   # Slower
agent-speech set-rate 250   # Faster
\`\`\`

#### `agent-speech set-volume <0-100>`
Set volume level.

\`\`\`bash
agent-speech set-volume 80
\`\`\`

#### `agent-speech list-voices`
List all available voices.

\`\`\`bash
agent-speech list-voices
# Output:
# Available voices:
#   - Samantha (Female, English)
#   - Alex (Male, English)
#   - Victoria (Female, Australian)
#   ...
\`\`\`

### Help

#### `agent-speech help`
Show all commands.

\`\`\`bash
agent-speech help
\`\`\`
```

### 3.5 Development Section

**Goal**: Clear guide for contributors

```markdown
## Development

### Building

\`\`\`bash
# Single build
pnpm build

# Watch mode (auto-rebuild on changes)
pnpm dev
\`\`\`

### Testing

\`\`\`bash
# Run all tests
pnpm test

# Run with UI
pnpm test:ui

# Coverage report
pnpm test:coverage
\`\`\`

### Debugging

**Using VS Code:**

1. Open the project in VS Code
2. Press F5 or select "Debug MCP Server" from the Run and Debug panel
3. Set breakpoints in `src/infrastructure/mcp-server.ts`
4. Use the Debug Console to inspect variables

**Using MCP Inspector:**

\`\`\`bash
pnpm inspect
\`\`\`

This opens a browser-based tool for testing MCP tools.

### Project Structure

\`\`\`
agent-speech-claude-code/
├── src/
│   ├── core/              # Core TTS logic
│   │   ├── tts.ts         # Text-to-speech implementation
│   │   ├── config.ts      # Configuration management
│   │   └── filter.ts      # Content filtering
│   ├── infrastructure/    # External integrations
│   │   ├── mcp-server.ts  # MCP server implementation
│   │   └── say.ts         # macOS say command wrapper
│   ├── adapters/          # CLI tool adapters
│   │   ├── claude-code.ts # Claude Code adapter (MCP)
│   │   ├── opencode.ts    # OpenCode adapter (stub)
│   │   ├── codex-cli.ts   # Codex-CLI adapter (stub)
│   │   └── gemini-cli.ts  # Gemini-CLI adapter (stub)
│   ├── commands/          # CLI commands
│   ├── utils/             # Utilities (logger, schemas)
│   └── cli.ts             # CLI entry point
├── tests/
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── docs/                  # Documentation
└── scripts/               # Utility scripts
\`\`\`
```

### 3.6 Troubleshooting Section

**Goal**: Solve common issues quickly

```markdown
## Troubleshooting

### Plugin not loading in Claude Code

**Symptoms**: The `speak_text` tool doesn't appear in available tools.

**Solutions**:
1. Check that the path in `config.json` is absolute (not relative)
2. Verify `dist/mcp-server.js` exists (`pnpm build`)
3. Check Claude Code debug logs: View → Developer → Show Debug Logs
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

\`\`\`bash
# Slower (recommended for long content)
agent-speech set-rate 150

# Faster (for brief updates)
agent-speech set-rate 250
\`\`\`

### "say command not found"

**Symptoms**: Error about `say` command.

**Solution**: This plugin requires macOS. The `say` command is macOS-only and not available on Linux or Windows.

### Voice not found

**Symptoms**: Error about voice name.

**Solution**: List available voices and use an exact name

\`\`\`bash
agent-speech list-voices
agent-speech set-voice Samantha  # Use exact name from list
\`\`\`

### Need more help?

1. Check debug logs: `tail -f /tmp/agent-speech-debug.log`
2. Run tests: `pnpm test`
3. Open an issue on GitHub
```

---

## 4. Implementation Order

| Step | Task | Output |
|------|------|--------|
| 1 | Read existing docs for content to reference | Content notes |
| 2 | Write Quick Start section | README Quick Start |
| 3 | Rewrite Installation section | README Installation |
| 4 | Write Configuration section | README Configuration |
| 5 | Rewrite CLI Reference | README CLI Reference |
| 6 | Rewrite Development section | README Development |
| 7 | Write Troubleshooting section | README Troubleshooting |
| 8 | Clean up architecture diagram | Remove excess whitespace |
| 9 | Review and refine | Final README |
| 10 | Update README.md | Complete documentation |

---

## 5. Key Changes Summary

### 5.1 Content Changes

| Change | Type | Reason |
|--------|------|--------|
| Fix config path | Correction | ~/.config/claude-code/config.json |
| Add Quick Start | Addition | Faster onboarding |
| Add Troubleshooting | Addition | Self-service support |
| Clean whitespace | Cleanup | Remove ~100 empty lines |
| Add env vars section | Addition | Debug configuration |
| Expand CLI reference | Expansion | Complete command docs |
| Add development testing | Addition | Contributor guide |

### 5.2 Structure Changes

- Move "Quick Start" to top (after Overview)
- Consolidate installation options
- Add dedicated Configuration section
- Group CLI commands by category
- Add Development subsections
- Add Troubleshooting section

---

## 6. acceptance Criteria

- [ ] Quick start gets user to speech in < 2 minutes
- [ ] All config paths are correct
- [ ] All 11 CLI commands documented with examples
- [ ] Environment variables documented
- [ ] Troubleshooting covers common issues
- [ ] Excessive whitespace removed
- [ ] Links to existing docs work
- [ ] Markdown formatting is clean

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-13 | Initial design | welico |
