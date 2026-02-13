/**
 * Toggle TTS for a tool command
 */

import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';

/**
 * Supported tools
 */
const TOOLS = ['claude-code', 'opencode', 'codex-cli', 'gemini-cli'] as const;
type Tool = (typeof TOOLS)[number];

/**
 * Toggle TTS for a tool
 * @param tool - Tool name (default: claude-code)
 * @returns Exit code (0 = success)
 */
export async function cmdToggle(tool?: string): Promise<number> {
  const config = new ConfigManager();
  await config.init();

  const toolName = (tool || 'claude-code') as Tool;
  const newState = config.toggleTool(toolName);
  await config.save();

  formatSuccess(`TTS ${newState ? 'enabled' : 'disabled'} for ${toolName}`);
  return 0;
}
