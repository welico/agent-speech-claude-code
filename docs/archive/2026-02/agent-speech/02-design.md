---
template: design
version: 1.2
description: PDCA Design phase document for Agent Speech Plugin
variables:
  - feature: Agent Speech Plugin
  - date: 2026-02-12
  - author: welico
  - project: agent-speech
  - version: 0.1.0
---

# Agent Speech Plugin Design Document

> **Summary**: macOS-native TTS plugin for terminal AI CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI) using Core + Adapter architecture
>
> **Project**: agent-speech
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-12
> **Status**: Draft
> **Planning Doc**: [agent-speech.plan.md](../../01-plan/features/agent-speech.plan.md)

### Pipeline References (if applicable)

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | [Schema Definition](../../01-plan/schema.md) | N/A |
| Phase 2 | [Coding Conventions](../../01-plan/conventions.md) | N/A |

> **Note**: Starter level project - no database, no web UI.

---

## 1. Overview

### 1.1 Design Goals

1. **MCP-First Architecture**: Use MCP (Model Context Protocol) as primary abstraction since Claude Code/OpenCode already support it and OpenAI/Google are adding MCP compatibility
2. **Core + Adapter Separation**: Core logic (business) separate from adapters (tool-specific setup/registration)
3. **Extensible**: Easy to add new CLI tools by adding new adapters
4. **Minimal Dependencies**: Use only Node.js built-in modules where possible
5. **Non-Blocking**: TTS must run asynchronously without interfering with CLI tool operation

### 1.2 Design Principles

- **Shared Core**: Common business logic (TTS, config, filtering) shared across all tools
- **Adapter Pattern**: Each CLI tool has its own adapter for registration/setup mechanism
- **MCP Abstraction**: MCP server as first-tier interface where applicable
- **Dependency Inversion**: Core depends on abstractions; adapters depend on core
- **Open/Closed**: Open for extension (new adapters) but closed for modification (core unchanged)

---

## 2. Architecture

### 2.1 Core + Adapter Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         User Environment                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌───────────────┐         ┌─────────────────────────┐              ┌─────────┐│
│  │   CLI Tool     │         │   Agent Speech Plugin  │              │ macOS   ││
│  │ (Claude Code,  │──────▶│                         │──────▶│  TTS    ││
│  │  OpenCode,     │ Request │                         │              │ (say)   ││
│  │  Codex-CLI,    │         │  ┌─────────────────────┐ │              │         ││
│  │  Gemini-CLI)  │         │  │   MCP Server          │ │              └─────────┘│
│  └───────────────┘         │  │  (First-tier Abstraction)│ │                             │
│                            │  └─────────────────────────┘ │                             │
│                            │           │       │           │                             │
│                            │    ┌──────┴──────┐       │                             │
│                            │    │             │       │                             │
│                            │    ▼             ▼       │                             │
│                            │  ┌─────────────────────────┐ │                             │
│                            │  │     ADAPTER LAYER     │ │                             │
│                            │  │  ┌─────────────────────┐ │ │                             │
│                            │  │  │ Claude Code Adapter  │ │ │                             │
│                            │  │  ├─────────────────────┤ │ │                             │
│                            │  │  │ OpenCode Adapter    │ │ │                             │
│                            │  │  ├─────────────────────┤ │ │                             │
│                            │  │  │ Codex-CLI Adapter   │ │ │                             │
│                            │  │  ├─────────────────────┤ │ │                             │
│                            │  │  │ Gemini-CLI Adapter  │ │ │                             │
│                            │  │  └─────────────────────┘ │ │                             │
│                            │  └─────────────────────────┘ │                             │
│                            │           │       │           │                             │
│                            │    ┌──────┴──────────────┘       │                             │
│                            │    │                      │                             │
│                            │    ▼                      │                             │
│                            │  ┌─────────────────────────────────┐ │                             │
│                            │  │       CORE LAYER             │ │                             │
│                            │  │  ┌─────────────────────┐     │ │                             │
│                            │  │  │ TTS Engine         │     │ │                             │
│                            │  │  ├─────────────────────┤     │ │                             │
│                            │  │  │ Config Manager      │     │ │                             │
│                            │  │  ├─────────────────────┤     │ │                             │
│                            │  │  │ Content Filter      │     │ │                             │
│                            │  │  └─────────────────────┘     │ │                             │
│                            │  └─────────────────────────────────┘ │                             │
│                            └─────────────────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 CLI Tool Integration Methods

