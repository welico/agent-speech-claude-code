#!/bin/bash
# Agent Speech Plugin — Task Completed Hook
# Announces task completion via macOS TTS

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

# Extract task title — try multiple field names for compatibility
TASK_TITLE=$(echo "$HOOK_INPUT" | jq -r '.task_title // .title // .subject // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$TASK_TITLE" ]] && [[ ${#TASK_TITLE} -gt 3 ]]; then
  # Limit title to 80 characters
  if [[ ${#TASK_TITLE} -gt 80 ]]; then
    TASK_TITLE="${TASK_TITLE:0:80}"
  fi
  MESSAGE="Task completed: ${TASK_TITLE}"
else
  MESSAGE="Task completed"
fi

# Translate message if language is configured
MSG=$(translate "$MESSAGE")

# Speak using macOS built-in TTS (background, non-blocking)
say -v "$VOICE" -r "$RATE" "$MSG" &

exit 0
