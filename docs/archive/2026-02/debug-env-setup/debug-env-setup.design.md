# Debugging Environment Setup Design Document

> **Summary**: Technical design for debugging and testing environment including logger utility, VS Code debug config, Vitest setup, and MCP Inspector integration
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-13
> **Status**: Draft
> **Planning Doc**: [debug-env-setup.plan.md](../01-plan/features/debug-env-setup.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Create a unified debugging experience for MCP server development
- Enable hot-reload development with instant feedback
- Provide VS Code integration for breakpoint debugging
- Establish unit testing framework with Vitest
- Integrate MCP Inspector for browser-based tool testing
- Support local Claude Code integration testing

### 1.2 Design Principles

- **stderr-only logging**: stdout reserved for MCP protocol messages
- **Non-invasive**: Debug utilities should not clutter production code
- **Type-safe**: All debug utilities fully typed with TypeScript
- **Zero-config**: Works out of the box with existing project structure
- **Developer-friendly**: Single command workflows for common tasks

---

## 2. Architecture

### 2.1 Component Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   VS Code       │────▶│  MCP Server     │────▶│  macOS TTS      │
│   Debugger      │     │  (dist/mcp...)  │     │  (say command)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                        │                        │
         │                        ▼                        │
         │               ┌─────────────────┐              │
         │               │  Logger Util    │              │
         │               │  (stderr + file) │              │
         │               └─────────────────┘              │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Vitest Tests   │────▶│  MCP Inspector  │────▶│ Claude Code     │
│  (Unit/Integ)   │     │  (Browser UI)    │     │ (Local Testing) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Data Flow

```
Developer Change → tsc --watch → Rebuild → MCP Server Restart → Tool Call → Debug Output
                                                                       │
                                                                       ├─→ stderr (console)
                                                                       └─→ /tmp/*.log (file)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| VS Code Debugger | tsconfig.json sourcemaps | Breakpoint debugging |
| MCP Server | @modelcontextprotocol/sdk | Core MCP functionality |
| Logger Utility | node:fs, node:path | File and console logging |
| Vitest Tests | src modules | Unit testing |
| MCP Inspector | dist/mcp-server.js | Browser-based testing |
| Claude Code | ~/.config/claude-code/config.json | Local integration |

---

## 3. Data Model

### 3.1 Logger Configuration

```typescript
// src/utils/logger.ts
interface LoggerConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  output: 'stderr' | 'file' | 'both';
  filePath?: string;
  prefix: string; // e.g., '[DEBUG]'
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: unknown;
}
```

### 3.2 Debug Tool Input Schema

```typescript
// For MCP Inspector testing
interface DebugToolInput {
  text: string;
  voice?: string;
  rate?: number;
  volume?: number;
  _debug?: boolean; // Enable verbose output
}
```

### 3.3 VS Code Launch Configuration

```typescript
// .vscode/launch.json structure
interface LaunchConfig {
  version: string;
  configurations: DebugConfiguration[];
}

interface DebugConfiguration {
  type: 'node';
  request: 'launch' | 'attach';
  name: string;
  program: string;
  preLaunchTask?: string;
  outFiles: string[];
  sourceMaps: boolean;
  env?: {
    DEBUG?: string;
    LOG_FILE?: string;
  };
}
```

---

## 4. Module Specifications

### 4.1 Logger Utility (`src/utils/logger.ts`)

**Responsibility**: Centralized debug logging with stderr and file output

**Interface**:
```typescript
export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  enable(enabled: boolean): void;
  setLevel(level: LogLevel): void;
}

