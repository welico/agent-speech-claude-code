#!/bin/bash
# Agent Speech Plugin — Notification Hook
# Speaks Claude Code notification messages via macOS TTS
# Follows the same pattern as stop-hook.sh (ralph-loop convention)

set -euo pipefail

# Read hook input from stdin
HOOK_INPUT=$(cat)

# Extract notification message
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null || echo "")

# Skip if empty or too short (< 5 chars)
if [[ -z "$MESSAGE" ]] || [[ ${#MESSAGE} -lt 5 ]]; then
  exit 0
fi

# Limit to 200 characters for notifications
if [[ ${#MESSAGE} -gt 200 ]]; then
  MESSAGE="${MESSAGE:0:200}"
fi

# Speak using macOS built-in TTS (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
