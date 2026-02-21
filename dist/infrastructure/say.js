import { spawn } from 'child_process';
/**
 * Maximum text length per say command (macOS limitation)
 */
const MAX_TEXT_LENGTH = 1000;
/**
 * macOS say command wrapper for text-to-speech
 */
export class SayCommand {
    currentProcess = null;
    /**
     * Speak text using macOS say command
     * @param text - Text to speak
     * @param config - TTS configuration
     * @param callbacks - Optional process event callbacks
     * @returns Promise that resolves when speech completes
     */
    speak(text, config, callbacks) {
        // Stop any current speech
        this.stop();
        // Split text if too long
        const chunks = this.splitText(text, config.maxLength);
        if (chunks.length === 0) {
            return Promise.resolve();
        }
        // Speak each chunk sequentially
        return this.speakChunks(chunks, config, callbacks);
    }
    /**
     * Stop current speech
     */
    stop() {
        if (this.currentProcess) {
            this.currentProcess.kill('SIGTERM');
            this.currentProcess = null;
        }
    }
    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.currentProcess !== null;
    }
    /**
     * Get list of available voices
     */
    async getAvailableVoices() {
        try {
            const result = await this.execSay(['-v', '?']);
            return this.parseVoices(result);
        }
        catch {
            // Fallback to default list if command fails
            return this.getDefaultVoices();
        }
    }
    /**
     * Speak multiple text chunks sequentially
     */
    speakChunks(chunks, config, callbacks) {
        let index = 0;
        const speakNext = () => {
            if (index >= chunks.length) {
                return Promise.resolve();
            }
            const chunk = chunks[index++];
            return new Promise((resolve, reject) => {
                const args = this.buildArgs(chunk, config);
                this.currentProcess = spawn('say', args, {
                    stdio: 'ignore',
                });
                if (!this.currentProcess) {
                    reject(new Error('Failed to spawn say process'));
                    return;
                }
                this.currentProcess.on('close', (code) => {
                    this.currentProcess = null;
                    callbacks?.onClose?.(code);
                    if (code === 0) {
                        speakNext().then(resolve).catch(reject);
                    }
                    else {
                        reject(new Error(`say exited with code ${code}`));
                    }
                });
                this.currentProcess.on('error', (error) => {
                    this.currentProcess = null;
                    callbacks?.onError?.(error);
                    reject(error);
                });
            });
        };
        return speakNext();
    }
    /**
     * Build command line arguments for say command
     */
    buildArgs(text, config) {
        const args = [];
        // Voice selection
        if (config.voice) {
            args.push('-v', config.voice);
        }
        // Speech rate (words per minute)
        if (config.rate && config.rate !== 200) {
            args.push('-r', config.rate.toString());
        }
        // Volume (0-100, mapped to 0.0-1.0 for say)
        if (config.volume !== undefined && config.volume !== 50) {
            args.push('-a', (config.volume / 100).toString());
        }
        // Text to speak
        args.push(text);
        return args;
    }
    /**
     * Split text into chunks respecting max length
     */
    splitText(text, maxLength) {
        // Apply maxLength limit if set
        const effectiveMax = maxLength > 0 ? Math.min(maxLength, MAX_TEXT_LENGTH) : MAX_TEXT_LENGTH;
        if (text.length <= effectiveMax) {
            return [text];
        }
        const chunks = [];
        let remaining = text;
        while (remaining.length > 0) {
            // Try to split at sentence boundary
            let splitIndex = effectiveMax;
            // Look for sentence endings in the last 100 characters
            const searchRange = Math.min(effectiveMax, remaining.length);
            const searchStart = Math.max(0, effectiveMax - 100);
            for (let i = searchRange - 1; i >= searchStart; i--) {
                const char = remaining[i];
                if (char === '.' || char === '!' || char === '?') {
                    // Check if next character is space or end
                    if (i + 1 >= remaining.length || remaining[i + 1] === ' ' || remaining[i + 1] === '\n') {
                        splitIndex = i + 1;
                        break;
                    }
                }
            }
            // Fallback to word boundary
            if (splitIndex === effectiveMax) {
                for (let i = effectiveMax - 1; i >= effectiveMax - 50; i--) {
                    const char = remaining[i];
                    if (char === ' ' || char === '\n') {
                        splitIndex = i + 1;
                        break;
                    }
                }
            }
            chunks.push(remaining.slice(0, splitIndex).trim());
            remaining = remaining.slice(splitIndex).trim();
        }
        return chunks.filter(chunk => chunk.length > 0);
    }
    /**
     * Execute say command and get output
     */
    async execSay(args) {
        return new Promise((resolve, reject) => {
            const process = spawn('say', args);
            const chunks = [];
            process.stdout?.on('data', (chunk) => chunks.push(chunk));
            process.stderr?.on('data', (chunk) => chunks.push(chunk));
            process.on('close', (code) => {
                if (code === 0) {
                    resolve(Buffer.concat(chunks).toString('utf-8'));
                }
                else {
                    reject(new Error(`say command failed with code ${code}`));
                }
            });
            process.on('error', reject);
        });
    }
    /**
     * Parse voice list from say command output
     */
    parseVoices(output) {
        const lines = output.split('\n');
        const voices = [];
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                continue;
            }
            // Parse format: "Name    Display Name    Language"
            const match = trimmed.match(/^(\S+)\s+(.+?)\s+([a-z]{2}-[A-Z]{2})/);
            if (match) {
                voices.push({
                    name: match[1],
                    displayName: match[2].trim(),
                    language: match[3],
                });
            }
        }
        return voices;
    }
    /**
     * Get default voice list (fallback if parsing fails)
     */
    getDefaultVoices() {
        return [
            { name: 'Samantha', displayName: 'Samantha', language: 'en-US' },
            { name: 'Alex', displayName: 'Alex', language: 'en-US' },
            { name: 'Victoria', displayName: 'Victoria', language: 'en-US' },
            { name: 'Fred', displayName: 'Fred', language: 'en-US' },
            { name: 'Junior', displayName: 'Junior', language: 'en-US' },
            { name: 'Rishi', displayName: 'Rishi', language: 'en-IN' },
            { name: 'Tessa', displayName: 'Tessa', language: 'en-GB' },
            { name: 'Daniel', displayName: 'Daniel', language: 'en-GB' },
            { name: 'Karen', displayName: 'Karen', language: 'en-AU' },
            { name: 'Moira', displayName: 'Moira', language: 'en-IE' },
        ];
    }
}
//# sourceMappingURL=say.js.map