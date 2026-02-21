/**
 * Claude Code Integration
 * Direct integration with Claude Code via MCP server
 */
/**
 * Claude Code integration class
 * Manages MCP server and configuration for Claude Code
 */
export declare class ClaudeCodeIntegration {
    private mcpServer;
    private config;
    private started;
    constructor();
    /**
     * Initialize the integration
     */
    init(): Promise<void>;
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    /**
     * Check if TTS is enabled
     */
    isEnabled(): boolean;
}
//# sourceMappingURL=claude-code.d.ts.map