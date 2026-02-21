# Debugging Environment Setup Implementation Guide

> **Summary**: Step-by-step implementation guide for debug environment including logger, VS Code config, Vitest, MCP Inspector, and Claude Code integration
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-13
> **Status**: In Progress
> **Design Doc**: [debug-env-setup.design.md](../02-design/features/debug-env-setup.design.md)

---

## 1. Pre-Implementation Checklist

### 1.1 Documents Verified

- [x] Plan document reviewed: `docs/01-plan/features/debug-env-setup.plan.md`
- [x] Design document reviewed: `docs/02-design/features/debug-env-setup.design.md`
- [x] Conventions understood: `CLAUDE.md` (project root)

### 1.2 Environment Ready

- [ ] Dependencies installed (Vitest, Zod, @vitest/ui)
- [ ] Development server running (`npm run dev`)
- [ ] Test environment configured (Vitest)
- [ ] Required environment variables set (DEBUG, LOG_FILE)

---

## 2. Implementation Order

> Follow this order based on Design document specifications.

### Phase 1: Core Debug Infrastructure

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 1 | Create logger utility | `src/utils/logger.ts` | ☐ |
| 2 | Create error wrapper | `src/utils/error-handler.ts` | ☐ |
| 3 | Add debug logging to mcp-server.ts | `src/infrastructure/mcp-server.ts` | ☐ |
| 4 | Add debug logging to tts.ts | `src/core/tts.ts` | ☐ |
| 5 | Add debug logging to config.ts | `src/core/config.ts` | ☐ |

### Phase 2: VS Code Configuration

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 6 | Create launch.json | `.vscode/launch.json` | ☐ |
| 7 | Create tasks.json | `.vscode/tasks.json` | ☐ |
| 8 | Create extensions.json | `.vscode/extensions.json` | ☐ |
| 9 | Verify sourcemaps in tsconfig.json | `tsconfig.json` | ☐ |
| 10 | Test breakpoints in VS Code | Manual Test | ☐ |

### Phase 3: Unit Testing Setup

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 11 | Create vitest.config.ts | `vitest.config.ts` | ☐ |
| 12 | Create logger.test.ts | `tests/unit/logger.test.ts` | ☐ |
| 13 | Create tts.test.ts | `tests/unit/tts.test.ts` | ☐ |
| 14 | Create filter.test.ts | `tests/unit/filter.test.ts` | ☐ |
| 15 | Create config.test.ts | `tests/unit/config.test.ts` | ☐ |

### Phase 4: MCP Inspector Integration

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 16 | Create inspect.sh script | `scripts/inspect.sh` | ☐ |
| 17 | Add inspect npm script | `package.json` | ☐ |
| 18 | Test MCP Inspector workflow | Manual Test | ☐ |

### Phase 5: Local Claude Code Integration

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 19 | Document config snippet | `README.md` | ☐ |
| 20 | Test local plugin loading | Manual Test | ☐ |

### Phase 6: Log File Management

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 21 | Implement log rotation in logger.ts | `src/utils/logger.ts` | ☐ |
| 22 | Test log file creation | Manual Test | ☐ |

### Phase 7: Schema Validation

| Priority | Task | File/Location | Status |
|:--------:|------|---------------|:------:|
| 23 | Install Zod dependency | `package.json` | ☐ |
| 24 | Define Zod schemas for tool inputs | `src/utils/schemas.ts` | ☐ |
| 25 | Add validation to mcp-server.ts | `src/infrastructure/mcp-server.ts` | ☐ |

---

## 3. Key Files to Create/Modify

### 3.1 New Files

| File Path | Purpose | Template |
|-----------|---------|----------|
| `src/utils/logger.ts` | Debug logging utility | See Section 4.1 |
| `src/utils/error-handler.ts` | Error wrapper function | See Section 4.2 |
| `src/utils/schemas.ts` | Zod validation schemas | See Section 4.3 |
| `tests/unit/logger.test.ts` | Logger unit tests | See Section 4.4 |
| `tests/unit/tts.test.ts` | TTS unit tests | See Section 4.4 |
| `tests/unit/filter.test.ts` | Filter unit tests | See Section 4.4 |
| `tests/unit/config.test.ts` | Config unit tests | See Section 4.4 |
| `vitest.config.ts` | Vitest configuration | See Section 4.5 |
| `.vscode/launch.json` | VS Code debug config | See Section 4.6 |
| `.vscode/tasks.json` | VS Code build tasks | See Section 4.7 |
| `.vscode/extensions.json` | Recommended extensions | See Section 4.8 |
| `scripts/inspect.sh` | MCP Inspector launcher | See Section 4.9 |

### 3.2 Files to Modify