| Tool | Extension Method | Adapter Type | Notes |
|------|-----------------|-------------|-------|
| **Claude Code** | MCP Server (stdio/SSE) | MCP Adapter | Uses `claude_desktop_config.json` or `.mcp.json` for registration |
| **OpenCode** | Config (`openconfig.json`) + future MCP | Config Adapter | Go-based, will add MCP support later |
| **Codex-CLI** | OpenAI function calling pattern | Custom Adapter | New ecosystem, different extension mechanism |
| **Gemini-CLI** | Google tool calling spec | Custom Adapter | Different config and extension methods |

### 2.3 MCP-First Strategy

Since MCP (Model Context Protocol) has the highest commonality potential:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MCP as First-Tier Abstraction              │
├─────────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐       │
│  │ Claude Code  │      │  OpenCode    │      │  Future      │       │
│  │ (MCP Native) │      │ (MCP Soon)  │      │ (OpenAI/    │       │
│  │              │      │             │      │  Google MCP)  │       │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘       │
│         │                    │                    │             │
│         └────────────┬───────────┴──────────────────┘             │
│                      │                                        │
│                      ▼                                        │
│         ┌─────────────────────────────────────────────┐       │
│         │         MCP Server (Node.js)              │       │
│         │  ┌───────────────────────────────────┐   │       │
│         │  │ MCP Tool: "speak_text"            │   │       │
│         │  │ - inputSchema: text, voice, rate   │   │       │
│         │  └───────────────────────────────────┘   │       │
│         └─────────────────────────────────────────────┘       │
│                      │                                        │
│                      ▼                                        │
│         ┌─────────────────────────────────────────────┐       │
│         │            CORE LAYER (Shared)          │       │
│         │  ┌───────────────────────────────────┐   │       │
│         │  │ TTS Engine (say command wrapper) │   │       │
│         │  ├───────────────────────────────────┤   │       │
│         │  │ Config Manager (JSON file)      │   │       │
│         │  ├───────────────────────────────────┤   │       │
│         │  │ Content Filter (privacy, etc.)   │   │       │
│         │  └───────────────────────────────────┘   │       │
│         └─────────────────────────────────────────────┘       │
│                                                           │
│  For non-MCP tools (Codex-CLI, Gemini-CLI):                │
│  ┌─────────────────────────────────────────────┐       │
│  │         Custom Adapter                 │       │
│  │  (Tool-specific interception logic)     │       │
│  └─────────────────────────────────────────────┘       │
│                      │                                        │
│                      ▼                                        │
│              [Calls Core Layer directly]          │
└───────────────────────────────────────────────────────┘
```

### 2.4 Data Flow

```
CLI Tool Request (MCP or Native)
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Adapter Receives Request                                     │
│    - MCP adapter: receives MCP tool call                      │
│    - Native adapter: intercepts CLI output                    │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Core Layer Processing                                       │
│    - Extract text from request                                  │
│    - Get tool-specific config (merged with global)             │
│    - Check if TTS enabled for this tool                        │
└─────────────────────────────────────────────────────────────────┘
       │
       ├── Enabled? ──No──▶ Return success (no speech)
       │
       └── Yes ───────────────▶
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Content Filtering (Core Layer)                            │
│    - Check minimum/maximum length                               │
│    - Filter sensitive information (if enabled)                  │
│    - Skip code blocks (if enabled)                            │
└─────────────────────────────────────────────────────────────────┘
       │
       ├── Filtered? ──Yes──▶ Return success (no speech)
       │
       └── No ─────────────────▶
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. TTS Execution (Async)                                      │
│    - Chunk text if too long (max 1000 chars)                    │
│    - Spawn `say` command with voice, rate, volume              │
│    - Run in background process                                 │
│    - Return immediately (async)                                  │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
   Audio Output (spoken by macOS TTS)
