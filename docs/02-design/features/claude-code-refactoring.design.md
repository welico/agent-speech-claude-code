# Claude Code-Specific Refactoring Design Document

> **Summary**: Detailed design for simplifying agent-speech-claude-code architecture by removing multi-CLI abstraction and making it Claude Code-specific
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-20
> **Status**: Draft
> **Planning Doc**: [claude-code-refactoring.plan.md](../01-plan/features/claude-code-refactoring.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- **Simplicity**: Remove unnecessary abstraction layers that only support one tool
- **Clarity**: Make codebase intent explicit (Claude Code plugin, not generic multi-CLI)
- **Maintainability**: Reduce cognitive load by eliminating unused code paths
- **Performance**: Remove adapter registry overhead for single-tool use

### 1.2 Design Principles

- **YAGNI** (You Aren't Gonna Need It): Remove unimplemented multi-CLI support
- **Single Responsibility**: Each file/module has one clear purpose
- **Explicit over Implicit**: Direct Claude Code integration vs generic adapter pattern
- **Backward Compatibility**: Preserve user configurations during migration

---

## 2. Architecture

### 2.1 Component Diagram

**Current Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code Plugin Entry Point                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │  AdapterRegistry (Multi-CLI Abstraction)         │        │
│  ├─────────────────────────────────────────────────┤        │
│  │  ├─ ClaudeCodeAdapter ✅ (Implemented)           │        │
│  │  ├─ OpenCodeAdapter ❌ (Stub only)              │        │
│  │  ├─ CodexCLIAdapter ❌ (Stub only)              │        │
│  │  └─ GeminiCLIAdapter ❌ (Stub only)             │        │
│  └─────────────────────────────────────────────────┘        │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Core TTS Engine                                │        │
│  │  (tts.ts, config.ts, filter.ts)                 │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Target Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│ Claude Code Plugin Entry Point                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────┐        │
│  │  ClaudeCodeIntegration (Direct)                  │        │
│  │  - MCP Server management                         │        │
│  │  - Config management                            │        │
│  │  - TTS orchestration                            │        │
│  └─────────────────────────────────────────────────┘        │
│                          │                                    │
│                          ▼                                    │
│  ┌─────────────────────────────────────────────────┐        │
│  │  Core TTS Engine                                │        │
│  │  (tts.ts, config.ts, filter.ts)                 │        │
│  └─────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

**Simplified Flow:**
```
Claude Code Response
     │
     ▼
MCP Tool Invocation (speak_text)
     │
     ▼
Config Validation (enabled, voice, rate, volume)
     │
     ▼
Text Filtering (sensitive info, code blocks)
     │
     ▼
macOS say Command
     │
     ▼
Audio Output
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| ClaudeCodeIntegration | MCPServer, ConfigManager, TTSEngine | Main plugin coordinator |
| MCPServer | @modelcontextprotocol/sdk | MCP protocol server |
| ConfigManager | ~/.agent-speech/config.json | Configuration persistence |
| TTSEngine | macOS say command (child_process) | Speech synthesis |

---

## 3. Data Model

### 3.1 Entity Definition

**Simplified Configuration Schema:**

```typescript
// Before (multi-tool support)
interface AppConfig {
  version: string;
  global: TTSConfig;
  tools: {
    'claude-code': ToolConfig;
    'opencode': ToolConfig;      // ❌ Unused
    'codex-cli': ToolConfig;     // ❌ Unused
    'gemini-cli': ToolConfig;    // ❌ Unused
  };
  language?: string;
}

// After (Claude Code-specific)
interface AppConfig {
  version: string;
  enabled: boolean;
  voice: string;
  rate: number;
  volume: number;
  minLength: number;
  maxLength: number;
  filters: FilterConfig;
  language?: string;
}
```

### 3.2 Type Changes

| Type | Before | After | Change |
|------|--------|-------|--------|
| `CLIAdapter` | Generic interface | ❌ Removed | No longer needed |
| `AdapterRegistry` | Multi-tool manager | ❌ Removed | No longer needed |
| `ToolConfig` | Per-tool overrides | ❌ Removed | No longer needed |
| `AppConfig.tools` | Object map | ❌ Removed | Flatten to root |

### 3.3 Migration Path

**Config Migration Strategy:**
```typescript
// src/core/config.ts migration function
private migrateConfig(oldConfig: any): AppConfig {
  // Backward compatibility: read old structure
  if (oldConfig.global && oldConfig.tools) {
    // Extract claude-code settings or use global defaults
    const claudeSettings = oldConfig.tools['claude-code'] || {};
    return {
      version: '2.0',
      enabled: claudeSettings.enabled ?? oldConfig.global.enabled,
      voice: claudeSettings.voice ?? oldConfig.global.voice,
      rate: claudeSettings.rate ?? oldConfig.global.rate,
      volume: claudeSettings.volume ?? oldConfig.global.volume,
      minLength: oldConfig.global.minLength,
      maxLength: oldConfig.global.maxLength,
      filters: oldConfig.global.filters,
      language: oldConfig.language
    };
  }

  // Already new format
  return oldConfig as AppConfig;
}
```

---

## 4. File Structure Changes

### 4.1 Files to Delete

```
src/adapters/
├── opencode.ts          ❌ Delete (never implemented)
├── codex-cli.ts         ❌ Delete (never implemented)
├── gemini-cli.ts        ❌ Delete (never implemented)
└── registry.ts          ❌ Delete (no longer needed)
```

### 4.2 Files to Move

```
src/adapters/claude-code.ts  →  src/claude-code.ts
```

### 4.3 Files to Modify

| File | Changes |
|------|---------|
| `src/index.ts` | Remove AdapterRegistry, direct ClaudeCodeAdapter import |
| `src/types/index.ts` | Remove CLIAdapter, ToolConfig interfaces |
| `src/core/config.ts` | Simplify schema, add migration logic |
| `config/config.schema.json` | Update JSON schema |
| `README.md` | Update positioning, remove multi-CLI references |
| `CLAUDE.md` | Update architecture section |
| `.claude-plugin/agent-speech-claude-code/plugin.json` | Update name field |
| `.claude-plugin/marketplace.json` | Update plugin entry |

---

## 5. Implementation Details

### 5.1 New `src/claude-code.ts`

```typescript
/**
 * Claude Code Integration
 * Direct integration with Claude Code via MCP server
 */

import { MCPServer } from './infrastructure/mcp-server.js';
import { ConfigManager } from './core/config.js';
import { TTSEngine } from './core/tts.js';

export class ClaudeCodeIntegration {
  private mcpServer: MCPServer;
  private config: ConfigManager;
  private tts: TTSEngine;
  private started: boolean = false;

  constructor() {
    this.mcpServer = new MCPServer();
    this.config = new ConfigManager();
    this.tts = new TTSEngine();
  }

  async init(): Promise<void> {
    await this.config.init();
    await this.mcpServer.init();
    await this.tts.init();
  }

  async start(): Promise<void> {
    if (this.started) return;
    await this.mcpServer.start();
    this.started = true;
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    await this.mcpServer.stop();
    this.started = false;
  }

  isEnabled(): boolean {
    return this.config.get('enabled');
  }
}
```

### 5.2 Updated `src/index.ts`

```typescript
// Before
import { AdapterRegistry } from './adapters/registry.js';
const registry = new AdapterRegistry();
await registry.initAll();

// After
import { ClaudeCodeIntegration } from './claude-code.js';
const integration = new ClaudeCodeIntegration();
await integration.init();
```

### 5.3 Updated `src/types/index.ts`

**Remove:**
```typescript
export interface CLIAdapter { /* ... */ }
export interface ToolConfig { /* ... */ }
```

**Keep:**
```typescript
export interface TTSConfig { /* ... */ }
export interface FilterConfig { /* ... */ }
export interface AppConfig { /* ... simplified ... */ }
```

### 5.4 Updated Config Schema

**config/config.schema.json:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Agent Speech Config",
  "type": "object",
  "properties": {
    "version": { "type": "string" },
    "enabled": { "type": "boolean" },
    "voice": { "type": "string" },
    "rate": { "type": "number", "minimum": 50, "maximum": 400 },
    "volume": { "type": "number", "minimum": 0, "maximum": 100 },
    "minLength": { "type": "number", "minimum": 0 },
    "maxLength": { "type": "number", "minimum": 0 },
    "filters": {
      "type": "object",
      "properties": {
        "sensitive": { "type": "boolean" },
        "skipCodeBlocks": { "type": "boolean" },
        "skipCommands": { "type": "boolean" }
      }
    },
    "language": { "type": "string" }
  },
  "required": ["version", "enabled", "voice", "rate", "volume"]
}
```

---

## 6. Metadata Updates

### 6.1 Plugin Configuration

**.claude-plugin/agent-speech-claude-code/plugin.json:**
```json
{
  "name": "agent-speech",
  "description": "Text-to-speech plugin for Claude Code using macOS native say command. Converts AI responses into speech with configurable voice, rate, and volume. Perfect for developers who prefer listening to long responses or want audio confirmation while multitasking.",
  "version": "0.2.0",
  "author": {
    "name": "welico",
    "url": "https://github.com/welico"
  },
  "keywords": [
    "tts",
    "text-to-speech",
    "macos",
    "say",
    "accessibility",
    "audio",
    "voice",
    "speech",
    "claude-code"
  ]
}
```

### 6.2 Marketplace Configuration

**.claude-plugin/marketplace.json:**
```json
{
  "name": "welico",
  "plugins": [
    {
      "name": "agent-speech",
      "description": "Text-to-speech plugin for Claude Code using macOS native say command...",
      "version": "0.2.0"
    }
  ]
}
```

### 6.3 Package Metadata

**package.json:**
```json
{
  "name": "agent-speech-claude-code",
  "description": "Claude Code text-to-speech plugin using macOS native say command",
  "keywords": [
    "claude-code",
    "claude",
    "tts",
    "text-to-speech",
    "macos",
    "say",
    "speech",
    "accessibility",
    "mcp",
    "plugin"
  ]
}
```

---

## 7. Documentation Updates

### 7.1 README.md Changes

**Positioning Statement:**
```markdown
# Agent Speech Plugin

> Text-to-speech plugin for **Claude Code** using macOS native `say` command

Convert Claude Code responses into speech with configurable voice, rate, and volume.
Perfect for developers who prefer listening to long AI responses or want audio
confirmation while multitasking.
```

**Remove:**
- References to "AI CLI tools" (generic)
- OpenCode, Codex-CLI, Gemini-CLI mentions
- Multi-tool configuration examples

**Add:**
- Claude Code-specific installation instructions
- MCP server architecture explanation
- Simplified configuration examples

### 7.2 CLAUDE.md Updates

**Architecture Section:**
```markdown
## Architecture

This is a **Claude Code-specific plugin** that integrates via MCP (Model Context Protocol).

### Tech Stack
- Runtime: Node.js
- TTS Engine: macOS `say` command (child_process)
- Integration: MCP Server (@modelcontextprotocol/sdk)
- Config Format: JSON
- Platform: macOS only

### Folder Structure
```
agent-speech-claude-code/
├── src/
│   ├── core/              # Core TTS Logic
│   │   ├── tts.ts         # Speech synthesis
│   │   ├── config.ts      # Configuration management
│   │   └── filter.ts      # Content filtering
│   ├── infrastructure/    # External integrations
│   │   ├── mcp-server.ts  # MCP server
│   │   └── say.ts         # macOS say wrapper
│   ├── commands/          # CLI commands
│   ├── claude-code.ts     # Claude Code integration
│   └── index.ts           # Entry point
└── config/                # Configuration schemas
```
```

---

## 8. Testing Strategy

### 8.1 Verification Steps

| Step | Command | Expected Result |
|------|---------|-----------------|
| 1 | `pnpm build` | TypeScript compiles, no errors |
| 2 | `pnpm lint` | Zero ESLint errors |
| 3 | `pnpm test` | All tests pass |
| 4 | `/agent-speech status` | Displays current config |
| 5 | `/agent-speech enable` | Enables TTS |
| 6 | `/agent-speech set-voice Samantha` | Sets voice |
| 7 | Test MCP connection | Claude Code can invoke speak_text |

### 8.2 Backward Compatibility Test

```typescript
// Test old config format migration
const oldConfig = {
  version: '1.0',
  global: {
    enabled: true,
    voice: 'Samantha',
    rate: 200,
    volume: 50,
    minLength: 10,
    maxLength: 0,
    filters: { sensitive: false, skipCodeBlocks: false, skipCommands: false }
  },
  tools: {
    'claude-code': {
      enabled: true,
      voice: 'Yuna'
    }
  }
};

const newConfig = migrateConfig(oldConfig);
// Expected: enabled=true, voice='Yuna', rate=200, volume=50
```

### 8.3 Grep Verification

```bash
# Ensure no references to removed tools
grep -r "opencode" src/ --exclude-dir=node_modules
grep -r "codex-cli" src/ --exclude-dir=node_modules
grep -r "gemini-cli" src/ --exclude-dir=node_modules

# Expected: No results
```

---

## 9. Rollback Plan

### 9.1 Git Strategy

```bash
# Before refactoring, create checkpoint branch
git checkout -b checkpoint-before-claude-code-refactoring
git push origin checkpoint-before-claude-code-refactoring

# Create feature branch for refactoring
git checkout -b feat/claude-code-specific-refactoring

# If issues arise, rollback:
git checkout main
git branch -D feat/claude-code-specific-refactoring
```

### 9.2 Rollback Triggers

- Configuration migration failures
- MCP server connection issues
- Breaking changes to skill commands
- Marketplace installation failures

---

## 10. Implementation Checklist

### Phase 1: Core Refactoring (Priority: High)

- [ ] Delete `src/adapters/opencode.ts`
- [ ] Delete `src/adapters/codex-cli.ts`
- [ ] Delete `src/adapters/gemini-cli.ts`
- [ ] Delete `src/adapters/registry.ts`
- [ ] Move `src/adapters/claude-code.ts` → `src/claude-code.ts`
- [ ] Update `src/claude-code.ts` (remove implements CLIAdapter)
- [ ] Update `src/index.ts` (remove AdapterRegistry)
- [ ] Update `src/types/index.ts` (remove CLIAdapter, ToolConfig)

### Phase 2: Configuration Changes (Priority: High)

- [ ] Update `src/core/config.ts` (simplify AppConfig schema)
- [ ] Add config migration logic (v1.0 → v2.0)
- [ ] Update `config/config.schema.json`
- [ ] Test backward compatibility

### Phase 3: Metadata Updates (Priority: Medium)

- [ ] Update `.claude-plugin/agent-speech-claude-code/plugin.json`
  - [ ] name: "agent-speech"
  - [ ] description: Claude Code-specific
  - [ ] keywords: remove generic, add claude-code
- [ ] Update `.claude-plugin/marketplace.json`
  - [ ] plugins[0].name: "agent-speech"
- [ ] Update `package.json`
  - [ ] description
  - [ ] keywords

### Phase 4: Documentation Updates (Priority: Medium)

- [ ] Update `README.md`
  - [ ] Positioning statement
  - [ ] Remove multi-CLI references
  - [ ] Simplify configuration examples
- [ ] Update `CLAUDE.md`
  - [ ] Architecture section
  - [ ] Folder structure
  - [ ] Remove multi-tool design references
- [ ] Update `src/commands/help.ts`
  - [ ] Remove references to other tools
- [ ] Update `skills/agent-speech/SKILL.md`
  - [ ] Claude Code-specific description

### Phase 5: Cleanup & Verification (Priority: Low)

- [ ] Run `grep -r "opencode\|codex-cli\|gemini-cli"` and remove all references
- [ ] Run `pnpm lint` and fix errors
- [ ] Run `pnpm build` and fix errors
- [ ] Run `pnpm test` and fix failures
- [ ] Manual testing of all `/agent-speech` commands
- [ ] Test MCP server connection
- [ ] Verify marketplace installation flow

---

## 11. Success Metrics

### 11.1 Code Reduction

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Total TypeScript files | ~40 | ~36 | 10% |
| Lines of code | ~2500 | ~2100 | 16% |
| Abstraction layers | 2 (AdapterRegistry + CLIAdapter) | 0 (direct) | 100% |
| Unused files | 4 (stub adapters) | 0 | 100% |

### 11.2 Complexity Metrics

| Metric | Before | After |
|--------|--------|-------|
| Cyclomatic complexity (avg) | ~4.5 | ~3.2 |
| Import depth | 4 levels | 2 levels |
| Adapter interfaces | 1 (CLIAdapter) | 0 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-20 | Initial design | welico |
