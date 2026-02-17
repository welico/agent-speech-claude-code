#!/bin/bash
# Agent Speech Plugin — Task Completed Hook
# Announces task completion via macOS TTS
# Follows the same pattern as stop-hook.sh (ralph-loop convention)

set -euo pipefail

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

# Speak using macOS built-in TTS (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
