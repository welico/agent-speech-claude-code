/**
 * Codex CLI Adapter
 * Integrates Agent Speech Plugin with Codex CLI
 *
 * NOTE: This is a stub adapter for future implementation.
 * Codex CLI integration is planned but not yet implemented.
 */

import { CLIAdapter } from '../types/index.js';
import { ConfigManager } from '../core/config.js';

/**
 * Adapter for Codex CLI integration
 * Placeholder for future Codex CLI support
 */
export class CodexCLIAdapter implements CLIAdapter {
  readonly name = 'codex-cli';

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
   * NOTE: Codex CLI integration not yet implemented
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    // TODO: Implement Codex CLI integration
    console.warn(`[Codex CLI Adapter] Integration not yet implemented`);
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
