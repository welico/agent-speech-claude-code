# tts-config Design Document

> **Summary**: Centralized TTS config file (`~/.agent-speech/config.json`) with shared `load-config.sh` loader and first-sentence summary extraction.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.2.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft
> **Plan Reference**: `docs/01-plan/features/tts-config.plan.md`

---

## 1. Overview

All 5 hook scripts currently hardcode `Samantha` voice at 200 wpm. This design introduces:

1. A shared `load-config.sh` that reads `~/.agent-speech/config.json`
2. All hooks `source` this loader to get `$VOICE`, `$RATE`, `$VOLUME`
3. `stop-hook.sh` gains `first-sentence` summary extraction mode

---

## 2. Files Changed

| File | Action | Description |
|------|--------|-------------|
| `hooks/load-config.sh` | **NEW** | Shared config loader |
| `hooks/stop-hook.sh` | **UPDATE** | Add config + first-sentence mode |
| `hooks/notification-hook.sh` | **UPDATE** | Use `$VOICE`, `$RATE` from config |
| `hooks/permission-hook.sh` | **UPDATE** | Use `$VOICE`, `$RATE` from config |
| `hooks/subagent-stop-hook.sh` | **UPDATE** | Use `$VOICE`, `$RATE` from config |
| `hooks/task-completed-hook.sh` | **UPDATE** | Use `$VOICE`, `$RATE` from config |
| `config.example.json` | **NEW** | Example config with Korean settings |

Sync locations (all 3 must match):
- Source: `.claude-plugin/agent-speech-claude-code/hooks/`
- Cache: `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/.claude-plugin/agent-speech-claude-code/hooks/`
- User config: `~/.agent-speech/config.json` (runtime, not in repo)

---

## 3. load-config.sh Design

```bash
#!/bin/bash
# Agent Speech Plugin — Shared Config Loader
# Usage: source "$(dirname "$0")/load-config.sh"
# Exports: VOICE, RATE, VOLUME

CONFIG_PATH="${HOME}/.agent-speech/config.json"

# Defaults
VOICE="Samantha"
RATE=200
VOLUME=50
SUMMARY_MAX_CHARS=200
SUMMARY_MODE="first-sentence"

if [[ -f "$CONFIG_PATH" ]]; then
  # Read voice (validate — check it exists in `say -v ?`)
  _VOICE=$(jq -r '.voice // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ -n "$_VOICE" ]]; then
    if say -v "$_VOICE" "" 2>/dev/null; then
      VOICE="$_VOICE"
    fi
    # Fallback: use default if voice invalid (say returns non-zero)
  fi

  # Read rate (number, 50–500)
  _RATE=$(jq -r '.rate // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_RATE" =~ ^[0-9]+$ ]] && [[ "$_RATE" -ge 50 ]] && [[ "$_RATE" -le 500 ]]; then
    RATE="$_RATE"
  fi

  # Read volume (number, 0–100)
  _VOLUME=$(jq -r '.volume // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_VOLUME" =~ ^[0-9]+$ ]] && [[ "$_VOLUME" -ge 0 ]] && [[ "$_VOLUME" -le 100 ]]; then
    VOLUME="$_VOLUME"
  fi

  # Read summary settings
  _MAX=$(jq -r '.summary.maxChars // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_MAX" =~ ^[0-9]+$ ]]; then
    SUMMARY_MAX_CHARS="$_MAX"
  fi

  _MODE=$(jq -r '.summary.mode // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
  if [[ "$_MODE" == "truncate" ]] || [[ "$_MODE" == "first-sentence" ]]; then
    SUMMARY_MODE="$_MODE"
  fi
fi

export VOICE RATE VOLUME SUMMARY_MAX_CHARS SUMMARY_MODE
```

### Voice Validation Note

`say -v "$_VOICE" "" 2>/dev/null` tests if voice exists. On macOS:
- Returns exit 0 if voice is valid
- Returns non-zero if voice name is unrecognized

---

## 4. stop-hook.sh Design (Updated)

```bash
#!/bin/bash
# Agent Speech Plugin Stop Hook
set -euo pipefail

# Load config
source "$(dirname "$0")/load-config.sh"

HOOK_INPUT=$(cat)
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty' 2>/dev/null || echo "")

if [[ -z "$TRANSCRIPT_PATH" ]] || [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  exit 0
fi

# Extract last assistant text block from JSONL transcript
LAST_TEXT=$(jq -r '
  select(.type == "assistant") |
  .message.content // [] |
  map(select(.type == "text")) |
  map(.text) |
  select(length > 0) |
  join(" ")
' "$TRANSCRIPT_PATH" 2>/dev/null | grep -v '^[[:space:]]*$' | tail -1 || echo "")

if [[ -z "$LAST_TEXT" ]] || [[ ${#LAST_TEXT} -lt 10 ]]; then
  exit 0
fi

# Step 1: Strip markdown
CLEAN=$(echo "$LAST_TEXT" | \
  sed 's/```[^`]*```//g' | \
  sed 's/`[^`]*`//g' | \
  sed 's/[#*_|>]//g' | \
  tr -s ' \n\t' ' ' | \
  sed 's/^ //')

