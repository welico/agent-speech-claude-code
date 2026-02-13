import { TTSConfig, VoiceInfo } from '../types/index.js';
import { SayCommand } from '../infrastructure/say.js';
import { ContentFilter } from './filter.js';

/**
 * Text-to-Speech engine
 * Orchestrates content filtering and speech synthesis
 */
export class TextToSpeech {
  private say: SayCommand;
  private filter: ContentFilter;
  private enabled: boolean = true;

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
  async speak(text: string, config: TTSConfig): Promise<void> {
    // Check if globally enabled
    if (!config.enabled || !this.enabled) {
      return;
    }

    // Apply content filtering
    const { shouldSpeak, text: filteredText, reason } = this.filter.filter(text, config);

    if (!shouldSpeak) {
      // Silently skip with log
      console.debug(`[TTS] Skipping speech: ${reason || 'no content after filtering'}`);
      return;
    }

    // Start speech (runs in background)
    await this.say.speak(filteredText, config, {
      onClose: (code) => {
        if (code !== 0) {
          console.error(`[TTS] Speech process exited with code ${code}`);
        }
      },
      onError: (error) => {
        console.error(`[TTS] Speech error:`, error);
      },
    });
  }

  /**
   * Stop current speech immediately
   */
  stop(): void {
    this.say.stop();
  }

  /**
   * Get list of available voices
   * @returns List of available voice information
   */
  async getAvailableVoices(): Promise<VoiceInfo[]> {
    return this.say.getAvailableVoices();
  }

  /**
   * Check if currently speaking
   * @returns True if speech is in progress
   */
  isSpeaking(): boolean {
    return this.say.isSpeaking();
  }

  /**
   * Enable/disable TTS globally
   * @param enabled - Whether TTS should be enabled
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if TTS is enabled
   * @returns True if TTS is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Filter text without speaking (for preview)
   * @param text - Text to filter
   * @param config - TTS configuration
   * @returns Filtered text
   */
  filterText(text: string, config: TTSConfig): string {
    const { text: filtered } = this.filter.filter(text, config);
    return filtered;
  }

  /**
   * Check if text contains sensitive information
   * @param text - Text to check
   * @returns True if sensitive patterns detected
   */
  detectSensitive(text: string): boolean {
    return this.filter.detectSensitive(text);
  }

  /**
   * Remove code blocks from text
   * @param text - Text to process
   * @returns Text with code blocks removed
   */
  removeCodeBlocks(text: string): string {
    return this.filter.removeCodeBlocks(text);
  }
}
