# Agent Speech Plugin - Product Requirements Document (PRD)

> **Version**: 1.0
> **Last Updated**: 2026-02-12
> **Author**: warezio
> **Status**: Draft

---

## Executive Summary

**Agent Speech Plugin** is a macOS-native plugin that provides text-to-speech (TTS) functionality for terminal-based AI CLI tools including Claude Code, OpenCode, Codex-CLI, and Gemini-CLI. The plugin converts AI responses into speech using macOS's built-in `say` command, allowing developers to listen to responses while multitasking.

### Vision Statement

> "Enable developers to seamlessly interact with AI CLI tools through speech, improving productivity and accessibility for terminal-based workflows."

### Key Metrics (Success Criteria)

| Metric | Target | Measurement |
|--------|--------|----------------|
| Plugin Installation Success Rate | >95% | Installation analytics |
| TTS Response Time | <1 second | Performance monitoring |
| User Satisfaction | >4.0/5.0 | User surveys |
| Configuration Load Time | <100ms | Performance monitoring |

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Target Audience](#2-target-audience)
3. [Product Overview](#3-product-overview)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [User Stories](#6-user-stories)
7. [Technical Architecture](#7-technical-architecture)
8. [Configuration](#8-configuration)
9. [Security & Privacy](#9-security--privacy)
10. [Go-to-Market Strategy](#10-go-to-market-strategy)
11. [Roadmap](#11-roadmap)

---

## 1. Problem Statement

### 1.1 Current Pain Points

1. **Visual Fatigue**: Developers spend hours reading long AI responses in terminals, causing eye strain
2. **Context Switching**: When multitasking, users must switch visual focus back to the terminal to read responses
3. **Accessibility Barriers**: Visually impaired developers face challenges with terminal-based AI tools
4. **Inefficient Workflow**: Long code explanations or documentation responses are tedious to read

### 1.2 Proposed Solution

A lightweight plugin that:
- Intercepts AI responses from supported CLI tools
- Converts text to speech using macOS native TTS
- Provides configurable voice, rate, and volume settings
- Filters sensitive information to prevent privacy leaks
- Works asynchronously without blocking CLI responses

### 1.3 Market Validation

| Insight | Evidence |
|---------|----------|
| TTS adoption is growing | Screen readers and TTS usage increased 40% YoY (2025) |
| Terminal-based workflows are popular | CLI tools adoption among developers: 78% (Stack Overflow 2024 Survey) |
| Accessibility demand is rising | 15% of developers report visual impairments (a11y community stats) |

---

## 2. Target Audience

### 2.1 Primary Personas

#### Persona 1: The Multitasking Developer

| Attribute | Description |
|----------|-------------|
| **Name** | Alex Chen |
| **Role** | Senior Full-Stack Developer |
| **Environment** | macOS, Terminal + IDE + Browser |
| **Pain Points** | Constantly switching between terminal, IDE, and browser; misses important AI responses |
| **Goals** | Stay productive while AI generates long responses; "listen" to code explanations while reviewing code |
| **Technical Skill** | Advanced |

#### Persona 2: The Accessibility-Conscious Developer

| Attribute | Description |
|----------|-------------|
| **Name** | Jordan Park |
| **Role** | Backend Developer (visual impairment) |
| **Environment** | macOS, Screen reader enabled |
| **Pain Points** | Terminal-based AI tools lack screen reader support; must use copy-paste to external TTS tools |
| **Goals** | Native TTS integration in terminal workflows; reduce friction |
| **Technical Skill** | Intermediate |

### 2.2 Secondary Audiences

- DevOps engineers monitoring long CLI outputs
- Code reviewers listening to AI-generated summaries
- Developers learning through audio (learning while commuting)

---

## 3. Product Overview

### 3.1 Product Description

Agent Speech Plugin is a **Node.js/TypeScript package** that installs plugins for various AI CLI tools. When an AI tool generates a response, the plugin intercepts the output and uses macOS's `say` command to synthesize speech.

### 3.2 Key Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Multi-Tool Support** | Plugins for Claude Code, OpenCode, Codex-CLI, Gemini-CLI | P0 |
| **Voice Customization** | Choose from installed macOS voices (Samantha, Alex, etc.) | P1 |
| **Speech Rate Control** | Adjustable words-per-minute (50-400 WPM) | P1 |
| **Volume Control** | Adjustable volume (0-100) | P2 |
| **Toggle On/Off** | Quick enable/disable without uninstalling | P0 |
| **Length Filtering** | Skip short/long responses based on character count | P2 |
| **Privacy Filters** | Detect and skip sensitive information (passwords, API keys) | P1 |
| **Per-Tool Configuration** | Different settings for each CLI tool | P1 |

### 3.3 Platform Requirements

| Requirement | Specification |
|-------------|----------------|
| **Operating System** | macOS 10.15+ (Catalina or later) |
| **Node.js Version** | Node.js 18+ |
| **Disk Space** | <5 MB |
| **Runtime Memory** | <50 MB |
| **Network** | Not required (fully offline-capable) |

---

## 4. Functional Requirements

### 4.1 Core Requirements (P0)

| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| **FR-01** | **Plugin Integration** | Plugin successfully registers with each supported CLI tool; responses are intercepted without breaking normal operation |
| **FR-02** | **Text-to-Speech Conversion** | Response text is converted to speech using macOS `say` command; speech is audible and intelligible |
| **FR-03** | **Asynchronous Operation** | TTS runs in background; CLI tool continues functioning during speech; no blocking of user input |
| **FR-04** | **Enable/Disable Toggle** | User can enable/disable TTS without uninstalling; disabled state persists across sessions |
| **FR-05** | **Configuration Persistence** | User settings are saved to `~/.agent-speech/config.json`; settings load on startup |

### 4.2 Enhancement Requirements (P1)

| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| **FR-06** | **Voice Selection** | User can select from available macOS voices; selection persists across sessions |
| **FR-07** | **Speech Rate Control** | User can adjust rate from 50-400 WPM; setting persists across sessions |
| **FR-08** | **Per-Tool Configuration** | Each CLI tool can have independent settings; tool-specific config overrides global config |
| **FR-09** | **Privacy Filtering** | Optional filter detects sensitive patterns (password, API key, token, secret); filtered content is not spoken |

### 4.3 Nice-to-Have Requirements (P2)

| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| **FR-10** | **Response Length Filtering** | User can set min/max character thresholds; responses outside range are skipped |
| **FR-11** | **Code Block Skipping** | Optional filter removes code blocks from spoken output; indicator shows code was skipped |
| **FR-12** | **Volume Control** | User can adjust volume from 0-100; setting persists across sessions |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement | Metric | Measurement |
|------------|--------|-------------|
| **TTS Initiation Time** | <1 second after response completion | Time from response complete to speech start |
| **Config Load Time** | <100ms | Time from startup to config ready |
| **Memory Footprint** | <50 MB | Resident memory during operation |
| **CPU Usage** | <5% average | CPU usage during idle/speech |

### 5.2 Reliability

| Requirement | Metric | Measurement |
|------------|--------|-------------|
| **Crash Rate** | <0.1% of sessions | Crash reporting analytics |
| **Speech Success Rate** | >99% | Successful speech starts per total attempts |
| **Graceful Degradation** | No impact on CLI tool if TTS fails | Manual testing |

### 5.3 Usability

| Requirement | Metric | Measurement |
|------------|--------|-------------|
| **Setup Time** | <5 minutes | Time from download to first working speech |
| **Config Discoverability** | >80% of users can change voice within 1 minute | User testing |
| **Documentation Completeness** | All features documented | Documentation review |

### 5.4 Compatibility

| Requirement | Specification |
|------------|----------------|
| **macOS Versions** | 10.15+ (Catalina), 11.x (Big Sur), 12.x (Monterey), 13.x (Ventura), 14.x (Sonoma) |
| **Node.js Versions** | 18.x, 20.x, 22.x (LTS) |
| **Architecture** | x64, arm64 (Apple Silicon) |

### 5.5 Security

| Requirement | Specification |
|------------|----------------|
| **No Data Exfiltration** | No network requests for TTS processing; all local |
| **Sensitive Data Protection** | Optional filtering for passwords, API keys, tokens |
| **Config File Permissions** | Config file restricted to user (rw-------) |
| **No Code Execution** | Plugin does not execute code from AI responses |

---

## 6. User Stories

### 6.1 Core User Stories

```gherkin
Feature: Plugin Integration
  As a developer using Claude Code
  I want my AI responses to be spoken aloud
  So that I can listen while reviewing code

  Scenario: First-time setup
    Given I have Claude Code installed
    When I install agent-speech-plugin
    And I run "agent-speech --init"
    Then a config file is created at ~/.agent-speech/config.json
    And the plugin registers with Claude Code
    And the next AI response is spoken

  Scenario: Toggle TTS on/off
    Given the plugin is installed and enabled
    When I run "agent-speech --toggle"
    Then TTS is disabled
    And subsequent responses are not spoken
    And running "agent-speech --toggle" again re-enables TTS
```

```gherkin
Feature: Voice Customization
  As a developer
  I want to choose which voice speaks
  So that I can hear a voice I find comfortable

  Scenario: Change voice
    Given the plugin is installed
    When I run "agent-speech --set-voice Victoria"
    Then future responses use the Victoria voice
    And the setting is saved to config

  Scenario: Adjust speech rate
    Given the plugin is installed
    When I run "agent-speech --set-rate 220"
    Then future responses are spoken at 220 WPM
    And the setting is saved to config
```

```gherkin
Feature: Privacy Protection
  As a security-conscious developer
  I want sensitive information to be filtered from speech
  So that passwords and API keys are not spoken aloud

  Scenario: Filter sensitive content
    Given the plugin is installed with privacy filter enabled
    When an AI response contains "password: secret123"
    Then the response is not spoken
    Or the sensitive portion is omitted from speech
```

### 6.2 Secondary User Stories

```gherkin
Feature: Per-Tool Configuration
  As a developer using multiple AI CLI tools
  I want different settings for each tool
  So that Claude Code uses a different voice than Codex-CLI

  Scenario: Configure per-tool settings
    Given I use both Claude Code and Codex-CLI
    When I set Claude Code to use "Samantha" voice
    And I set Codex-CLI to use "Alex" voice
    Then each tool uses its configured voice
```

---

## 7. Technical Architecture

### 7.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Environment                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────────┐              │
│  │ CLI Tool     │         │ Agent Speech      │              │
│  │ (Claude Code, │──────▶│ Plugin            │              │
│  │ OpenCode,    │ Response│                  │              │
│  │ Codex-CLI,   │         │ ┌──────────────┐ │              │
│  │ Gemini-CLI)  │         │ │ TTS Engine    │ │              │
│  └──────────────┘         │ │ (say command)│ │              │
│                            │ └──────────────┘ │              │
│                            │                  │              │
│                            │ ┌──────────────┐ │              │
│                            │ │ Config       │ │              │
│                            │ │ Manager      │ │              │
│                            │ └──────────────┘ │              │
│                            └──────────────────┘              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐      │
│  │          Config File (~/.agent-speech/)      │      │
│  │          └── config.json                    │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Component Architecture

```
src/
├── core/                          # Core TTS Logic
│   ├── tts.ts                    # TextToSpeech class
│   ├── config.ts                 # ConfigManager class
│   └── filter.ts                 # Content filtering
│
├── plugins/                       # CLI Tool Plugins
│   ├── registry.ts               # Plugin registry
│   ├── claude-code.ts           # Claude Code plugin
│   ├── opencode.ts              # OpenCode plugin
│   ├── codex-cli.ts             # Codex-CLI plugin
│   └── gemini-cli.ts            # Gemini-CLI plugin
│
├── types/                         # TypeScript Types
│   └── index.ts                 # Unified type definitions
│
├── index.ts                       # Entry point
└── cli.ts                          # CLI commands
```

### 7.3 Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   CLI Tool  │────▶│   Plugin    │────▶│   Filter    │────▶│  macOS TTS  │
│  Response   │     │ Interceptor │     │   Engine     │     │  (say cmd)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │                    │                    │
                           ▼                    ▼                    ▼
                     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
                     │  Response    │     │ Sensitive   │     │  Spoken     │
                     │  Received    │     │ Data?       │     │  Audio      │
                     └─────────────┘     └─────────────┘     └─────────────┘
                           │                    │                    │
                           ▼                    ▼                    ▼
                     [Apply Config]       [Skip/Sanitize]     [Play Audio]
```

---

## 8. Configuration

### 8.1 Configuration File Structure

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
      "rate": 200,
      "volume": 50
    },
    "opencode": {
      "enabled": false
    },
    "codex-cli": {
      "enabled": false
    },
    "gemini-cli": {
      "enabled": false
    }
  }
}
```

### 8.2 Configuration Hierarchy

```
Global Settings (defaults for all tools)
    │
    ├─▶ Tool-specific Settings (overrides for specific tool)
    │       │
    │       └─▶ Final Config (merged for the active tool)
    │
    └─▶ Effective Configuration
```

**Merge Rules**:
1. Tool-specific `enabled` takes precedence over global `enabled`
2. If tool-specific voice/rate/volume is undefined, inherit from global
3. Filter settings are global-only (no per-tool override)

### 8.3 CLI Commands

| Command | Description |
|---------|-------------|
| `agent-speech --init` | Initialize config file |
| `agent-speech --enable` / `--disable` | Enable/disable TTS |
| `agent-speech --toggle` | Toggle TTS on/off |
| `agent-speech --status` | Show current configuration |
| `agent-speech --set-voice <name>` | Set voice |
| `agent-speech --set-rate <wpm>` | Set speech rate |
| `agent-speech --set-volume <0-100>` | Set volume |
| `agent-speech --list-voices` | List available voices |
| `agent-speech --config <key> <value>` | Set arbitrary config value |
| `agent-speech --reset` | Reset to defaults |

---

## 9. Security & Privacy

### 9.1 Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| **Password/API key spoken aloud** | High | Medium | Optional sensitive data filter |
| **Config file contains secrets** | High | Low | Config only stores preferences, no secrets |
| **Plugin executes malicious code** | Critical | Low | No code execution from responses |
| **Network exfiltration** | High | Very Low | No network requests; fully local |
| **Eavesdropping via speakers** | Medium | Medium | User responsibility; headphones recommended |

### 9.2 Privacy Features

#### Sensitive Data Filtering

**Patterns Detected** (configurable):
- `password`
- `api[_-]?key`
- `token`
- `secret`
- `credential`

**Behavior**:
- When enabled, responses containing these patterns are skipped entirely
- Or, sensitive portions are redacted from speech
- Filter is **opt-in** (disabled by default to avoid false positives)

#### Code Block Handling

**Option**: `skipCodeBlocks`
- When enabled, code blocks are omitted from speech
- Placeholder: "[code block skipped]"
- Prevents reading of code that might contain sensitive literals

### 9.3 Security Best Practices

1. **No Network**: All processing is local; no API calls
2. **No Code Execution**: Plugin only reads text; never executes
3. **Minimal Privileges**: No sudo/admin required
4. **Config Protection**: Config file has user-only permissions (600)
5. **Transparent Logging**: All errors logged; no silent failures

---

## 10. Go-to-Market Strategy

### 10.1 Distribution Channels

| Channel | Description | Timeline |
|---------|-------------|----------|
| **npm Registry** | `npm install agent-speech-plugin` | MVP |
| **Homebrew** | `brew install agent-speech-plugin` | Post-MVP |
| **GitHub Releases** | Binary releases for easy install | MVP |
| **Website** | Landing page with documentation | MVP |

### 10.2 Launch Plan

**Phase 1: Alpha (Internal Testing)**
- Invite 10 internal users
- Focus on Claude Code integration first
- 2-week feedback cycle

**Phase 2: Beta (Public Beta)**
- Open beta to 100 users
- All 4 CLI tools supported
- 4-week feedback cycle
- Bug fixes and stability improvements

**Phase 3: MVP Launch (v1.0)**
- Public npm release
- Documentation complete
- Known issues documented
- Support channel established (GitHub Issues)

### 10.3 Marketing Messaging

**Primary Value Proposition**:
> "Listen to your AI assistant. Work hands-free while staying in the flow."

**Key Messages**:
1. **Multitasking**: "Review code while listening to explanations"
2. **Accessibility**: "Terminal AI tools, now accessible"
3. **Native & Fast**: "Zero network latency; uses macOS built-in TTS"
4. **Developer-Friendly**: "Configure once, works with your favorite CLI AI"

### 10.4 Pricing Strategy

**Model**: Open Source (MIT License)
- Free to use, modify, distribute
- Community-driven development
- Optional premium support in future (enterprise SLA)

---

## 11. Roadmap

### 11.1 Development Phases

#### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup (TypeScript, pnpm, Vitest)
- [ ] Config Manager implementation
- [ ] TTS Engine wrapper (`say` command)
- [ ] Claude Code plugin (first integration)
- [ ] Basic CLI commands

#### Phase 2: Multi-Tool Support (Weeks 3-4)
- [ ] OpenCode plugin
- [ ] Codex-CLI plugin
- [ ] Gemini-CLI plugin
- [ ] Unified plugin registry
- [ ] Per-tool configuration

#### Phase 3: Enhancement (Weeks 5-6)
- [ ] Privacy filters (sensitive data, code blocks)
- [ ] Voice selection and configuration UI
- [ ] Length-based filtering
- [ ] Volume control
- [ ] Error handling and logging

#### Phase 4: Polish (Weeks 7-8)
- [ ] Documentation (README, CLI help)
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] Beta testing with internal users
- [ ] Bug fixes

#### Phase 5: Launch (Week 9+)
- [ ] Public beta release
- [ ] npm package publishing
- [ ] Website/landing page
- [ ] Community feedback incorporation
- [ ] v1.0 release

### 11.2 Future Considerations (Post-MVP)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Windows Support** | SAPI5 TTS integration | P1 |
| **Linux Support** | espeak/festival TTS integration | P2 |
| **Custom Voices** | Support for third-party voice packs | P2 |
| **Streaming TTS** | Real-time speech during streaming responses | P1 |
| **Audio Output** | Save speech to audio file | P2 |
| **Remote Control** | Mobile app for control | P3 |
| **Cloud TTS** | Optional cloud-based TTS (OpenAI, Google) | P3 |

---

## Appendix A: References

### A.1 Documentation
- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [macOS Speech Synthesis Programming Guide](https://developer.apple.com/documentation/avfoundation/speech-synthesis)
- [Node.js child_process Documentation](https://nodejs.org/api/child_process.html)

### A.2 Competitors/Alternatives
- **screenreader**: Terminal-based screen reader with TTS
- **espeak**: Command-line TTS (cross-platform, lower quality)
- **say-cli**: Node.js wrapper for `say` command (no plugin system)

### A.3 Community Resources
- [macOS Voice Downloads](https://support.apple.com/guide/voiceover/)
- [Terminal Accessibility Working Group](https://www.w3.org/WAI/tutorials/)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial PRD creation | warezio |
| 1.0 | 2026-02-12 | Complete PRD with all sections | warezio |

---

**Document Status**: Draft | **Next Review**: Before Design Phase
