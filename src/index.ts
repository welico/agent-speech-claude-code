/**
 * Agent Speech Plugin - Main package exports
 *
 * A plugin that provides audio guidance for Terminal CLI AI Agent responses
 * Platform: macOS
 */

// Core exports
export { TextToSpeech } from './core/tts.js';
export { ConfigManager } from './core/config.js';
export { ContentFilter } from './core/filter.js';

// Infrastructure exports
export { SayCommand } from './infrastructure/say.js';
export { MCPServer, createMCPServer } from './infrastructure/mcp-server.js';

// Adapter exports
export { ClaudeCodeAdapter } from './adapters/claude-code.js';
export { OpenCodeAdapter } from './adapters/opencode.js';
export { CodexCLIAdapter } from './adapters/codex-cli.js';
export { GeminiCLIAdapter } from './adapters/gemini-cli.js';
export { AdapterRegistry } from './adapters/registry.js';

// Type exports
export type {
  AppConfig,
  TTSConfig,
  ToolConfig,
  FilterConfig,
  FilterResult,
  SpeakTextInput,
  SpeakTextResult,
  VoiceInfo,
  CLIAdapter,
} from './types/index.js';

// File system utilities
export {
  getUserHome,
  getConfigPath,
  readConfig,
  writeConfig,
  configExists,
} from './infrastructure/fs.js';