# Step 2: Extract summary based on mode
if [[ "$SUMMARY_MODE" == "first-sentence" ]]; then
  # Extract first complete sentence ending in . ? !
  SUMMARY=$(echo "$CLEAN" | grep -oP '^[^.?!]*[.?!]' | head -1 || echo "")
  # Fallback to truncate if no sentence found
  if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
    SUMMARY="${CLEAN:0:$SUMMARY_MAX_CHARS}"
  fi
  # Enforce maxChars
  if [[ ${#SUMMARY} -gt $SUMMARY_MAX_CHARS ]]; then
    SUMMARY="${SUMMARY:0:$SUMMARY_MAX_CHARS}"
  fi
else
  # truncate mode
  SUMMARY="${CLEAN:0:$SUMMARY_MAX_CHARS}"
fi

if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
  exit 0
fi

say -v "$VOICE" -r "$RATE" "$SUMMARY" &
exit 0
```

---

## 5. notification-hook.sh Design (Updated)

Only 2 lines change — replace hardcoded voice/rate with variables:

```bash
#!/bin/bash
# Agent Speech Plugin — Notification Hook
set -euo pipefail

source "$(dirname "$0")/load-config.sh"

HOOK_INPUT=$(cat)
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null || echo "")

if [[ -z "$MESSAGE" ]] || [[ ${#MESSAGE} -lt 5 ]]; then
  exit 0
fi

if [[ ${#MESSAGE} -gt $SUMMARY_MAX_CHARS ]]; then
  MESSAGE="${MESSAGE:0:$SUMMARY_MAX_CHARS}"
fi

say -v "$VOICE" -r "$RATE" "$MESSAGE" &
exit 0
```

---

## 6. permission-hook.sh Design (Updated)

```bash
#!/bin/bash
# Agent Speech Plugin — Permission Request Hook
set -euo pipefail

source "$(dirname "$0")/load-config.sh"

HOOK_INPUT=$(cat)
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")

if [[ -n "$TOOL_NAME" ]]; then
  MESSAGE="Permission required for ${TOOL_NAME}"
else
  MESSAGE="Permission required"
fi

say -v "$VOICE" -r "$RATE" "$MESSAGE" &
exit 0
```

---

## 7. subagent-stop-hook.sh Design (Updated)

Replace `say -v "Samantha" -r 200` → `say -v "$VOICE" -r "$RATE"` after sourcing config.

---

## 8. task-completed-hook.sh Design (Updated)

Replace `say -v "Samantha" -r 200` → `say -v "$VOICE" -r "$RATE"` after sourcing config.

---

## 9. config.example.json

```json
{
  "voice": "Yuna",
  "rate": 200,
  "volume": 50,
  "summary": {
    "maxChars": 200,
    "mode": "first-sentence"
  }
}
```

Place at `config/config.example.json` in repo root.

---

## 10. User Default Config

Create `~/.agent-speech/config.json` with Korean voice settings as the default for this user:

```json
{
  "voice": "Yuna",
  "rate": 200,
  "volume": 50,
  "summary": {
    "maxChars": 200,
    "mode": "first-sentence"
  }
}
```

---

## 11. Summary Mode Logic

```
Input: raw text from transcript

1. Remove markdown code blocks (``` ... ```)
2. Remove inline code (`...`)
3. Remove markdown symbols (#, *, _, |, >)
4. Collapse whitespace (newlines → spaces, multiple spaces → one)
5a. [first-sentence] grep for first [.?!] — fallback to truncate if none found
5b. [truncate] cut first maxChars characters
6. Enforce maxChars ceiling
```

### Edge Cases

| Input | first-sentence output |
|-------|----------------------|
| "Done. Next steps: ..." | "Done." |
| "No sentence here" | "No sentence here" (truncate fallback) |
| "" (empty after cleanup) | skip (exit 0) |
| "A" × 500 chars no period | first 200 chars (truncate fallback) |

---

## 12. Implementation Order

1. Create `load-config.sh`
2. Update `stop-hook.sh` (most complex — first-sentence logic)
3. Update `notification-hook.sh`
4. Update `permission-hook.sh`
5. Update `subagent-stop-hook.sh`
6. Update `task-completed-hook.sh`
7. Create `config/config.example.json`
8. Create `~/.agent-speech/config.json` (Korean defaults)
9. Sync all changed files to plugin cache
10. Verify TTS with Yuna voice

---

## 13. Acceptance Criteria

| ID | Criterion | Verification |
|----|-----------|-------------|
| AC-01 | `~/.agent-speech/config.json` read on every hook invocation | Manual test |
| AC-02 | Missing config → fallback to Samantha 200 | Delete config, test hook |
| AC-03 | Invalid voice → fallback to Samantha | Set `"voice": "InvalidXYZ"`, test |
| AC-04 | `first-sentence` mode extracts first complete sentence | Test with multi-sentence response |
| AC-05 | All 5 hooks use `$VOICE` and `$RATE` | Code review |
| AC-06 | `load-config.sh` executes in < 50ms | `time source load-config.sh` |
| AC-07 | Yuna voice speaks Korean text correctly | Manual TTS test |
| AC-08 | `config.example.json` provided in repo | File exists check |
| AC-09 | Source and cache copies are in sync | diff comparison |

---

## 14. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial design |
