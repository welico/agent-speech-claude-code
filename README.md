# Agent Speech Plugin

> **A plugin that provides audio guidance for Terminal CLI AI Agent responses**
> **Platform**: macOS | **Level**: Starter
> **Repository**: https://github.com/warezio/agent-speech-plugin

---

## 📋 Overview

A macOS-exclusive plugin that allows developers to hear responses via audio when using AI tools in the terminal such as Claude Code, OpenCode, Codex-CLI, and Gemini-CLI.

### 🎯 Supported CLI Tools

- [x] **Claude Code** - Available via MCP (Model Context Protocol)
- [ ] **OpenCode** - Planned
- [ ] **Codex-CLI** - Planned (OpenAI function calling)
- [ ] **Gemini-CLI** - Planned (Google tool calling)

### 🚧 Development Status

**Starter Level** - Implementing core plugin features with local TTS and simple configuration.

- [x] Phase 1: Plan (Completed)
- [x] Phase 2: Design (Completed)
- [x] Phase 3: Implementation (In Progress - Claude Code MVP)
- [ ] Phase 4: Testing
- [ ] Phase 5: Release

---

## 🚀 Installation

### Prerequisites

- macOS 10.15+ (Catalina or higher)
- Node.js 18+
- Claude Code CLI

### Quick Install

1. **Clone and build:**
```bash
git clone https://github.com/warezio/agent-speech-plugin.git
cd agent-speech-plugin
npm install
npm run build
```

2. **Configure Claude Code MCP server:**

Create or edit `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/path/to/agent-speech-plugin/dist/mcp-server.js"]
    }
  }
}
```

3. **Initialize configuration:**
```bash
npm run cli -- init
```

4. **Test it works:**
```bash
npm run cli -- status
```

### Usage with Claude Code

Once installed, Claude Code can call the `speak_text` tool:

```typescript
// Claude Code will use this tool automatically
mcp.speak_text({
  text: "Hello, this is a test of the speech synthesis",
  voice: "Samantha",
  rate: 200,
  volume: 50
})
```

### CLI Commands

```bash
agent-speech init              # Initialize configuration
agent-speech enable [tool]     # Enable TTS for tool (default: claude-code)
agent-speech disable [tool]    # Disable TTS for tool
agent-speech toggle [tool]     # Toggle TTS on/off
agent-speech status            # Show configuration status
agent-speech set-voice <name>  # Set voice (e.g., Samantha, Alex)
agent-speech set-rate <wpm>    # Set speech rate (50-400)
agent-speech set-volume <0-100> # Set volume
agent-speech list-voices       # List available voices
agent-speech reset             # Reset to defaults
```

---

## 📁 Project Structure

```
agent-speech-plugin/
├── docs/
│   ├── 01-plan/
│   │   └── features/
│   │       └── agent-speech-plugin.plan.md    # Planning document
│   ├── 02-design/
│   │   └── features/
│   │       └── agent-speech-plugin.design.md    # Design document (Core + Adapter architecture)
│   ├── 03-analysis/                          # Analysis document (Planned)
│   └── 04-report/                            # Completion report (Planned)
├── src/                                      # Source code (To be implemented)
│   ├── config/                                   # Configuration files
└── README.md
```

---

## 🔧 Key Features

### Core Features
- **macOS Native TTS** - Uses the built-in `say` command for speech synthesis
- **Non-Blocking** - Runs asynchronously without interfering with CLI tool operation
- **Privacy-Conscious** - Optional filtering for sensitive information (passwords, API keys)
- **Configuration File** - Persistent storage via `~/.agent-speech/config.json`

### Adjustable Settings
- **Voice Selection** - Choose from installed macOS voices (Samantha, Alex, etc.)
- **Speech Rate Control** - Adjustable words-per-minute (50-400 WPM)
- **Volume Control** - Adjustable volume (0-100)
- **On/Off Toggle** - Quick enable/disable without uninstalling

### Per-Tool Configuration
- Each CLI tool can have independent settings
- Tool-specific config overrides global config
- Support for Claude Code, OpenCode, Codex-CLI, Gemini-CLI

---

## 🏗️ Architecture

### Core + Adapter Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Environment                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌─────────────────────┐              ┌─────────┐│
│  │   CLI Tool     │         │   Agent Speech Plugin  │              │ macOS   ││
│  │ (Claude Code,  │──────▶│                         │──────▶│  TTS    ││
│  │  OpenCode,     │ Response│  ┌─────────────────────┐ │              │ (say)   ││
│  │  Codex-CLI,     │         │  │   Plugin Registry    │ │              │         ││
│  │  Gemini-CLI)   │         │  └─────────────────────┘ │              └─────────┘│
│  └──────────────┘         │           │       │           │                             │
│                            │  ┌──────┴──────┐       │                             │
│                            │  │             │       │                             │
│                            │  │             │       │                             │
│                            │  ▼             ▼       │                             │
│                            │  ┌─────────────────────────┐ │                             │
│                            │  │     ADAPTER LAYER     │ │                             │
│                            │  │  │ ┌─────────────────────┐ │                             │
│                            │  │  │  │ Claude Code Adapter  │ │                             │
│                            │  │  │ ├─────────────────────┤ │                             │
│                            │  │  │  │ │ OpenCode Adapter    │ │                             │
│                            │  │  │  ├─────────────────────┤ │                             │
│                            │  │  │  │  │ Codex-CLI Adapter   │ │                             │
│                            │  │  │  ├─────────────────────┤ │                             │
│                            │  │  │  │  │ Gemini-CLI Adapter  │ │                             │
│                            │  │  │  └─────────────────────┘ │                             │
│                            │  │  └─────────────────────────────┘                             │
│                            │  │           │       │                             │
│                            │  │           │       │                             │
│                            │  │           │       │                             │
│                            │  │           │       │                             │
│                            │  │           │       │                             │
│                            │  │           │  │                             │
│                            │  │           │       │                             │
│                            │  │           │       │                             │
│                            │  │           │  │                             │
│                            │  │           │       │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │  │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
│                            │  │           │  │                             │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tool Integration Methods

| Tool | Extension Method | Adapter Type |
|------|-----------------|-------------|
| **Claude Code** | MCP Server (stdio/SSE) | MCP Adapter |
| **OpenCode** | Config (`openconfig.json`) + future MCP | Config Adapter |
| **Codex-CLI** | OpenAI function calling pattern | Custom Adapter |
| **Gemini-CLI** | Google tool calling spec | Custom Adapter |

---

## 📝 License

MIT

---

## 📖 MCP Tool Reference

### speak_text

Convert text to speech using macOS TTS.

**Parameters:**
- `text` (string, required): Text to speak
- `voice` (string, optional): Voice name (e.g., Samantha, Alex, Victoria)
- `rate` (number, optional): Speech rate in words per minute (50-400)
- `volume` (number, optional): Volume level (0-100)

**Example:**
```json
{
  "text": "Hello, this is a test",
  "voice": "Samantha",
  "rate": 200,
  "volume": 50
}
```

---

**PDCA Status**: Implementation Phase (In Progress) | **MVP**: Claude Code Plugin for macOS ✅
