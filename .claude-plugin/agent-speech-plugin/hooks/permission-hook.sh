#!/bin/bash
# Agent Speech Plugin — Permission Request Hook
# Announces when Claude Code requests tool execution permission via macOS TTS
# Follows the same pattern as stop-hook.sh (ralph-loop convention)

set -euo pipefail

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$TOOL_NAME" ]]; then
  MESSAGE="Permission required for ${TOOL_NAME}"
else
  MESSAGE="Permission required"
fi

# Speak using macOS built-in TTS (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
