import { TTSConfig, FilterResult } from '../types/index.js';
/**
 * Content filter for text-to-speech
 * Filters sensitive information, code blocks, and command outputs
 */
export declare class ContentFilter {
    /**
     * Filter text based on configuration
     * @param text - Text to filter
     * @param config - TTS configuration with filter settings
     * @returns Filter result with whether to speak and sanitized text
     */
    filter(text: string, config: TTSConfig): FilterResult;
    /**
     * Detect if text contains sensitive information
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
    /**
     * Remove command output patterns
     * @param text - Text to process
     * @returns Text with command outputs removed
     */
    removeCommandOutputs(text: string): string;
    /**
     * Filter sensitive information by replacing with placeholders
     * @param text - Text to sanitize
     * @returns Sanitized text
     */
    private filterSensitive;
    /**
     * Clean up extra whitespace
     * @param text - Text to clean
     * @returns Cleaned text
     */
    private cleanupWhitespace;
}
//# sourceMappingURL=filter.d.ts.map