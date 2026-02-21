import * as esbuild from 'esbuild';
import { copyFile, readFile, writeFile } from 'fs/promises';

async function bundle() {
  try {
    console.log('Bundling MCP server...');

    await esbuild.build({
      entryPoints: ['src/infrastructure/mcp-server.ts'],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: 'dist/mcp-server.bundle.js',
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = require('path').dirname(__filename);
        `.trim(),
      },
    });

    // Create a wrapper that properly starts the bundled server
    const wrapper = `/**
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
`;

    await writeFile('dist/mcp-server.js', wrapper);
    console.log('✅ Bundle created: dist/mcp-server.bundle.js');
    console.log('✅ Entry point updated: dist/mcp-server.js');
  } catch (error) {
    console.error('❌ Bundling failed:', error);
    process.exit(1);
  }
}

bundle();
