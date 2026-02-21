#!/bin/bash
# Agent Speech Plugin Stop Hook
# Speaks a summary of Claude's last response using macOS TTS

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

# Extract transcript path from Stop hook JSON
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty' 2>/dev/null || echo "")

if [[ -z "$TRANSCRIPT_PATH" ]] || [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  exit 0
fi

# Extract last assistant text block from JSONL transcript
# Uses jq directly on JSONL — more reliable than grep | tail
LAST_TEXT=$(jq -r '
  select(.type == "assistant") |
  .message.content // [] |
  map(select(.type == "text")) |
  map(.text) |
  select(length > 0) |
  join(" ")
' "$TRANSCRIPT_PATH" 2>/dev/null | grep -v '^[[:space:]]*$' | tail -1 || echo "")

# Skip if empty or too short
if [[ -z "$LAST_TEXT" ]] || [[ ${#LAST_TEXT} -lt 10 ]]; then
  exit 0
fi

# Step 1: Strip markdown artifacts
CLEAN=$(echo "$LAST_TEXT" | \
  sed 's/```[^`]*```//g' | \
  sed 's/`[^`]*`//g' | \
  sed 's/[#*_|>]//g' | \
  tr -s ' \n\t' ' ' | \
  sed 's/^ //')

# Step 2: Extract summary based on configured mode
if [[ "$SUMMARY_MODE" == "first-sentence" ]]; then
  # Extract first complete sentence ending in . ? !
  SUMMARY=$(echo "$CLEAN" | grep -oP '^[^.?!]*[.?!]' | head -1 || echo "")
  # Fallback to truncate if no sentence boundary found
  if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
    SUMMARY="${CLEAN:0:$SUMMARY_MAX_CHARS}"
  fi
  # Enforce maxChars ceiling
  if [[ ${#SUMMARY} -gt $SUMMARY_MAX_CHARS ]]; then
    SUMMARY="${SUMMARY:0:$SUMMARY_MAX_CHARS}"
  fi
else
  # truncate mode: simple character limit
  SUMMARY="${CLEAN:0:$SUMMARY_MAX_CHARS}"
fi

# Skip if summary is too short after cleanup
if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
  exit 0
fi

# Translate summary if language is configured
TRANSLATED=$(translate "$SUMMARY")

# Speak using macOS built-in TTS (background, non-blocking)
say -v "$VOICE" -r "$RATE" "$TRANSLATED" &

exit 0
