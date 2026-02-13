/**
 * Claude Code Adapter
 * Integrates Agent Speech Plugin with Claude Code CLI via MCP
 */

import { CLIAdapter } from '../types/index.js';
import { MCPServer } from '../infrastructure/mcp-server.js';
import { ConfigManager } from '../core/config.js';

/**
 * Adapter for Claude Code integration
 * Uses MCP server to expose TTS functionality
 */
export class ClaudeCodeAdapter implements CLIAdapter {
  readonly name = 'claude-code';

  private mcpServer: MCPServer;
  private config: ConfigManager;
  private started: boolean = false;

  constructor() {
    this.mcpServer = new MCPServer();
    this.config = new ConfigManager();
  }

  /**
   * Initialize the adapter
   */
  async init(): Promise<void> {
    await this.config.init();
    await this.mcpServer.init();
  }

  /**
   * Start the adapter (MCP server)
   */
  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    await this.mcpServer.start();
    this.started = true;
  }

  /**
   * Stop the adapter
   */
  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.mcpServer.stop();
    this.started = false;
  }

  /**
   * Check if adapter is enabled
   */
  isEnabled(): boolean {
    return this.config.isToolEnabled(this.name);
  }
}
