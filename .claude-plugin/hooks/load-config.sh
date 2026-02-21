#!/bin/bash
# Agent Speech Plugin — Shared Config Loader
# Usage: source "$(dirname "$0")/load-config.sh"
# Exports: VOICE, RATE, VOLUME, SUMMARY_MAX_CHARS, SUMMARY_MODE

CONFIG_PATH="${HOME}/.agent-speech/config.json"

# Defaults
VOICE="Samantha"
RATE=200
VOLUME=50
SUMMARY_MAX_CHARS=200
SUMMARY_MODE="first-sentence"

if [[ -f "$CONFIG_PATH" ]]; then
  # Read voice — validate against available voices list
  _VOICE=$(jq -r '.voice // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ -n "$_VOICE" ]]; then
    if say -v ? 2>/dev/null | grep -qi "^$_VOICE "; then
      VOICE="$_VOICE"
    fi
    # Falls through to default VOICE if voice name not found
  fi

  # Read rate (50–500 wpm)
  _RATE=$(jq -r '.rate // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_RATE" =~ ^[0-9]+$ ]] && [[ "$_RATE" -ge 50 ]] && [[ "$_RATE" -le 500 ]]; then
    RATE="$_RATE"
  fi

  # Read volume (0–100)
  _VOLUME=$(jq -r '.volume // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_VOLUME" =~ ^[0-9]+$ ]] && [[ "$_VOLUME" -ge 0 ]] && [[ "$_VOLUME" -le 100 ]]; then
    VOLUME="$_VOLUME"
  fi

  # Read summary.maxChars
  _MAX=$(jq -r '.summary.maxChars // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_MAX" =~ ^[0-9]+$ ]] && [[ "$_MAX" -gt 0 ]]; then
    SUMMARY_MAX_CHARS="$_MAX"
  fi

  # Read summary.mode
  _MODE=$(jq -r '.summary.mode // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_MODE" == "truncate" ]] || [[ "$_MODE" == "first-sentence" ]]; then
    SUMMARY_MODE="$_MODE"
  fi
fi

# Read language code (en, ko, ...)
# Allow only known language codes; default to "en" (no translation)
LANGUAGE="en"
if [[ -f "$CONFIG_PATH" ]]; then
  _LANG=$(jq -r '.language // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  case "$_LANG" in
    en|ko) LANGUAGE="$_LANG" ;;
    *)     LANGUAGE="en" ;;
  esac
fi

export VOICE RATE VOLUME SUMMARY_MAX_CHARS SUMMARY_MODE LANGUAGE

# Check mute state
MUTE_FILE="$HOME/.agent-speech/mute.json"
IS_MUTED=false

if [[ -f "$MUTE_FILE" ]]; then
  UNTIL=$(jq -r '.until // empty' "$MUTE_FILE" 2>/dev/null || echo "")

  if [[ -z "$UNTIL" ]]; then
    IS_MUTED=true  # permanent mute
  else
    # BSD date command on macOS
    NOW=$(date -u +%s)
    UNTIL_EPOCH=$(date -u -jf "%Y-%m-%dT%H:%M:%S" "${UNTIL%.*}" +%s 2>/dev/null || echo 0)

    if [[ $NOW -lt $UNTIL_EPOCH ]]; then
      IS_MUTED=true
    else
      # Auto-cleanup expired mute
      rm -f "$MUTE_FILE"
    fi
  fi
fi

export IS_MUTED
