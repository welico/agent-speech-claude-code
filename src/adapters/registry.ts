/**
 * Adapter Registry
 * Manages registration and lifecycle of CLI adapters
 */

import { CLIAdapter } from '../types/index.js';
import { ClaudeCodeAdapter } from './claude-code.js';
import { OpenCodeAdapter } from './opencode.js';
import { CodexCLIAdapter } from './codex-cli.js';
import { GeminiCLIAdapter } from './gemini-cli.js';

/**
 * Registry for all CLI tool adapters
 */
export class AdapterRegistry {
  private adapters: Map<string, CLIAdapter> = new Map();
  private initialized: boolean = false;

  /**
   * Create a new adapter registry
   */
  constructor() {
    this.registerDefaultAdapters();
  }

  /**
   * Register default adapters
   */
  private registerDefaultAdapters(): void {
    this.register(new ClaudeCodeAdapter());
    this.register(new OpenCodeAdapter());
    this.register(new CodexCLIAdapter());
    this.register(new GeminiCLIAdapter());
  }

  /**
   * Register an adapter
   * @param adapter - Adapter to register
   */
  register(adapter: CLIAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Unregister an adapter
   * @param name - Adapter name to unregister
   */
  unregister(name: string): void {
    this.adapters.delete(name);
  }

  /**
   * Get an adapter by name
   * @param name - Adapter name
   * @returns Adapter or undefined if not found
   */
  get(name: string): CLIAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Check if an adapter is registered
   * @param name - Adapter name
   * @returns True if adapter exists
   */
  has(name: string): boolean {
    return this.adapters.has(name);
  }

  /**
   * Get all registered adapters
   * @returns Map of all adapters
   */
  getAll(): Map<string, CLIAdapter> {
    return new Map(this.adapters);
  }

  /**
   * Get all enabled adapters
   * @returns Array of enabled adapters
   */
  getEnabled(): CLIAdapter[] {
    return Array.from(this.adapters.values()).filter(
      (adapter) => adapter.isEnabled()
    );
  }

  /**
   * Initialize all adapters
   */
  async initAll(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.init()
    );

    await Promise.all(initPromises);
    this.initialized = true;
  }

  /**
   * Start all enabled adapters
   */
  async startEnabled(): Promise<void> {
    const enabled = this.getEnabled();

    await Promise.all(enabled.map((adapter) => adapter.start()));
  }

  /**
   * Stop all running adapters
   */
  async stopAll(): Promise<void> {
    const stopPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.stop().catch((error) => {
        console.error(`[Adapter Registry] Error stopping ${adapter.name}:`, error);
      })
    );

    await Promise.all(stopPromises);
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get list of registered adapter names
   * @returns Array of adapter names
   */
  getAdapterNames(): string[] {
    return Array.from(this.adapters.keys());
  }
}
