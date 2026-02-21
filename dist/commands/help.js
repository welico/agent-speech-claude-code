/**
 * Help command
 */
import { getUserHome } from '../infrastructure/fs.js';
import { format } from '../utils/format.js';
/**
 * Supported tools
 */
const TOOLS = ['claude-code', 'opencode', 'codex-cli', 'gemini-cli'];
/**
 * Show help message
 * @returns Exit code (0 = success)
 */
export function cmdHelp() {
    format('Agent Speech Plugin CLI');
    format('');
    format('Usage: agent-speech <command> [options]');
    format('');
    format('Commands:');
    format('  init                    Initialize configuration');
    format('  enable [tool]           Enable TTS for tool (default: claude-code)');
    format('  disable [tool]          Disable TTS for tool (default: claude-code)');
    format('  toggle [tool]           Toggle TTS on/off (default: claude-code)');
    format('  status                  Show configuration status');
    format('  set-voice <name>        Set voice (e.g., Samantha, Alex)');
    format('  set-rate <wpm>          Set speech rate (50-400)');
    format('  set-volume <0-100>      Set volume (0-100)');
    format('  list-voices             List available voices');
    format('  reset                   Reset to defaults');
    format('  language                Select language interactively');
    format('  mute [off]              Set mute duration or cancel mute');
    format('  help                    Show this help');
    format('');
    format('Tools:', TOOLS.join(', '));
    format('');
    format('Config location:', getUserHome() + '/.agent-speech/config.json');
    return 0;
}
//# sourceMappingURL=help.js.map