/**
 * MCP Server entry point
 * This file is executed by Claude Code when the MCP server is registered
 */

import { AdapterRegistry } from './adapters/registry.js';

/**
 * Main entry point for MCP server
 * Called via: node dist/mcp-server.js
 */
async function main(): Promise<void> {
  const registry = new AdapterRegistry();
  await registry.initAll();

  // Get the Claude Code adapter and start it
  const claudeCodeAdapter = registry.get('claude-code');
  if (!claudeCodeAdapter) {
    console.error('[MCP] Claude Code adapter not found');
    process.exit(1);
  }

  // Handle shutdown gracefully
  const shutdown = async () => {
    await registry.stopAll();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Start the server (blocks until killed)
  await claudeCodeAdapter.start();
}

// Start the server
main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