```

### 2.5 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Claude Code Adapter | Core Layer, MCP SDK | MCP server implementation for Claude Code |
| OpenCode Adapter | Core Layer | Config-based setup (future MCP) |
| Codex-CLI Adapter | Core Layer | OpenAI function calling integration |
| Gemini-CLI Adapter | Core Layer | Google tool calling integration |
| MCP Server | Core Layer | Exposes `speak_text` tool to MCP clients |
| TTS Engine | Config Manager, Content Filter | Core speech synthesis logic |
| Config Manager | None (file I/O) | Load/save user settings |
| Content Filter | None | Text filtering utilities |

---

## 3. Data Model

### 3.1 MCP Tool Schema

```typescript
/**
 * MCP Tool definition for text-to-speech
 */
export interface SpeakTextTool {
  name: "speak_text";
  description: "Convert text to speech using macOS TTS";
  inputSchema: {
    type: "object";
    properties: {
      text: {
        type: "string";
        description: "Text to speak";
      };
      voice?: {
        type: "string";
        description: "Voice name (e.g., Samantha, Alex)";
        default: "Samantha";
      };
      rate?: {
        type: "number";
        description: "Speech rate in words per minute (50-400)";
        default: 200;
      };
      volume?: {
        type: "number";
        description: "Volume level (0-100)";
        default: 50;
      };
    };
    required: ["text"];
  };
}
```

### 3.2 Core Type Definitions

```typescript
/**
 * Filter configuration for content filtering
 */
export interface FilterConfig {
  /** Filter out sensitive information (passwords, API keys, etc.) */
  sensitive: boolean;
  /** Skip code blocks when speaking */
  skipCodeBlocks: boolean;
  /** Skip command outputs */
  skipCommands: boolean;
}

/**
 * Text-to-Speech configuration
 */
export interface TTSConfig {
  /** Enable/disable TTS */
  enabled: boolean;
  /** macOS voice name (e.g., "Samantha", "Alex") */
  voice: string;
  /** Speech rate in words per minute (50-400) */
  rate: number;
  /** Volume level (0-100) */
  volume: number;
  /** Minimum response length to speak (0 = no minimum) */
  minLength: number;
  /** Maximum response length to speak (0 = no maximum) */
  maxLength: number;
  /** Content filtering options */
  filters: FilterConfig;
}

/**
 * Tool-specific configuration (overrides global settings)
 */
export interface ToolConfig {
  /** Enable/disable TTS for this tool (overrides global) */
  enabled?: boolean;
  /** Voice name for this tool (overrides global) */
  voice?: string;
  /** Speech rate for this tool (overrides global) */
  rate?: number;
  /** Volume level for this tool (overrides global) */
  volume?: number;
}

/**
 * Complete application configuration
 */
export interface AppConfig {
  /** Config version for migration */
  version: string;
  /** Global settings (defaults for all tools) */
  global: TTSConfig;
  /** Per-tool settings */
  tools: {
    [toolName: string]: ToolConfig;
  };
}

/**
 * Result of content filtering
 */
export interface FilterResult {
  /** Whether content should be spoken */
  shouldSpeak: boolean;
  /** Filtered/sanitized text */
  text: string;
  /** Reason for filtering (if not speaking) */
  reason?: string;
}
```

### 3.3 Configuration File Schema

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

---

## 4. Component Architecture

### 4.1 Core Layer Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **TTS Engine** | `src/core/tts.ts` | Text-to-speech using macOS `say` command |
| **Config Manager** | `src/core/config.ts` | Load/save user settings from JSON file |
| **Content Filter** | `src/core/filter.ts` | Filter sensitive info, code blocks |
| **Types** | `src/types/index.ts` | Shared type definitions |

### 4.2 Adapter Layer Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **Claude Code Adapter** | `src/adapters/claude-code.ts` | MCP server for Claude Code integration |
| **OpenCode Adapter** | `src/adapters/opencode.ts` | Config-based setup for OpenCode |
| **Codex-CLI Adapter** | `src/adapters/codex-cli.ts` | OpenAI function calling integration |
| **Gemini-CLI Adapter** | `src/adapters/gemini-cli.ts` | Google tool calling integration |
| **Adapter Registry** | `src/adapters/registry.ts` | Register and manage adapters |

### 4.3 Infrastructure Layer Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **MCP Server** | `src/infrastructure/mcp-server.ts` | MCP server implementation |
| **Say Command** | `src/infrastructure/say.ts` | macOS `say` command wrapper |
| **File System** | `src/infrastructure/fs.ts` | File system operations |

### 4.4 CLI Layer Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| **CLI Parser** | `src/cli.ts` | Parse command-line arguments |
| **CLI Commands** | `src/commands/` | Execute CLI commands |
| **Output Formatter** | `src/utils/format.ts` | Format console output |

---

## 5. API Specification

### 5.1 MCP Tool API

**Tool Name**: `speak_text`

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "text": {
      "type": "string",
      "description": "Text to speak"
    },
    "voice": {
      "type": "string",
      "description": "Voice name (default: from config)"
    },
    "rate": {
      "type": "number",
      "description": "Speech rate WPM (default: from config)"
    },
    "volume": {
      "type": "number",
      "description": "Volume 0-100 (default: from config)"
    }
  },
  "required": ["text"]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Speech started"
}
```

