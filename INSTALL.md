# Agent Speech Plugin - Installation Guide

## Quick Start (Claude Code for macOS)

### Step 1: Clone and Build

```bash
git clone https://github.com/welico/agent-speech-claude-code.git
cd agent-speech-claude-code
npm install
npm run build
```

### Step 2: Register MCP Server with Claude Code

Create or edit `~/.claude/mcp.json`:

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

**Important**: Replace `/ABSOLUTE/PATH/TO/` with your actual path. Use `pwd` to get it:

```bash
pwd  # Copy output
```

Example:
```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/Users/warezio/Git/GitHub/welico/agent-speech-claude-code/dist/mcp-server.js"]
    }
  }
}
```

### Step 3: Initialize Configuration

```bash
npm run cli -- init
```

Or globally (if installed):
```bash
agent-speech init
```

### Step 4: Verify Installation

```bash
agent-speech status
```

Expected output:
```
[agent-speech] Configuration status:
[agent-speech]   version: 0.1.0
[agent-speech]   enabled: true
[agent-speech]   voice: Samantha
[agent-speech]   rate: 200 WPM
[agent-speech]   volume: 50
[agent-speech]   claude-code: ✓ enabled
```

### Step 5: Test with Claude Code

Restart Claude Code and try:
```
Please say "Hello, this is a test of the speech plugin."
```

Claude Code will use the `speak_text` tool automatically.

## Usage Examples

### Enable/Disable for Specific Tools

```bash
# Enable for Claude Code (default)
agent-speech enable claude-code

# Disable for Claude Code
agent-speech disable claude-code

# Toggle current state
agent-speech toggle claude-code
```

### Change Voice Settings

```bash
# Set voice (use 'agent-speech list-voices' to see options)
agent-speech set-voice Alex

# Set speech rate (50-400 words per minute)
agent-speech set-rate 250

# Set volume (0-100)
agent-speech set-volume 75
```

### List Available Voices

```bash
agent-speech list-voices
```

Example output:
```
[agent-speech] Available voices:
[agent-speech]   Name            Display Name        Language
[agent-speech]   Samantha        Samantha             en-US
[agent-speech]   Alex            Alex                 en-US
[agent-speech]   Victoria        Victoria             en-US
[agent-speech]   Fred            Fred                 en-US
[agent-speech]   Junior          Junior               en-US
```

## Configuration File

Configuration is stored in `~/.agent-speech/config.json`:

```json
{
  "$schema": "./config.schema.json",
  "version": "0.1.0",
  "global": {
    "enabled": true,
    "voice": "Samantha",
    "rate": 200,
    "volume": 50,
    "minLength": 10,
    "maxLength": 0,
    "filters": {
      "sensitive": false,
      "skipCodeBlocks": false,
      "skipCommands": false
    }
  },
  "tools": {
    "claude-code": {
      "enabled": true,
      "voice": "Samantha",
      "rate": 200
    }
  }
}
```

## Troubleshooting

### MCP Server Not Found

If Claude Code can't find the MCP server:

1. Check the path in `~/.claude/mcp.json` is absolute
2. Verify the file exists: `ls /path/to/agent-speech-claude-code/dist/mcp-server.js`
3. Restart Claude Code

### No Audio Output

1. Check TTS is enabled: `agent-speech status`
2. Check system volume is not muted
3. Test with: `say "Hello"` (native macOS command)
4. Check minLength setting (default 10 characters)

### Voice Not Available

1. List voices: `agent-speech list-voices`
2. System voices: `say -v ?`
3. Install additional voices in System Settings > Accessibility > Spoken Content

## Uninstallation

```bash
# Remove MCP server config
# Edit ~/.claude/mcp.json and remove "agent-speech" entry

# Remove configuration
rm -rf ~/.agent-speech

# Remove source code (optional)
cd .. && rm -rf agent-speech-claude-code
```

## Next Steps

- Configure content filtering for sensitive information
- Set up per-tool configurations
- Customize voice and rate preferences
- Check README.md for full feature list
