import { TTSConfig, VoiceInfo } from '../types/index.js';
/**
 * Text-to-Speech engine
 * Orchestrates content filtering and speech synthesis
 */
export declare class TextToSpeech {
    private say;
    private filter;
    private enabled;
    private logger;
    constructor();
    /**
     * Speak text with given configuration
     * @param text - Text to speak
     * @param config - TTS configuration
     * @returns Promise that resolves when speech starts
     */
    speak(text: string, config: TTSConfig): Promise<void>;
    /**
     * Stop current speech immediately
     */
    stop(): void;
    /**
     * Get list of available voices
     * @returns List of available voice information
     */
    getAvailableVoices(): Promise<VoiceInfo[]>;
    /**
     * Check if currently speaking
     * @returns True if speech is in progress
     */
    isSpeaking(): boolean;
    /**
     * Enable/disable TTS globally
     * @param enabled - Whether TTS should be enabled
     */
    setEnabled(enabled: boolean): void;
    /**
     * Check if TTS is enabled
     * @returns True if TTS is enabled
     */
    isEnabled(): boolean;
    /**
     * Filter text without speaking (for preview)
     * @param text - Text to filter
     * @param config - TTS configuration
     * @returns Filtered text
     */
    filterText(text: string, config: TTSConfig): string;
    /**
     * Check if text contains sensitive information
     * @param text - Text to check
     * @returns True if sensitive patterns detected
     */
    detectSensitive(text: string): boolean;
    /**
     * Remove code blocks from text
     * @param text - Text to process
     * @returns Text with code blocks removed
     */
    removeCodeBlocks(text: string): string;
}
//# sourceMappingURL=tts.d.ts.map