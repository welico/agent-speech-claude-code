# Agent Speech Plugin

> Text-to-speech plugin for AI CLI tools using macOS native `say` command

Convert Claude Code responses into speech with configurable voice, rate, and volume. Perfect for developers who prefer listening to long responses or want audio confirmation while multitasking.

## Features

- **macOS Native** - Uses built-in `say` command (no external dependencies)
- **Non-Blocking** - Runs asynchronously without interfering with CLI operation
- **Configurable** - Adjustable voice, rate (50-400 WPM), and volume (0-100)
- **Privacy-Conscious** - Optional filtering for sensitive information
- **MCP Integration** - Works seamlessly with Claude Code via Model Context Protocol

## Quick Start

### Installation via Marketplace

```bash
# Install from welico marketplace
claude plugin marketplace add welico https://github.com/welico/agent-speech-claude-code
claude plugin install agent-speech-claude-code
```

### Manual Installation

1. Clone and build:
```bash
git clone https://github.com/welico/agent-speech-claude-code.git
cd agent-speech-claude-code
pnpm install
pnpm build
```

2. Add to Claude Code config (`~/.config/claude-code/config.json`):
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

3. Restart Claude Code

## Usage

Once installed, Claude Code can use the `speak_text` tool to convert responses to speech.

**Example prompts:**
- "Say 'Hello World'"
- "Read that response aloud"
- "Speak the last paragraph"

## Configuration

Configure voice settings at `~/.agent-speech/config.json`:

```json
{
  "enabled": true,
  "voice": "Samantha",
  "rate": 200,
  "volume": 50,
  "minLength": 10
}
```

### Popular macOS Voices

- **Samantha** - Female, American English (recommended)
- **Alex** - Male, American English
- **Victoria** - Female, Australian
- **Daniel** - Male, British
- **Fiona** - Female, Scottish
- **Tessa** - Female, South African

List all voices:
```bash
say -v "?"
```

## CLI Commands

```bash
agent-speech init              # Initialize configuration
agent-speech status            # Show current settings
agent-speech enable            # Enable TTS
agent-speech disable           # Disable TTS
agent-speech toggle            # Quick toggle on/off
agent-speech set-voice <name>  # Set voice
agent-speech set-rate <wpm>    # Set speech rate (50-400)
agent-speech set-volume <0-100> # Set volume
agent-speech list-voices       # List available voices
agent-speech reset             # Reset to defaults
```

## Requirements

- **macOS 10.15+** (Catalina or later)
- **Node.js 18+**
- **Claude Code CLI**

## License

MIT License - see LICENSE file for details

## Links

- [Repository](https://github.com/welico/agent-speech-claude-code)
- [Issues](https://github.com/welico/agent-speech-claude-code/issues)
- [Documentation](https://github.com/welico/agent-speech-claude-code#readme)
