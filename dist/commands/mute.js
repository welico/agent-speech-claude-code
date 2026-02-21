import { readJSON, writeJSON, getConfigDir } from '../infrastructure/fs.js';
import readline from 'readline';
import { existsSync } from 'fs';
import { promises } from 'fs';
const DURATION_OPTIONS = [
    { value: 1, label: '5 minutes', ms: 300000 },
    { value: 2, label: '10 minutes', ms: 600000 },
    { value: 3, label: '15 minutes', ms: 900000 },
    { value: 4, label: '30 minutes', ms: 1800000 },
    { value: 5, label: '1 hour', ms: 3600000 },
    { value: 6, label: '2 hours', ms: 7200000 },
    { value: 7, label: 'Permanent', ms: null },
];
const MUTE_PATH = `${getConfigDir()}/mute.json`;
export async function cmdMute(arg) {
    // Handle 'off' command
    if (arg === 'off') {
        if (existsSync(MUTE_PATH)) {
            promises.unlink(MUTE_PATH);
            console.log('✅ TTS un-muted');
        }
        else {
            console.log('ℹ️  TTS is not currently muted');
        }
        return 0;
    }
    // Check if already muted
    if (existsSync(MUTE_PATH)) {
        try {
            const muteData = await readJSON(MUTE_PATH);
            if (muteData.until === null) {
                console.log('ℹ️  TTS is currently muted permanently');
            }
            else {
                const now = new Date();
                const expiry = new Date(muteData.until);
                const remaining = expiry.getTime() - now.getTime();
                if (remaining > 0) {
                    const minutes = Math.floor(remaining / 60000);
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    if (hours > 0) {
                        console.log(`ℹ️  TTS is muted for ${hours} hour${hours > 1 ? 's' : ''} and ${mins} minute${mins > 1 ? 's' : ''}`);
                    }
                    else {
                        console.log(`ℹ️  TTS is muted for ${minutes} minute${minutes > 1 ? 's' : ''}`);
                    }
                }
                else {
                    // Mute expired, remove file
                    promises.unlink(MUTE_PATH);
                    console.log('ℹ️  Previous mute expired');
                }
            }
        }
        catch (error) {
            // Corrupt mute file, remove it
            promises.unlink(MUTE_PATH);
            console.log('ℹ️  Removed corrupt mute file');
        }
    }
    // Show duration menu
    console.log('\nSelect mute duration:');
    DURATION_OPTIONS.forEach((option, index) => {
        console.log(`  ${index + 1}. ${option.label}`);
    });
    console.log('Enter number [1-7]:');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    try {
        const answer = await new Promise((resolve) => {
            rl.question('> ', (input) => {
                resolve(input.trim());
            });
        });
        const selection = parseInt(answer);
        if (isNaN(selection) || selection < 1 || selection > 7) {
            console.error('Error: Please enter a number between 1 and 7');
            rl.close();
            return 1;
        }
        const selectedDuration = DURATION_OPTIONS[selection - 1];
        // Calculate expiry timestamp
        const now = new Date();
        let until = null;
        let duration;
        if (selectedDuration.ms === null) {
            // Permanent mute
            until = null;
            duration = 'permanent';
        }
        else {
            // Temporary mute
            const expiry = new Date(now.getTime() + selectedDuration.ms);
            until = expiry.toISOString();
            duration = selectedDuration.label.toLowerCase();
        }
        // Write mute state
        await writeJSON(MUTE_PATH, {
            until,
            duration,
        });
        console.log(`\n✅ TTS muted ${duration === 'permanent' ? 'permanently' : `for ${selectedDuration.label}`}`);
        rl.close();
        return 0;
    }
    catch (error) {
        console.error('Error:', error instanceof Error ? error.message : String(error));
        rl.close();
        return 1;
    }
}
//# sourceMappingURL=mute.js.map