#!/bin/bash
# Agent Speech Plugin — Notification Hook
# Speaks Claude Code notification messages via macOS TTS

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

# Extract notification message
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null || echo "")

# Skip if empty or too short (< 5 chars)
if [[ -z "$MESSAGE" ]] || [[ ${#MESSAGE} -lt 5 ]]; then
  exit 0
fi

# Limit to configured max chars
if [[ ${#MESSAGE} -gt $SUMMARY_MAX_CHARS ]]; then
  MESSAGE="${MESSAGE:0:$SUMMARY_MAX_CHARS}"
fi

# Translate message if language is configured
MSG=$(translate "$MESSAGE")

# Speak using macOS built-in TTS (background, non-blocking)
say -v "$VOICE" -r "$RATE" "$MSG" &

exit 0
