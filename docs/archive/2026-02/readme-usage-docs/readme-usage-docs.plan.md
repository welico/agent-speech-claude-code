# Plan: README Usage Documentation Update

> **Feature**: Update README.md with comprehensive usage documentation
> **Project**: agent-speech-plugin
> **Date**: 2026-02-13
> **Status**: Plan
> **Author**: warezio

---

## 1. Overview

### 1.1 Purpose

Create comprehensive usage documentation in README.md covering:
- Installation instructions
- Configuration guide
- Usage examples for MCP (Claude Code)
- CLI commands reference
- Development/testing guide
- Troubleshooting

### 1.2 Scope

| Item | Included |
|------|----------|
| Installation (npm, local dev) | ✅ |
| MCP Server configuration | ✅ |
| Claude Code integration | ✅ |
| CLI commands (all 11 commands) | ✅ |
| Environment variables | ✅ |
| Troubleshooting common issues | ✅ |
| API documentation | ❌ (separate docs) |
| Architecture overview | ❌ (separate docs) |

---

## 2. Current State Analysis

### 2.1 Existing README Content

| Section | Status | Notes |
|---------|--------|-------|
| Project description | ✅ | Brief intro exists |
| Installation | ⚠️ | Minimal, needs expansion |
| Configuration | ❌ | Missing |
| Usage examples | ❌ | Missing |
| CLI commands | ❌ | Missing |
| Development | ⚠️ | Partial (scripts only) |
| Troubleshooting | ❌ | Missing |

### 2.2 Existing Documentation to Reference

| Document | Location | Content to Incorporate |
|----------|----------|----------------------|
| Claude Code Integration Guide | `docs/CLAUDE_CODE_INTEGRATION.md` | MCP setup instructions |
| Example Config | `docs/examples/claude-code-config.json` | Configuration examples |
| Implementation Guide | `docs/archive/2026-02/debug-env-setup/debug-env-setup.do.md` | Development setup |

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Description | Priority |
|----|-------------|----------|
| FR-01 | Installation instructions (npm, local dev) | High |
| FR-02 | MCP Server configuration for Claude Code | High |
| FR-03 | CLI commands reference (all 11 commands) | High |
| FR-04 | Environment variables documentation | High |
| FR-05 | Troubleshooting common issues | Medium |
| FR-06 | Quick start example | High |
| FR-07 | Voice configuration examples | Medium |

### 3.2 Documentation Requirements

| ID | Description | Priority |
|----|-------------|----------|
| DR-01 | Clear, step-by-step instructions | High |
| DR-02 | Code examples for all commands | High |
| DR-03 | macOS-specific notes | High |
| DR-04 | Links to existing detailed docs | Medium |
| DR-05 | Badge for build/test status | Low |

---

## 4. README Structure

### 4.1 Proposed Table of Contents

```markdown
# agent-speech-plugin

> Text-to-speech plugin for AI CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI)

## Features
## Quick Start
## Installation
  - Via npm
  - Local Development
## Configuration
  - Claude Code Setup
  - Environment Variables
  - Voice Settings
## Usage
  - MCP Server (Claude Code)
  - CLI Commands
## CLI Reference
  - Configuration Commands
  - Voice Commands
  - Utility Commands
## Development
  - Building
  - Testing
  - Debugging
## Troubleshooting
## License
```

---

## 5. Content Outline

### 5.1 Quick Start Section

```markdown
## Quick Start

### For Claude Code Users

1. Install the plugin:
   \`\`\`bash
   npm install -g agent-speech-plugin
   \`\`\`

2. Add to Claude Code config (~/.config/claude-code/config.json):
   \`\`\`json
   {
     "mcpServers": {
       "agent-speech": {
         "command": "node",
         "args": ["~/global/node_modules/agent-speech-plugin/dist/mcp-server.js"]
       }
     }
   }
   \`\`\`

3. Restart Claude Code and ask: "Say hello world"
```

### 5.2 Installation Section

- npm global install
- Local development setup (pnpm install, build)
- Verify installation

### 5.3 Configuration Section

- Claude Code MCP server config
- Environment variables (DEBUG, LOG_FILE, LOG_LEVEL)
- Config file location (~/.agent-speech/config.json)
- Voice selection (list available voices)

### 5.4 CLI Reference Section

**Configuration Commands:**
- `agent-speech enable/disable` - Toggle speech
- `agent-speech status` - Show current settings
- `agent-speech reset` - Reset to defaults
- `agent-speech init` - Initialize config

**Voice Commands:**
- `agent-speech set-voice <name>` - Set voice
- `agent-speech list-voices` - Show available voices
- `agent-speech set-rate <wpm>` - Set speech rate
- `agent-speech set-volume <0-100>` - Set volume

**Utility Commands:**
- `agent-speech toggle` - Quick enable/disable
- `agent-speech help` - Show help

### 5.5 Troubleshooting Section

| Issue | Solution |
|-------|----------|
| Plugin not loading | Check config path, rebuild |
| No speech output | Check voice name, enable flag |
| Speech too fast/slow | Adjust rate (50-400 WPM) |
| macOS 'say' not found | Verify macOS version |

---

## 6. Implementation Tasks

| ID | Task | Dependencies |
|----|------|--------------|
| T-01 | Read current README.md | - |
| T-02 | Read existing docs for content | - |
| T-03 | Draft Quick Start section | T-01, T-02 |
| T-04 | Draft Installation section | T-01 |
| T-05 | Draft Configuration section | T-02 |
| T-06 | Draft CLI Reference section | T-01 |
| T-07 | Draft Development section | T-02 |
| T-08 | Draft Troubleshooting section | T-01 |
| T-09 | Review and refine | All above |
| T-10 | Update README.md | T-09 |

---

## 7. Acceptance Criteria

- [ ] README has all sections defined in structure
- [ ] Installation instructions are clear and complete
- [ ] Claude Code integration is documented
- [ ] All 11 CLI commands are documented
- [ ] Troubleshooting covers common issues
- [ ] Code examples are accurate
- [ ] Links to existing docs work
- [ ] Markdown formatting is correct

---

## 8. Notes

### 8.1 Design Decisions

- Keep README concise; link to detailed docs
- Use code blocks for all examples
- macOS-only (no Linux/Windows compatibility notes needed)
- Focus on Claude Code (primary use case)

### 8.2 Things to Avoid

- Duplicate content from existing docs
- Overly technical language
- Unimplemented features
- Outdated command names

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-13 | Initial plan | warezio |
