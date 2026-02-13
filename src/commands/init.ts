/**
 * Initialize configuration command
 */

import { ConfigManager } from '../core/config.js';
import { getUserHome } from '../infrastructure/fs.js';
import { formatSuccess, format } from '../utils/format.js';

/**
 * Initialize configuration
 * @returns Exit code (0 = success)
 */
export async function cmdInit(): Promise<number> {
  const config = new ConfigManager();
  await config.init();
  await config.save();

  formatSuccess('Configuration initialized at', getUserHome() + '/.agent-speech/config.json');
  format('Global settings:');
  const global = config.getGlobal();
  format('  enabled:', global.enabled);
  format('  voice:', global.voice);
  format('  rate:', global.rate);
  format('  volume:', global.volume);

  return 0;
}
