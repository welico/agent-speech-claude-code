/**
 * Gemini CLI Adapter
 * Integrates Agent Speech Plugin with Gemini CLI
 *
 * NOTE: This is a stub adapter for future implementation.
 * Gemini CLI integration is planned but not yet implemented.
 */

import { CLIAdapter } from '../types/index.js';
import { ConfigManager } from '../core/config.js';

/**
 * Adapter for Gemini CLI integration
 * Placeholder for future Gemini CLI support
 */
export class GeminiCLIAdapter implements CLIAdapter {
  readonly name = 'gemini-cli';

  private config: ConfigManager;
  private started: boolean = false;

  constructor() {
    this.config = new ConfigManager();
  }

  /**
   * Initialize the adapter
   */
  async init(): Promise<void> {
    await this.config.init();
  }

  /**
   * Start the adapter
   * NOTE: Gemini CLI integration not yet implemented
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    // TODO: Implement Gemini CLI integration
    console.warn(`[Gemini CLI Adapter] Integration not yet implemented`);
    this.started = true;
  }

  /**
   * Stop the adapter
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    this.started = false;
  }

  /**
   * Check if adapter is enabled
   */
  isEnabled(): boolean {
    return this.config.isToolEnabled(this.name);
  }
}
