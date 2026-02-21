import { SayCommand } from '../infrastructure/say.js';
import { ContentFilter } from './filter.js';
import { createLogger } from '../utils/logger.js';
import { withErrorHandling } from '../utils/error-handler.js';
/**
 * Text-to-Speech engine
 * Orchestrates content filtering and speech synthesis
 */
export class TextToSpeech {
    say;
    filter;
    enabled = true;
    logger = createLogger({ prefix: '[TTS]' });
    constructor() {
        this.say = new SayCommand();
        this.filter = new ContentFilter();
    }
    /**
     * Speak text with given configuration
     * @param text - Text to speak
     * @param config - TTS configuration
     * @returns Promise that resolves when speech starts
     */
    async speak(text, config) {
        return withErrorHandling('speak', async () => {
            this.logger.debug('Starting speech', { textLength: text.length, config });
            // Check if globally enabled
            if (!config.enabled || !this.enabled) {
                this.logger.debug('Speech disabled', { configEnabled: config.enabled, globalEnabled: this.enabled });
                return;
            }
            // Apply content filtering
            const { shouldSpeak, text: filteredText, reason } = this.filter.filter(text, config);
            if (!shouldSpeak) {
                this.logger.debug('Skipping speech', { reason });
                return;
            }
            this.logger.debug('Filtered text', { originalLength: text.length, filteredLength: filteredText.length });
            // Start speech (runs in background)
            await this.say.speak(filteredText, config, {
                onClose: (code) => {
                    if (code !== 0) {
                        this.logger.error('Speech process exited with non-zero code', { code });
                    }
                },
                onError: (error) => {
                    this.logger.error('Speech error', error);
                },
            });
            this.logger.debug('Speech started');
        }, this.logger);
    }
    /**
     * Stop current speech immediately
     */
    stop() {
        this.say.stop();
    }
    /**
     * Get list of available voices
     * @returns List of available voice information
     */
    async getAvailableVoices() {
        return this.say.getAvailableVoices();
    }
    /**
     * Check if currently speaking
     * @returns True if speech is in progress
     */
    isSpeaking() {
        return this.say.isSpeaking();
    }
    /**
     * Enable/disable TTS globally
     * @param enabled - Whether TTS should be enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    /**
     * Check if TTS is enabled
     * @returns True if TTS is enabled
     */
    isEnabled() {
        return this.enabled;
    }
    /**
     * Filter text without speaking (for preview)
     * @param text - Text to filter
     * @param config - TTS configuration
     * @returns Filtered text
     */
    filterText(text, config) {
        const { text: filtered } = this.filter.filter(text, config);
        return filtered;
    }
    /**
     * Check if text contains sensitive information
     * @param text - Text to check
     * @returns True if sensitive patterns detected
     */
    detectSensitive(text) {
        return this.filter.detectSensitive(text);
    }
    /**
     * Remove code blocks from text
     * @param text - Text to process
     * @returns Text with code blocks removed
     */
    removeCodeBlocks(text) {
        return this.filter.removeCodeBlocks(text);
    }
}
//# sourceMappingURL=tts.js.map