| File Path | Changes | Reason |
|-----------|---------|--------|
| `src/infrastructure/mcp-server.ts` | Add logger.debug() calls | Trace tool invocations |
| `src/core/tts.ts` | Add error handling wrapper | Catch TTS errors |
| `src/core/config.ts` | Add debug logging for config loads | Trace config issues |
| `package.json` | Add dev dependencies, scripts | Vitest, Zod, inspect script |
| `README.md` | Add debugging section | Document usage |

---

## 4. Implementation Details

### 4.1 Logger Utility (`src/utils/logger.ts`)

```typescript
import fs from 'node:fs';
import path from 'node:path';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  output: 'stderr' | 'file' | 'both';
  filePath: string;
  prefix: string;
  maxSize: number; // bytes
  maxFiles: number;
}

const DEFAULT_CONFIG: LoggerConfig = {
  enabled: process.env.DEBUG === 'true',
  level: (process.env.LOG_LEVEL as LogLevel) || 'debug',
  output: 'both',
  filePath: process.env.LOG_FILE || '/tmp/agent-speech-debug.log',
  prefix: '[DEBUG]',
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 3,
};

export interface Logger {
  debug(message: string, data?: unknown): void;
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
  enable(enabled: boolean): void;
  setLevel(level: LogLevel): void;
}

export function createLogger(config?: Partial<LoggerConfig>): Logger {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const logLevels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  function log(level: LogLevel, message: string, data?: unknown): void {
    if (!cfg.enabled || logLevels[level] < logLevels[cfg.level]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `${cfg.prefix} [${level.toUpperCase()}]`;
    const logMessage = `${prefix} ${message}`;
    const logEntry = JSON.stringify({ timestamp, level, message, data });

    // Console output (stderr only - stdout reserved for MCP)
    if (cfg.output === 'stderr' || cfg.output === 'both') {
      console.error(logMessage, data || '');
    }

    // File output
    if (cfg.output === 'file' || cfg.output === 'both') {
      writeToFile(logEntry);
    }
  }

  function writeToFile(entry: string): void {
    try {
      const logDir = path.dirname(cfg.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Check file size and rotate if needed
      if (fs.existsSync(cfg.filePath)) {
        const stats = fs.statSync(cfg.filePath);
        if (stats.size >= cfg.maxSize) {
          rotateLogs();
        }
      }

      fs.appendFileSync(cfg.filePath, entry + '\n');
    } catch (error) {
      // Silent fallback - logging should not crash
      console.error('[LOGGER] Failed to write to file:', error);
    }
  }

  function rotateLogs(): void {
    for (let i = cfg.maxFiles - 1; i >= 1; i--) {
      const oldFile = `${cfg.filePath}.${i}`;
      const newFile = `${cfg.filePath}.${i + 1}`;
      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile);
      }
    }
    if (fs.existsSync(cfg.filePath)) {
      fs.renameSync(cfg.filePath, `${cfg.filePath}.1`);
    }
  }

  return {
    debug: (message, data) => log('debug', message, data),
    info: (message, data) => log('info', message, data),
    warn: (message, data) => log('warn', message, data),
    error: (message, data) => log('error', message, data),
    enable: (enabled) => { cfg.enabled = enabled; },
    setLevel: (level) => { cfg.level = level; },
  };
}
```

### 4.2 Error Handler (`src/utils/error-handler.ts`)

```typescript
import type { Logger } from './logger.js';

export interface DebugError {
  code: string;
  message: string;
  details: Record<string, unknown>;
  originalError?: Error;
}

export class DebugError extends Error {
  code: string;
  details: Record<string, unknown>;

  constructor(code: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = 'DebugError';
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

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
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    logger?.error(`Failed: ${operation}`, { message, stack });

    throw new DebugError(
      'OPERATION_FAILED',
      `${operation} failed: ${message}`,
      { originalError: message, stack }
    );
  }
}

export function withSyncErrorHandling<T>(
  operation: string,
  fn: () => T,
  logger?: Logger
): T {
  try {
    logger?.debug(`Starting: ${operation}`);
    const result = fn();
    logger?.debug(`Completed: ${operation}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    logger?.error(`Failed: ${operation}`, { message, stack });

    throw new DebugError(
      'OPERATION_FAILED',
      `${operation} failed: ${message}`,
      { originalError: message, stack }
    );
  }
}
```

### 4.3 Zod Schemas (`src/utils/schemas.ts`)

```typescript
import { z } from 'zod';

/**
 * Schema for speak_text tool input
 */
export const SpeakTextInputSchema = z.object({
  text: z.string().min(1).describe('Text to speak'),
  voice: z.string().optional().describe('Voice name (e.g., Samantha, Alex)'),
  rate: z.number().min(50).max(400).optional().describe('Speech rate (WPM)'),
  volume: z.number().min(0).max(100).optional().describe('Volume (0-100)'),
});

