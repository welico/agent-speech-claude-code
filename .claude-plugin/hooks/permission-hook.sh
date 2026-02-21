#!/bin/bash
# Agent Speech Plugin — Permission Request Hook
# Announces when Claude Code requests tool execution permission via macOS TTS

set -euo pipefail

# Load user config (voice, rate, volume, summary settings, language, mute state)
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

# Skip TTS if muted
if [[ "$IS_MUTED" == "true" ]]; then
  exit 0
fi

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

# Translate message if language is configured
MSG=$(translate "$MESSAGE")

# Speak using macOS built-in TTS (background, non-blocking)
say -v "$VOICE" -r "$RATE" "$MSG" &

exit 0