### 5.2 Core Layer API

```typescript
/**
 * TTS Engine
 */
export class TextToSpeech {
  speak(text: string, config: TTSConfig): Promise<void>;
  stop(): void;
  getAvailableVoices(): Promise<string[]>;
  isSpeaking(): boolean;
}

/**
 * Configuration Manager
 */
export class ConfigManager {
  init(): Promise<void>;
  save(): Promise<void>;
  getGlobal(): TTSConfig;
  getToolConfig(toolName: string): TTSConfig;
  setGlobal<K extends keyof TTSConfig>(key: K, value: TTSConfig[K]): void;
  setToolConfig(toolName: string, config: ToolConfig): void;
  validate(): boolean;
}

/**
 * Content Filter
 */
export class ContentFilter {
  filter(text: string, config: TTSConfig): FilterResult;
  detectSensitive(text: string): boolean;
  removeCodeBlocks(text: string): string;
}
```

### 5.3 Adapter Interface

```typescript
/**
 * Base interface for all CLI tool adapters
 */
export interface CLIAdapter {
  /** Adapter identifier */
  name: string;

  /**
   * Initialize the adapter
   */
  init(): Promise<void>;

  /**
   * Start the adapter (begin listening for requests)
   */
  start(): Promise<void>;

  /**
   * Stop the adapter
   */
  stop(): Promise<void>;

  /**
   * Check if adapter is enabled
   */
  isEnabled(): boolean;
}
```

### 5.4 CLI Commands

```bash
agent-speech <command> [options]

Commands:
  init              Initialize configuration
  enable [tool]     Enable TTS for tool
  disable [tool]    Disable TTS for tool
  toggle [tool]     Toggle TTS on/off
  status            Show configuration status
  set-voice <name>  Set voice
  set-rate <wpm>    Set speech rate
  set-volume <0-100> Set volume
  list-voices       List available voices
  reset             Reset to defaults
  help              Show help
```

---

## 6. Adapter Implementation Details

### 6.1 Claude Code Adapter (MCP)

**Integration Method**: MCP Server (stdio/SSE)

**Registration**: Via `.mcp.json` or `claude_desktop_config.json`

```typescript
class ClaudeCodeAdapter implements CLIAdapter {
  name = 'claude-code';

  async init(): Promise<void> {
    // Setup MCP server with stdio transport
    // Register "speak_text" tool
  }

  async start(): Promise<void> {
    // Start MCP server listening
  }

  // MCP server handles tool calls and routes to Core Layer
}
```

**MCP Config** (`~/.claude/mcp.json`):
```json
{
  "mcpServers": {
    "agent-speech": {
      "command": "node",
      "args": ["/path/to/agent-speech/dist/mcp-server.js"]
    }
  }
}
```

### 6.2 OpenCode Adapter (Config)

**Integration Method**: Config file-based (future MCP)

**Registration**: Via `openconfig.json`

```typescript
class OpenCodeAdapter implements CLIAdapter {
  name = 'opencode';

  async init(): Promise<void> {
    // Setup OpenCode-specific config
    // Future: MCP server when OpenCode adds support
  }
}
```

**Config** (`~/.openconfig.json`):
```json
{
  "extensions": {
    "agent-speech": {
      "enabled": true,
      "command": "node /path/to/adapter.js"
    }
  }
}
```

### 6.3 Codex-CLI Adapter (Custom)

**Integration Method**: OpenAI function calling interception

```typescript
class CodexCLIAdapter implements CLIAdapter {
  name = 'codex-cli';

  async init(): Promise<void> {
    // Hook into OpenAI function calling
    // Intercept responses and route to Core Layer
  }
}
```