export type SpeakTextInput = z.infer<typeof SpeakTextInputSchema>;

/**
 * Validate speak_text input
 */
export function validateSpeakTextInput(data: unknown): SpeakTextInput {
  return SpeakTextInputSchema.parse(data);
}

/**
 * Safe parse - returns validation error instead of throwing
 */
export function safeValidateSpeakTextInput(
  data: unknown
): { success: true; data: SpeakTextInput } | { success: false; error: string } {
  const result = SpeakTextInputSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    error: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
  };
}
```

### 4.4 Unit Test Templates

#### `tests/unit/logger.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import { createLogger } from '../../src/utils/logger.js';

describe('Logger', () => {
  const testLogFile = '/tmp/agent-speech-test.log';

  beforeEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  afterEach(() => {
    // Clean up test log file
    if (fs.existsSync(testLogFile)) {
      fs.unlinkSync(testLogFile);
    }
  });

  describe('debug()', () => {
    it('should output to stderr when enabled', () => {
      const logger = createLogger({ enabled: true, output: 'stderr' });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.debug('test message', { data: 'value' });

      expect(spy).toHaveBeenCalledWith('[DEBUG] [DEBUG] test message', { data: 'value' });
    });

    it('should not output when disabled', () => {
      const logger = createLogger({ enabled: false, output: 'stderr' });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.debug('test message');

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('file logging', () => {
    it('should write to file when output is "file"', () => {
      const logger = createLogger({ enabled: true, output: 'file', filePath: testLogFile });

      logger.info('test message');

      expect(fs.existsSync(testLogFile)).toBe(true);
    });
  });

  describe('log levels', () => {
    it('should respect log level hierarchy', () => {
      const logger = createLogger({ enabled: true, level: 'warn', output: 'stderr' });
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(spy).toHaveBeenCalledTimes(2); // warn and error only
    });
  });
});
```

### 4.5 Vitest Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
});
```

### 4.6 VS Code Launch Configuration (`.vscode/launch.json`)

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug MCP Server",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/mcp-server.js",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "env": {
        "DEBUG": "true",
        "LOG_FILE": "/tmp/agent-speech-debug.log"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug CLI",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/dist/cli.js",
      "preLaunchTask": "tsc: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "args": ["status"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Run Vitest",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "--reporter=verbose"]
    }
  ]
}
```

### 4.7 VS Code Tasks (`.vscode/tasks.json`)

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "tsc: build",
      "type": "shell",
      "command": "pnpm",
      "args": ["build"],
      "group": "build",
      "presentation": {
        "reveal": "silent"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "tsc: watch",
      "type": "shell",
      "command": "pnpm",
      "args": ["dev"],
      "group": "build",
      "isBackground": true,
      "presentation": {
        "reveal": "silent"
      },
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "vitest: run",
      "type": "shell",
      "command": "pnpm",
      "args": ["test"],
      "group": "test",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "vitest: ui",
      "type": "shell",
      "command": "pnpm",
      "args": ["test:ui"],
      "group": "test"
    }
  ]
}
```

### 4.8 VS Code Extensions (`.vscode/extensions.json`)

```json
{
  "recommendations": [
    "usernamehw.errorlens",
    "dbaeumer.vscode-eslint",
    "vitest.explorer",
    "yoavbls.pretty-ts-errors"
  ]
}
```

### 4.9 MCP Inspector Script (`scripts/inspect.sh`)

```bash
#!/bin/bash
# MCP Inspector launcher for agent-speech-claude-code

echo "Starting MCP Inspector for agent-speech-claude-code..."
echo "Browser will open to http://localhost:5173"
echo ""
echo "Available tools:"
echo "  - speak_text: Convert text to speech using macOS TTS"
echo ""
echo "Press Ctrl+C to stop"

npx @modelcontextprotocol/inspector node dist/mcp-server.js
```

---

## 5. Dependencies

### 5.1 Required Packages

```bash
# MCP SDK (already installed)
pnpm add @modelcontextprotocol/sdk
```

### 5.2 Dev Dependencies

```bash
# Testing and validation
pnpm add -D vitest @vitest/ui zod

# Coverage (v8 is included with vitest)
pnpm add -D @vitest/coverage-v8
```

---

## 6. Integration Points

### 6.1 MCP Server Debug Integration

Modify `src/infrastructure/mcp-server.ts`:

```typescript
// Add import at top
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';
import { safeValidateSpeakTextInput } from '../utils/schemas.js';

// In MCPServer class, add private property
export class MCPServer {
  private server: Server;
  private tts: TextToSpeech;
  private config: ConfigManager;
  private logger = createLogger({ prefix: '[MCP]' });

  // In handleSpeak method, add debug logging
  private async handleSpeak(args: unknown): Promise<...> {
    return withErrorHandling('handleSpeak', async () => {
      this.logger.debug('speak_text called', { args });

      // Validate input with Zod
      const validation = safeValidateSpeakTextInput(args);
      if (!validation.success) {
        this.logger.error('Validation failed', { error: validation.error });
        throw new Error(validation.error);
      }

      const input = validation.data;
      this.logger.debug('Parsed input', input);

      // ... rest of implementation
    }, this.logger);
  }
}
```

### 6.2 TTS Debug Integration

Modify `src/core/tts.ts`:

```typescript
// Add import
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';

export class TextToSpeech {
  private logger = createLogger({ prefix: '[TTS]' });

  async speak(text: string, config: TTSConfig): Promise<void> {
    return withErrorHandling('speak', async () => {
      this.logger.debug('Starting speech', { text, config });

      // ... existing implementation

      this.logger.debug('Speech started');
    }, this.logger);
  }
}
```

---

## 7. Implementation Notes

### 7.1 Design Decisions Reference

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Logging | console.error only | stdout reserved for MCP protocol |
| File logging | /tmp/agent-speech-debug.log | Standard temp location, easy cleanup |
| Log rotation | 10MB max, 3 files | Prevent disk space issues |
| Testing | Vitest | Native TypeScript, ESM support |
| Validation | Zod | Type-safe runtime validation |

### 7.2 Code Patterns to Follow

```typescript
// Import order (from CLAUDE.md)
// 1. Node.js built-ins
import fs from 'node:fs';
import path from 'node:path';

// 2. External packages
import { z } from 'zod';

// 3. Internal modules
import { createLogger } from './utils/logger.js';

// Error handling pattern
try {
  // operation
} catch (error) {
  this.logger.error('Operation failed', error);
  throw new DebugError('OP_FAILED', 'Message', { originalError: error });
}
```

### 7.3 Things to Avoid

- [x] Hardcoded values (use constants/config)
- [x] Console.log in production code (use console.error via logger)
- [x] Sensitive data in logs (passwords, API keys)
- [x] Direct stdout writes (reserved for MCP protocol)

### 7.4 Architecture Checklist (Starter Level)

- [x] **Layer Structure** - Follow simple starter structure
  - `src/utils/` - Utility functions
  - `src/core/` - Core business logic
  - `src/infrastructure/` - External service integration
- [x] **Import Rules** - Follow CLAUDE.md import order
  - Node.js built-ins first
  - External packages second
  - Internal modules third
  - Types fourth

### 7.5 Convention Checklist

- [x] **Naming Convention**
  - Classes: PascalCase (TextToSpeech, ConfigManager)
  - Functions: camelCase (createLogger, withErrorHandling)
  - Constants: UPPER_SNAKE_CASE (DEFAULT_CONFIG, MAX_FILE_SIZE)
  - Files: kebab-case (logger.ts, error-handler.ts)
- [x] **Import Order**
  1. Node.js built-ins
  2. External packages (vitest, zod)
  3. Internal modules
  4. Type imports

### 7.6 Security Checklist

- [x] **Input Validation**
  - Validate all user input with Zod schemas
  - Sanitize file paths (prevent path traversal)
- [x] **Logging Safety**
  - Filter passwords, tokens from logs
  - User-only read permissions on log files
- [x] **DEBUG Environment**
  - Only enable debug mode in development
  - Document DEBUG variable in README

---

## 8. Testing Checklist

### 8.1 Manual Testing

- [ ] Logger outputs to stderr with correct prefix
- [ ] File logging creates and appends to log file
- [ ] Log rotation creates backup files (.1, .2, .3)
- [ ] VS Code breakpoints pause execution
- [ ] MCP Inspector shows speak_text tool
- [ ] Tool invocation with valid input succeeds
- [ ] Tool invocation with invalid input shows error

### 8.2 Code Quality

- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Follows naming conventions
- [ ] Proper error handling

---

## 9. Progress Tracking

### 9.1 Daily Progress

| Date | Tasks Completed | Notes |
|------|-----------------|-------|
| 2026-02-13 | Started implementation | Initial setup |

### 9.2 Blockers

| Issue | Impact | Resolution |
|-------|--------|------------|
| | | |

---

## 10. Post-Implementation

### 10.1 Self-Review Checklist

- [ ] All design requirements implemented
- [ ] Code follows conventions
- [ ] No hardcoded values
- [ ] Error handling complete
- [ ] Types properly defined
- [ ] Unit tests passing
- [ ] VS Code debugging verified

### 10.2 Ready for Check Phase

When all items above are complete:

```bash
# Build project
pnpm build

# Run tests
pnpm test

# Run Gap Analysis
/pdca analyze debug-env-setup
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-13 | Initial implementation guide | welico |
