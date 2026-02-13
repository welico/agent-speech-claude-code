/**
 * Show configuration status command
 */

import { ConfigManager } from '../core/config.js';
import { format, formatListItem } from '../utils/format.js';

/**
 * Supported tools
 */
const TOOLS = ['claude-code', 'opencode', 'codex-cli', 'gemini-cli'] as const;

/**
 * Show configuration status
 * @returns Exit code (0 = success)
 */
export async function cmdStatus(): Promise<number> {
  const config = new ConfigManager();
  await config.init();

  format('Configuration status:');
  format('  version:', config.getVersion());
  format('');

  format('Global settings:');
  const global = config.getGlobal();
  format('  enabled:', global.enabled);
  format('  voice:', global.voice);
  format('  rate:', global.rate, 'WPM');
  format('  volume:', global.volume);
  format('  min length:', global.minLength);
  format('  max length:', global.maxLength || 'unlimited');
  format('  filters:');
  format('    sensitive:', global.filters.sensitive);
  format('    skipCodeBlocks:', global.filters.skipCodeBlocks);
  format('    skipCommands:', global.filters.skipCommands);
  format('');

  format('Tool status:');
  for (const tool of TOOLS) {
    const enabled = config.isToolEnabled(tool);
    formatListItem(`${tool}: ${enabled ? 'enabled' : 'disabled'}`, enabled);
  }

  return 0;
}