export function createLogger(config?: Partial<LoggerConfig>): Logger;
```

**Implementation Details**:
- All output goes to `console.error()` (not console.log)
- File logging writes to `/tmp/agent-speech-debug.log`
- Log rotation: max 10MB per file, keep 3 backups
- Respects `DEBUG` environment variable
- Prefix all messages with `[DEBUG]`, `[INFO]`, etc.

**Error Handling**:
- File write errors are silently caught (debug should not crash)
- Invalid log levels fall back to 'info'

### 4.2 VS Code Configuration (`.vscode/`)

**Files**:
- `.vscode/launch.json` - Debug configurations
- `.vscode/tasks.json` - Build tasks
- `.vscode/extensions.json` - Recommended extensions

**Launch Configurations**:

| Name | Purpose | Command |
|------|---------|---------|
| Debug MCP Server | Debug main MCP server | `node dist/mcp-server.js` |
| Debug CLI | Debug CLI commands | `node dist/cli.js` |
| Attach to Running | Attach to running process | Attach via PID |

**Tasks**:

| Name | Command | Description |
|------|---------|-------------|
| tsc: build | `tsc` | Compile TypeScript |
| tsc: watch | `tsc --watch` | Compile with hot-reload |
| vitest: run | `vitest run` | Run all tests |

### 4.3 Vitest Setup (`tests/`)

**Configuration**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
```

**Test Structure**:
```
tests/
├── unit/
│   ├── logger.test.ts
│   ├── tts.test.ts
│   ├── filter.test.ts
│   └── config.test.ts
└── integration/
    ├── mcp-server.test.ts
    └── cli.test.ts
```

### 4.4 MCP Inspector Integration (`scripts/inspect.sh`)

**Script**:
```bash
#!/bin/bash
# Start MCP Inspector for agent-speech-claude-code
npx @modelcontextprotocol/inspector node dist/mcp-server.js
```

**Usage**:
```bash
chmod +x scripts/inspect.sh
./scripts/inspect.sh
# Opens browser at http://localhost:5173
```

**Features**:
- List available tools
- Invoke tools with custom input
- View real-time protocol messages
- Inspect response format

### 4.5 Claude Code Local Integration

**Config Snippet**: `~/.config/claude-code/config.json`

```json
{
  "mcpServers": {
    "agent-speech-dev": {
      "command": "node",
      "args": ["/absolute/path/to/agent-speech-claude-code/dist/mcp-server.js"],
      "env": {
        "DEBUG": "true",
        "LOG_FILE": "/tmp/agent-speech-debug.log"
      }
    }
  }
}
```

---

## 5. Error Handling

### 5.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| DEBUG_LOG_ERROR | Failed to write debug log | File system error | Silent fallback to stderr only |
| DEBUG_BUILD_FAILED | TypeScript compilation failed | Syntax error | Show error, don't start debug |
| DEBUG_ATTACH_FAILED | Cannot attach to process | No process running | Show available processes |

### 5.2 Error Response Format

```typescript
interface DebugError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}
```

### 5.3 Wrapper Pattern

```typescript
// src/utils/with-error-handling.ts
export async function withErrorHandling<T>(
  operation: string,
  fn: () => Promise<T>,
  logger?: Logger
): Promise<T> {
  try {
    logger?.debug(`Starting: ${operation}`);
    const result = await fn();
    logger?.debug(`Completed: ${operation}`);
    return result;
  } catch (error) {
    logger?.error(`Failed: ${operation}`, error);
    throw new DebugError(
      `OPERATION_FAILED`,
      `${operation} failed`,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}
```

---

## 6. Security Considerations

- [x] **Log file permissions**: `/tmp/` with user-only read/write
- [x] **No sensitive data in logs**: Filter passwords, API keys before logging
- [x] **DEBUG env validation**: Only enable in development
- [x] **File path validation**: Prevent path traversal in LOG_FILE env var
- [x] **MCP Inspector local only**: No external network exposure

---

## 7. Test Plan

### 7.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| Unit Test | Logger utility, error wrapper | Vitest |
| Integration Test | MCP server with tool calls | Vitest + MCP SDK |
| Manual Test | VS Code breakpoints, MCP Inspector | Human verification |

### 7.2 Test Cases (Key)

**Logger Tests**:
- [x] Debug message outputs to stderr with correct prefix
- [x] File logging creates and appends to log file
- [x] Log rotation creates backup files
- [x] DEBUG=false disables all debug output

**VS Code Debug Tests**:
- [x] Breakpoint in mcp-server.ts pauses execution
- [x] Variables visible in debug panel
- [x] Step-over/step-into works correctly

**MCP Inspector Tests**:
- [x] speak_text tool appears in tool list
- [x] Tool invocation with valid input succeeds
- [x] Tool response format matches schema

