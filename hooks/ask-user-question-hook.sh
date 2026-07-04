#!/bin/bash
# Agent Speech Plugin — Ask User Question Hook
# Reads Claude's question(s) aloud verbatim via macOS TTS before the
# AskUserQuestion tool shows its interactive prompt, so users can listen
# instead of reading the terminal.

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

# Build a single spoken message from the question text(s), verbatim.
# A lone question is spoken as-is; multiple questions are numbered so the
# user can tell them apart without altering their wording.
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '
  [.tool_input.questions[]? | .question // empty] | map(select(length > 0)) as $qs |
  if ($qs | length) > 1 then
    $qs | to_entries | map("Question \(.key + 1): \(.value)") | join(". ")
  else
    $qs[0] // empty
  end
' 2>/dev/null || echo "")

# Skip if there is nothing to say
if [[ -z "$MESSAGE" ]]; then
  exit 0
fi

# Limit to configured max chars
if [[ ${#MESSAGE} -gt $SUMMARY_MAX_CHARS ]]; then
  MESSAGE="${MESSAGE:0:$SUMMARY_MAX_CHARS}"
fi

# Translate message if language is configured
MSG=$(translate "$MESSAGE")

# Speak using macOS built-in TTS (background, non-blocking).
# No JSON is returned: this hook only observes and never sets a
# permissionDecision, so the normal interactive prompt still runs.
say -v "$VOICE" -r "$RATE" "$MSG" &

exit 0
