/**
 * MCP Server Bundle Entry Point
 * Bundled with esbuild to include all dependencies except @modelcontextprotocol/sdk
 */
import { MCPServer } from './mcp-server.bundle.js';
import { ConfigManager } from './core/config.js';

async function main() {
  const integration = new MCPServer();
  const config = new ConfigManager();

  await config.init();
  await integration.init();

  const shutdown = async () => {
    await integration.stop();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await integration.start();
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
