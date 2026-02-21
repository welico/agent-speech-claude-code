/**
 * Toggle TTS command
 */
import { ConfigManager } from '../core/config.js';
import { formatSuccess, formatInfo } from '../utils/format.js';
/**
 * Toggle TTS on/off
 * @returns Exit code (0 = success)
 */
export async function cmdToggle() {
    const config = new ConfigManager();
    await config.init();
    const current = config.get('enabled');
    const newState = !current;
    config.set('enabled', newState);
    await config.save();
    if (newState) {
        formatSuccess('TTS enabled');
    }
    else {
        formatInfo('TTS disabled');
    }
    return 0;
}
//# sourceMappingURL=toggle.js.map