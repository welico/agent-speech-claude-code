#!/bin/bash
# Agent Speech Plugin — Translation Helper
# Usage: source translate.sh; MSG=$(translate "Hello")
# Uses Google Translate unofficial free API (no API key required)

translate() {
  local TEXT="$1"
  local TARGET_LANG="${LANGUAGE:-en}"

  # Skip translation if language is "en" or not set
  if [[ "$TARGET_LANG" == "en" ]] || [[ -z "$TARGET_LANG" ]]; then
    echo "$TEXT"
    return 0
  fi

  # Skip if text is empty
  if [[ -z "$TEXT" ]]; then
    echo "$TEXT"
    return 0
  fi

  # URL-encode the text using python3 (available on macOS by default)
  local ENCODED
  ENCODED=$(python3 -c \
    "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" \
    "$TEXT" 2>/dev/null || echo "")

  # Fallback: if encoding failed, return original
  if [[ -z "$ENCODED" ]]; then
    echo "$TEXT"
    return 0
  fi

  # Call Google Translate free API (3s timeout to avoid blocking TTS)
  local TRANSLATED
  TRANSLATED=$(curl -s --max-time 3 \
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET_LANG}&dt=t&q=${ENCODED}" \
    2>/dev/null | jq -r '.[0][][0]' 2>/dev/null | tr -d '\n' || echo "")

  # Fallback to original text if translation fails or returns empty
  if [[ -z "$TRANSLATED" ]]; then
    echo "$TEXT"
  else
    echo "$TRANSLATED"
  fi
}

export -f translate
