/**
 * Set voice command
 */

import { ConfigManager } from '../core/config.js';
import { formatError, formatSuccess } from '../utils/format.js';

/**
 * Set voice
 * @param voice - Voice name
 * @returns Exit code (0 = success, 1 = error)
 */
export async function cmdSetVoice(voice?: string): Promise<number> {
  if (!voice) {
    formatError('Voice name is required');
    return 1;
  }

  const config = new ConfigManager();
  await config.init();

  config.setGlobal('voice', voice);
  await config.save();

  formatSuccess(`Voice set to ${voice}`);
  return 0;
}
