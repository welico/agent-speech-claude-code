import { TTSConfig, VoiceInfo } from '../types/index.js';
/**
 * Process callback for handling process events
 */
interface ProcessCallbacks {
    onClose?: (code: number | null) => void;
    onError?: (error: Error) => void;
}
/**
 * macOS say command wrapper for text-to-speech
 */
export declare class SayCommand {
    private currentProcess;
    /**
     * Speak text using macOS say command
     * @param text - Text to speak
     * @param config - TTS configuration
     * @param callbacks - Optional process event callbacks
     * @returns Promise that resolves when speech completes
     */
    speak(text: string, config: TTSConfig, callbacks?: ProcessCallbacks): Promise<void>;
    /**
     * Stop current speech
     */
    stop(): void;
    /**
     * Check if currently speaking
     */
    isSpeaking(): boolean;
    /**
     * Get list of available voices
     */
    getAvailableVoices(): Promise<VoiceInfo[]>;
    /**
     * Speak multiple text chunks sequentially
     */
    private speakChunks;
    /**
     * Build command line arguments for say command
     */
    private buildArgs;
    /**
     * Split text into chunks respecting max length
     */
    private splitText;
    /**
     * Execute say command and get output
     */
    private execSay;
    /**
     * Parse voice list from say command output
     */
    private parseVoices;
    /**
     * Get default voice list (fallback if parsing fails)
     */
    private getDefaultVoices;
}
export {};
//# sourceMappingURL=say.d.ts.map