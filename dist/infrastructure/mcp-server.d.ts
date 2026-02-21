/**
 * MCP Server for Agent Speech Plugin
 * Exposes TTS functionality as an MCP tool
 */
export declare class MCPServer {
    private server;
    private tts;
    private config;
    private logger;
    constructor();
    /**
     * Initialize the MCP server
     */
    init(): Promise<void>;
    /**
     * Start the MCP server with stdio transport
     */
    start(): Promise<void>;
    /**
     * Stop the MCP server
     */
    stop(): Promise<void>;
    /**
     * Setup MCP handlers
     */
    private setupHandlers;
    /**
     * Setup tool listing
     */
    private setupToolListing;
    /**
     * Get tool input schema
     */
    private getToolInputSchema;
    /**
     * Handle speak_text tool call
     */
    private handleSpeak;
}
/**
 * Create and start MCP server (entry point for MCP server mode)
 */
export declare function createMCPServer(): Promise<MCPServer>;
//# sourceMappingURL=mcp-server.d.ts.map