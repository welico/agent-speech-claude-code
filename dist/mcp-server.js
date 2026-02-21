/**
 * MCP Server entry point
 * This file is executed by Claude Code when the MCP server is registered
 */
import { ClaudeCodeIntegration } from './claude-code.js';
/**
 * Main entry point for MCP server
 * Called via: node dist/mcp-server.js
 */
async function main() {
    const integration = new ClaudeCodeIntegration();
    await integration.init();
    // Handle shutdown gracefully
    const shutdown = async () => {
        await integration.stop();
        process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    // Start the server (blocks until killed)
    await integration.start();
}
// Start the server
main().catch((error) => {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
});
//# sourceMappingURL=mcp-server.js.map