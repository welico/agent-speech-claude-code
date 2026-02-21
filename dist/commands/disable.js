/**
 * Disable TTS command
 */
import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';
/**
 * Disable TTS
 * @returns Exit code (0 = success)
 */
export async function cmdDisable() {
    const config = new ConfigManager();
    await config.init();
    config.set('enabled', false);
    await config.save();
    formatSuccess('TTS disabled');
    return 0;
}
//# sourceMappingURL=disable.js.map