#!/bin/bash
# MCP Inspector launcher for agent-speech-plugin
#
# This script launches the MCP Inspector, a browser-based debugging tool
# for Model Context Protocol servers. It allows you to:
# - List available tools
# - Invoke tools with custom input
# - View real-time protocol messages
# - Inspect response format
#
# Usage: ./scripts/inspect.sh

set -e

echo "======================================"
echo "  MCP Inspector - agent-speech-plugin"
echo "======================================"
echo ""
echo "Available tools:"
echo "  - speak_text: Convert text to speech using macOS TTS"
echo ""
echo "Input schema for speak_text:"
echo "  {"
echo "    \"text\": \"string (required)\","
echo "    \"voice\": \"string (optional, e.g., Samantha, Alex)\","
echo "    \"rate\": \"number (optional, 50-400 WPM)\","
echo "    \"volume\": \"number (optional, 0-100)\""
echo "  }"
echo ""
echo "Browser will open to http://localhost:5173"
echo "Press Ctrl+C to stop the inspector"
echo ""
echo "======================================"

# Check if dist/mcp-server.js exists
if [ ! -f "dist/mcp-server.js" ]; then
  echo "Error: dist/mcp-server.js not found"
  echo "Please run 'pnpm build' first"
  exit 1
fi

# Launch MCP Inspector
npx @modelcontextprotocol/inspector node dist/mcp-server.js
