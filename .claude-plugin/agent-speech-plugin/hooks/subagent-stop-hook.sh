#!/bin/bash
# Agent Speech Plugin — Subagent Stop Hook
# Announces subagent task completion via macOS TTS
# Follows the same pattern as stop-hook.sh (ralph-loop convention)

set -euo pipefail

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

# Speak using macOS built-in TTS (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
