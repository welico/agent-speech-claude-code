#!/bin/bash
# Agent Speech Plugin — Subagent Stop Hook
# Announces subagent task completion via macOS TTS

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

# Extract subagent type
AGENT_TYPE=$(echo "$HOOK_INPUT" | jq -r '.subagent_type // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$AGENT_TYPE" ]]; then
  MESSAGE="Subagent ${AGENT_TYPE} completed"
else
  MESSAGE="Subagent task completed"
fi

# Translate message if language is configured
MSG=$(translate "$MESSAGE")

# Speak using macOS built-in TTS (background, non-blocking)
say -v "$VOICE" -r "$RATE" "$MSG" &

exit 0
