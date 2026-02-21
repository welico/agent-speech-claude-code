/**
 * Agent Speech Plugin - Main package exports
 *
 * A Claude Code plugin that provides text-to-speech for AI responses
 * Platform: macOS
 */
// Core exports
export { TextToSpeech } from './core/tts.js';
export { ConfigManager } from './core/config.js';
export { ContentFilter } from './core/filter.js';
// Infrastructure exports
export { SayCommand } from './infrastructure/say.js';
export { MCPServer, createMCPServer } from './infrastructure/mcp-server.js';
// Claude Code integration
export { ClaudeCodeIntegration } from './claude-code.js';
// File system utilities
export { getUserHome, getConfigPath, readConfig, writeConfig, configExists, } from './infrastructure/fs.js';
//# sourceMappingURL=index.js.map