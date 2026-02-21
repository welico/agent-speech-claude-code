/**
 * Reset configuration command
 */
import { ConfigManager } from '../core/config.js';
import { formatSuccess } from '../utils/format.js';
/**
 * Reset configuration to defaults
 * @returns Exit code (0 = success)
 */
export async function cmdReset() {
    const config = new ConfigManager();
    await config.init();
    // Re-initialize creates defaults
    await config.init();
    await config.save();
    formatSuccess('Configuration reset to defaults');
    return 0;
}
//# sourceMappingURL=reset.js.map