#!/bin/bash
# Agent Speech Plugin Stop Hook
# Speaks a summary of Claude's last response using macOS TTS

set -euo pipefail

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

# Build summary: strip markdown, collapse whitespace, take first ~150 chars
SUMMARY=$(echo "$LAST_TEXT" | \
  sed 's/```[^`]*```//g' | \
  sed 's/`[^`]*`//g' | \
  sed 's/[#*_|>]//g' | \
  tr -s ' \n\t' ' ' | \
  sed 's/^ //' | \
  cut -c1-180)

# Skip if summary is too short after cleanup
if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
  exit 0
fi

# Speak using macOS built-in TTS (background, non-blocking)
say -v "Samantha" -r 200 "$SUMMARY" &

exit 0
