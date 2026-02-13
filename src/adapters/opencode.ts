/**
 * OpenCode Adapter
 * Integrates Agent Speech Plugin with OpenCode CLI
 *
 * NOTE: This is a stub adapter for future implementation.
 * OpenCode integration is planned but not yet implemented.
 */

import { CLIAdapter } from '../types/index.js';
import { ConfigManager } from '../core/config.js';

/**
 * Adapter for OpenCode integration
 * Placeholder for future OpenCode CLI support
 */
export class OpenCodeAdapter implements CLIAdapter {
  readonly name = 'opencode';

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
   * NOTE: OpenCode integration not yet implemented
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    // TODO: Implement OpenCode integration
    console.warn(`[OpenCode Adapter] Integration not yet implemented`);
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
