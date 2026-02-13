# Agent Speech Plugin - Claude Code Instructions

> **Project**: Terminal CLI AI Agent responses to speech plugin
> **Level**: Starter (Basic features, local TTS)
> **Platform**: macOS Only

---

## High Priority Directives

- **All documentation, code comments, and commit messages MUST be written in English.**

## Project Overview

This project is a plugin that provides text-to-speech (TTS) functionality for AI CLI tools (Claude Code, OpenCode, Codex-CLI, Gemini-CLI) running in terminal environments. It converts AI responses into speech using macOS's built-in TTS capabilities.

### Target Users

- Developers who primarily work in terminals
- Users who prefer listening to long AI responses rather than reading
- Users who want to confirm content via audio while multitasking
- Developers with visual impairments (improved accessibility)

---

## Architecture Decisions

### Tech Stack

| Decision | Selection | Rationale |
|----------|-----------|-----------|
| **Language** | TypeScript | Type safety, IDE support |
| **Runtime** | Node.js | Native compatibility with CLI tools |
| **TTS Engine** | macOS `say` (child_process) | macOS native, no external dependencies |
| **Config Format** | JSON | Simplicity, Node.js built-in support |
| **Package Manager** | pnpm | Faster installs, efficient disk usage |
| **Testing** | Vitest | Fast, TypeScript native support |

### Folder Structure

```
agent-speech-plugin/
├── src/
│   ├── core/              # Core TTS Logic
│   │   ├── tts.ts         # Speech synthesis class
│   │   ├── config.ts      # Configuration management
│   │   └── filter.ts      # Text filter (sensitive info, etc.)
│   ├── plugins/           # CLI Tool Plugins
│   │   ├── claude-code.ts
│   │   ├── opencode.ts
│   │   ├── codex-cli.ts
│   │   └── gemini-cli.ts
│   ├── types/             # TypeScript Types
│   │   └── index.ts
│   └── index.ts           # Entry point
├── config/
│   └── config.example.json
├── tests/
│   ├── unit/
│   └── integration/
└── docs/
```

---

## Coding Conventions

### Naming Rules

| Type | Convention | Example |
|------|------------|---------|
| Variables | camelCase | `speechRate`, `voiceName` |
| Functions | camelCase | `speakText()`, `loadConfig()` |
| Classes | PascalCase | `TextToSpeech`, `ConfigManager` |
| Constants | UPPER_SNAKE_CASE | `DEFAULT_RATE`, `CONFIG_PATH` |
| Types/Interfaces | PascalCase | `TTSConfig`, `PluginInterface` |
| Files | kebab-case | `tts.ts`, `config-manager.ts` |

### Import Order

```typescript
// 1. Node.js built-ins
import { spawn } from 'child_process';
import path from 'path';

// 2. External packages
import fs from 'fs-extra';

// 3. Internal modules
import { TTSConfig } from './types';
import { loadConfig } from './core/config';
```

### Error Handling

```typescript
// Always use try-catch for async operations
async function speakText(text: string): Promise<void> {
  try {
    await spawnSayProcess(text);
  } catch (error) {
    // Log error but don't crash CLI
    console.error('[Agent Speech] TTS Error:', error);
    // Optionally send to error tracking
  }
}
```

### Type Safety

```typescript
// Always define types for function parameters and return values
interface TTSConfig {
  voice: string;
  rate: number;
  volume: number;
  enabled: boolean;
  minLength: number;
}

function speak(text: string, config: TTSConfig): Promise<void> {
  // ...
}
```

---

## Functional Requirements (Reference)

| ID | Description | Priority |
|----|-------------|----------|
| FR-01 | Plugin integration with each CLI tool | High |
| FR-02 | macOS `say` command for speech conversion | High |
| FR-03 | Speech rate (words per minute) adjustment | Medium |
| FR-04 | Volume adjustment | Medium |
| FR-05 | Voice selection (e.g., Samantha, Alex, Victoria) | Medium |
| FR-06 | Speech output ON/OFF toggle | High |
| FR-07 | Skip responses below minimum length | Low |
| FR-08 | Config file persistent storage (`~/.agent-speech/config.json`) | High |
| FR-09 | Different settings per CLI tool | Medium |

---

## Implementation Guidelines

### TTS Integration (macOS)

```typescript
// macOS `say` command usage
// say -v "Samantha" -r 200 -v 50 "Hello World"
// -v: voice name
// -r: rate (words per minute, default 175)
// -a: volume (0-100, default 50)

import { spawn } from 'child_process';

function speak(text: string, config: TTSConfig): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-v', config.voice,
      '-r', config.rate.toString(),
      '-a', config.volume.toString(),
      text
    ];
    const process = spawn('say', args);
    process.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`say exited with code ${code}`));
    });
  });
}
```

### Plugin Interface

```typescript
// Common interface for all CLI tool plugins
interface CLIPlugin {
  name: string;
  init(): Promise<void>;
  onResponse(response: string): Promise<void>;
  cleanup(): Promise<void>;
}
```

### Configuration Structure

```typescript
// ~/.agent-speech/config.json
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
    },
    "opencode": {
      "enabled": false
    }
  }
}
```

---

## Risk Mitigation

### 1. CLI Tool API Differences

**Risk**: Each CLI tool has a different plugin API
**Mitigation**: Create abstraction layer with unified interface

### 2. Long Text Handling

**Risk**: `say` command has limitations with long text
**Mitigation**: Chunk text to appropriate length (max 1000 chars)

### 3. Process Management

**Risk**: Background speech interrupted when CLI exits
**Mitigation**: Run as background process, manage PID

### 4. Voice Availability

**Risk**: System may not have specific voice installed
**Mitigation**: Default voice fallback, list available voices

### 5. Sensitive Information

**Risk**: Passwords/API keys spoken aloud
**Mitigation**: Keyword filtering option provided, disabled by default

---

## Success Criteria

- [x] Plan document completed
- [x] Design document completed
- [ ] All functional requirements (FR-01 ~ FR-09) implemented
- [ ] Plugin loading verified in each CLI tool
- [ ] Config file creation/load/save working
- [ ] TypeScript type safety ensured
- [ ] ESLint 0 errors
- [ ] Codebase under 1000 lines
- [ ] README.md completed (installation, configuration, usage)

---

## Commands

### Development

```bash
# Install
pnpm install

# Dev mode
pnpm dev

# Test
pnpm test

# Lint
pnpm lint

# Build
pnpm build
```

### Testing TTS

```bash
# Direct test on macOS
say -v Samantha "Hello, this is a test"

# List available voices
say -v "?"
```

---

## Notes

- **macOS Only**: This project is macOS-only.
- **No External Dependencies**: TTS uses macOS built-in `say` command only.
- **Performance**: Speech conversion is processed asynchronously to avoid blocking CLI responses.
