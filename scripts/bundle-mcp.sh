#!/bin/bash
# Bundle MCP server with esbuild

echo "Bundling MCP server..."

npx esbuild src/infrastructure/mcp-server.ts \
  --bundle \
  --platform=node \
  --target=node18 \
  --format=esm \
  --outfile=dist/mcp-server.bundle.js \
  --external:@modelcontextprotocol/sdk \
  --banner:js="import { createRequire as _createRequire } from 'module'; import { fileURLToPath as _fileURLToPath } from 'url'; const require = _createRequire(import.meta.url); const __filename = _fileURLToPath(import.meta.url); const __dirname = require('path').dirname(__filename);"

echo "✅ Bundle created: dist/mcp-server.bundle.js"