---

## 8. Implementation Guide

### 8.1 File Structure

```
src/
├── utils/
│   ├── logger.ts           # NEW: Debug logging utility
│   ├── error-handler.ts     # NEW: Error wrapper
│   └── format.ts           # EXISTING
├── core/                   # EXISTING
├── infrastructure/          # EXISTING
├── adapters/               # EXISTING
├── commands/                # EXISTING
├── types/                  # EXISTING
└── mcp-server.ts           # EXISTING

tests/
├── unit/
│   ├── logger.test.ts      # NEW
│   ├── tts.test.ts         # NEW
│   ├── filter.test.ts      # NEW
│   └── config.test.ts     # NEW
└── integration/
    └── mcp-server.test.ts  # NEW

.vscode/
├── launch.json            # NEW
├── tasks.json             # NEW
└── extensions.json         # NEW

scripts/
└── inspect.sh             # NEW

vitest.config.ts            # NEW
```

### 8.2 Implementation Order

1. **Phase 1: Core Debug Infrastructure**
   - Create `src/utils/logger.ts`
   - Create `src/utils/error-handler.ts`
   - Add debug imports to existing modules

2. **Phase 2: VS Code Configuration**
   - Create `.vscode/launch.json`
   - Create `.vscode/tasks.json`
   - Create `.vscode/extensions.json`
   - Verify sourcemaps in tsconfig.json

3. **Phase 3: Unit Testing Setup**
   - Create `vitest.config.ts`
   - Add Zod dependency: `pnpm add -D zod vitest @vitest/ui`
   - Create test files in `tests/unit/`

4. **Phase 4: MCP Inspector Integration**
   - Create `scripts/inspect.sh`
   - Add npm script: `"inspect": "./scripts/inspect.sh"`
   - Test Inspector workflow

5. **Phase 5: Local Claude Code Integration**
   - Document config snippet in README
   - Create example config file

6. **Phase 6: Log File Management**
   - Implement log rotation in logger.ts
   - Add cleanup script for old logs

7. **Phase 7: Schema Validation**
   - Define Zod schemas for tool inputs
   - Add validation to mcp-server.ts

### 8.3 Configuration Files

**package.json additions**:
```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "inspect": "./scripts/inspect.sh",
    "lint": "eslint src/"
  },
  "devDependencies": {
    "vitest": "^1.2.0",
    "@vitest/ui": "^1.2.0",
    "zod": "^3.22.0"
  }
}
```

---

## 9. Integration Points

### 9.1 Existing Code Changes Required

| File | Change | Purpose |
|------|--------|---------|
| `src/infrastructure/mcp-server.ts` | Add `logger.debug()` calls | Trace tool invocations |
| `src/core/tts.ts` | Add error handling wrapper | Catch TTS errors |
| `src/core/config.ts` | Add debug logging for config loads | Trace config issues |
| `src/cli.ts` | Add logger for CLI commands | Debug CLI usage |

### 9.2 MCP Server Debug Integration

```typescript
// In mcp-server.ts
import { createLogger } from '../utils/logger.js';

const logger = createLogger({ prefix: '[MCP]' });

// In handleSpeak method
logger.debug('speak_text called', { text: input.text, length: input.text.length });

// In error handler
logger.error('Tool execution failed', error);
```

---

## 10. Coding Convention Reference

### 10.1 Debug Logging Conventions

| Rule | Example |
|------|--------|
| Always use console.error for logs | `console.error('[DEBUG] message')` |
| Include descriptive prefix | `[MCP]`, `[TTS]`, `[CONFIG]` |
| Log function entry/exit | `debug('functionName called')`, `debug('functionName completed')` |
| Log errors with context | `error('Operation failed', { error, input })` |
| Avoid logging sensitive data | Filter passwords, tokens |

### 10.2 Test File Conventions

| Rule | Example |
|------|--------|
| Test file name: `<module>.test.ts` | `logger.test.ts` |
| Test name: `describe('<module>')` | `describe('Logger')` |
| Test case: `it('should <behavior>')` | `it('should output to stderr')` |
| Group related tests: `describe('<method>')` | `describe('debug()')` |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-13 | Initial draft | welico |