### 6.4 Gemini-CLI Adapter (Custom)

**Integration Method**: Google tool calling interception

```typescript
class GeminiCLIAdapter implements CLIAdapter {
  name = 'gemini-cli';

  async init(): Promise<void> {
    // Hook into Google tool calling
    // Intercept responses and route to Core Layer
  }
}
```

---

## 7. File Structure

```
src/
├── core/                      # Core Layer (shared business logic)
│   ├── tts.ts               # TextToSpeech class
│   ├── config.ts            # ConfigManager class
│   └── filter.ts            # ContentFilter class
│
├── adapters/                  # Adapter Layer (tool-specific setup)
│   ├── registry.ts          # AdapterRegistry class
│   ├── claude-code.ts       # ClaudeCodeAdapter (MCP)
│   ├── opencode.ts          # OpenCodeAdapter (Config)
│   ├── codex-cli.ts         # CodexCLIAdapter (Custom)
│   └── gemini-cli.ts        # GeminiCLIAdapter (Custom)
│
├── infrastructure/            # Infrastructure Layer
│   ├── mcp-server.ts        # MCP server implementation
│   ├── say.ts               # macOS say command wrapper
│   └── fs.ts                # File system operations
│
├── types/                    # Domain Layer (shared types)
│   └── index.ts             # All type definitions
│
├── commands/                 # Presentation Layer (CLI)
│   ├── index.ts             # Command exports
│   ├── init.ts              # init command
│   ├── enable.ts            # enable command
│   ├── disable.ts           # disable command
│   ├── toggle.ts            # toggle command
│   ├── status.ts            # status command
│   ├── set-voice.ts         # set-voice command
│   ├── set-rate.ts          # set-rate command
│   ├── set-volume.ts        # set-volume command
│   ├── list-voices.ts       # list-voices command
│   └── reset.ts             # reset command
│
├── utils/
│   └── format.ts            # Output formatting
│
├── cli.ts                    # CLI entry point
└── index.ts                  # Package entry point

config/
├── config.example.json       # Example configuration
└── config.schema.json        # JSON schema

tests/
├── unit/
│   ├── tts.test.ts
│   ├── config.test.ts
│   └── filter.test.ts
└── integration/
    ├── mcp-server.test.ts
    └── cli-commands.test.ts
```

---

## 8. Implementation Order

1. **Setup Project**
   - Initialize `package.json` with dependencies
   - Create `tsconfig.json`
   - Setup Vitest

2. **Implement Types** (`src/types/index.ts`)
   - All interface definitions
   - Type exports

3. **Implement Infrastructure** (`src/infrastructure/`)
   - `say.ts` - macOS `say` command wrapper
   - `fs.ts` - File system operations
   - `mcp-server.ts` - MCP server implementation

4. **Implement Core** (`src/core/`)
   - `filter.ts` - Content filtering logic
   - `config.ts` - Configuration management
   - `tts.ts` - Main TTS engine

5. **Implement Adapters** (`src/adapters/`)
   - `registry.ts` - Adapter registry
   - `claude-code.ts` - First adapter (MCP-based)

6. **Implement CLI** (`src/` and `src/commands/`)
   - `cli.ts` - Main entry point
   - All command files

7. **Testing**
   - Unit tests for each module
   - Integration tests

8. **Documentation**
   - README.md
   - CLI help text

---

## 9. Migration Strategy

### 9.1 From Direct Integration to MCP

| Phase | Description |
|-------|-------------|
| **Phase 1** | Implement MCP server with `speak_text` tool |
| **Phase 2** | Create Claude Code adapter using MCP |
| **Phase 3** | Create OpenCode adapter (config-based, MCP future) |
| **Phase 4** | Create custom adapters for Codex-CLI, Gemini-CLI |
| **Phase 5** | Migrate custom adapters to MCP when available |

### 9.2 Monorepo Considerations

For managing core + adapters together:

```
agent-speech-monorepo/
├── packages/
│   ├── core/              # Shared TTS logic, types, config
│   ├── adapter-mcp/       # MCP server implementation
│   ├── adapter-claude/   # Claude Code specific
│   ├── adapter-opencode/  # OpenCode specific
│   └── adapter-cli/       # CLI entry point
└── nx.json / turbo.json   # Monorepo config
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-12 | Initial design document (Core + Adapter architecture) | welico |
