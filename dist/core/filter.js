/**
 * Patterns for detecting sensitive information
 */
const SENSITIVE_PATTERNS = [
    // API keys
    /(?:api[_-]?key|apikey|api-key)['":\s]*([a-zA-Z0-9_\-]{20,})/gi,
    // Passwords
    /(?:password|passwd|pwd)['":\s]*([^\s,;]{6,})/gi,
    // Tokens (JWT, Bearer, etc.)
    /(?:token|bearer|auth)['":\s]*([a-zA-Z0-9._\-]{20,})/gi,
    // Secret keys
    /(?:secret|private[_-]?key|privatekey)['":\s]*([a-zA-Z0-9_\-]{20,})/gi,
    // AWS keys
    /AKIA[0-9A-Z]{16}/g,
    // Generic base64 strings (likely encoded data)
    /(?:["']?)([A-Za-z0-9+/]{40,}={0,2})(?:["']?\s*(?:,|\)|}))/g,
];
/**
 * Code block patterns (markdown, shell, etc.)
 */
const CODE_BLOCK_PATTERNS = [
    /```[\s\S]*?```/g, // Markdown code blocks
    /`[^`]+`/g, // Inline code
    /\$[^$]+$/g, // Shell commands
    /^[\s]*[>\$].+$/gm, // Terminal prompt lines
];
/**
 * Command output patterns
 */
const COMMAND_OUTPUT_PATTERNS = [
    /^[+\-]{3,}$/gm, // Diff/output separators
    /^\s*(BUILD|FAILED|SUCCESS|INFO|DEBUG|WARN|ERROR)\b/gm,
];
/**
 * Content filter for text-to-speech
 * Filters sensitive information, code blocks, and command outputs
 */
export class ContentFilter {
    /**
     * Filter text based on configuration
     * @param text - Text to filter
     * @param config - TTS configuration with filter settings
     * @returns Filter result with whether to speak and sanitized text
     */
    filter(text, config) {
        let filteredText = text;
        // Check minimum length
        if (config.minLength > 0 && text.length < config.minLength) {
            return {
                shouldSpeak: false,
                text: '',
                reason: `Text length (${text.length}) is below minimum (${config.minLength})`,
            };
        }
        // Check maximum length
        if (config.maxLength > 0 && text.length > config.maxLength) {
            return {
                shouldSpeak: false,
                text: '',
                reason: `Text length (${text.length}) exceeds maximum (${config.maxLength})`,
            };
        }
        // Filter sensitive information
        if (config.filters.sensitive) {
            filteredText = this.filterSensitive(filteredText);
        }
        // Skip code blocks
        if (config.filters.skipCodeBlocks) {
            filteredText = this.removeCodeBlocks(filteredText);
        }
        // Skip command outputs
        if (config.filters.skipCommands) {
            filteredText = this.removeCommandOutputs(filteredText);
        }
        // Clean up whitespace
        filteredText = this.cleanupWhitespace(filteredText);
        return {
            shouldSpeak: filteredText.trim().length > 0,
            text: filteredText,
        };
    }
    /**
     * Detect if text contains sensitive information
     * @param text - Text to check
     * @returns True if sensitive patterns detected
     */
    detectSensitive(text) {
        const lowerText = text.toLowerCase();
        for (const pattern of SENSITIVE_PATTERNS) {
            if (pattern.test(text)) {
                return true;
            }
        }
        // Check for obvious password/sensitive keywords
        const sensitiveKeywords = [
            'password', 'passwd', 'pwd',
            'secret', 'private key',
            'api key', 'apikey',
            'access token', 'auth token',
            'bearer token',
        ];
        for (const keyword of sensitiveKeywords) {
            if (lowerText.includes(keyword)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Remove code blocks from text
     * @param text - Text to process
     * @returns Text with code blocks removed
     */
    removeCodeBlocks(text) {
        let result = text;
        for (const pattern of CODE_BLOCK_PATTERNS) {
            result = result.replace(pattern, '');
        }
        return result;
    }
    /**
     * Remove command output patterns
     * @param text - Text to process
     * @returns Text with command outputs removed
     */
    removeCommandOutputs(text) {
        let result = text;
        for (const pattern of COMMAND_OUTPUT_PATTERNS) {
            result = result.replace(pattern, '');
        }
        return result;
    }
    /**
     * Filter sensitive information by replacing with placeholders
     * @param text - Text to sanitize
     * @returns Sanitized text
     */
    filterSensitive(text) {
        let result = text;
        for (const pattern of SENSITIVE_PATTERNS) {
            result = result.replace(pattern, (_match, _group1) => {
                return '[REDACTED]';
            });
        }
        // Also redact lines that look like config exports
        result = result.replace(/^export\s+\w+\s*=\s*['"][\w\-]+['"]/gm, 'export $1 = "[REDACTED]"');
        return result;
    }
    /**
     * Clean up extra whitespace
     * @param text - Text to clean
     * @returns Cleaned text
     */
    cleanupWhitespace(text) {
        return text
            .replace(/\n{3,}/g, '\n\n') // Multiple newlines to double
            .replace(/[ \t]+/g, ' ') // Multiple spaces to single
            .replace(/^\s+|\s+$/gm, ''); // Trim lines
    }
}
//# sourceMappingURL=filter.js.map