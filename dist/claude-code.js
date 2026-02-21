/**
 * Claude Code Integration
 * Direct integration with Claude Code via MCP server
 */
import { MCPServer } from './infrastructure/mcp-server.js';
import { ConfigManager } from './core/config.js';
/**
 * Claude Code integration class
 * Manages MCP server and configuration for Claude Code
 */
export class ClaudeCodeIntegration {
    mcpServer;
    config;
    started = false;
    constructor() {
        this.mcpServer = new MCPServer();
        this.config = new ConfigManager();
    }
    /**
     * Initialize the integration
     */
    async init() {
        await this.config.init();
        await this.mcpServer.init();
    }
    /**
     * Start the MCP server
     */
    async start() {
        if (this.started) {
            return;
        }
        await this.mcpServer.start();
        this.started = true;
    }
    /**
     * Stop the MCP server
     */
    async stop() {
        if (!this.started) {
            return;
        }
        await this.mcpServer.stop();
        this.started = false;
    }
    /**
     * Check if TTS is enabled
     */
    isEnabled() {
        return this.config.get('enabled');
    }
}
//# sourceMappingURL=claude-code.js.map