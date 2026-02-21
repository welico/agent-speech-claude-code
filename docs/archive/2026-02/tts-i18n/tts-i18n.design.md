# tts-i18n Design Document

> **Summary**: Translate TTS messages into a custom language using Google Translate's free, unofficial API. Updated translate.sh helper + load-config.sh LANGUAGE field + 5 hooks.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.3.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Architecture Overview

### 1.1 Component Diagram

```
~/.agent-speech/config.json
  └── "language": "ko"
        │
        ▼
load-config.sh  ─────────────────────────► export LANGUAGE
        │
        ▼
translate.sh (translate function)
  ├── LANGUAGE == "en" → return TEXT unchanged
  ├── LANGUAGE == other → curl Google Translate API
  │     ├── Success → return translated text
  │     └── Failure / Timeout / Offline → return TEXT unchanged
        │
        ▼
All 5 hooks: MSG=$(translate "$MESSAGE") → say "$MSG"
```

### 1.2 New Files

| File | Purpose |
|------|---------|
| `.claude-plugin/agent-speech-claude-code/hooks/translate.sh` | Translation helper — `translate()` function |

### 1.3 Modified Files

| File | Change |
|------|--------|
| `load-config.sh` | Add `LANGUAGE` variable read/export |
| `permission-hook.sh` | Source translate.sh, wrap message with translate() |
| `subagent-stop-hook.sh` | Same |
| `task-completed-hook.sh` | Same |
| `notification-hook.sh` | Same |
| `stop-hook.sh` | Same (translate SUMMARY before say) |
| `config.example.json` (hooks/) | Add `"language"` field |
| `~/.agent-speech/config.json` | Add `"language": "ko"` |

---

## 2. translate.sh Design

### 2.1 Full Implementation

```bash
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
```

### 2.2 Fallback Chain

```
translate("The task has been completed.")
  │
  ├── LANGUAGE == "en"?  → return original  (no API call)
  ├── TEXT empty?        → return original
  ├── python3 unavail?   → return original  (encoding failed)
  ├── curl timeout (>3s) → return original
  ├── API error / offline → return original
  └── jq parse fail?     → return original
                            → only if all pass: return translated
```

---

## 3. load-config.sh Changes

Add LANGUAGE reading after existing config reads:

```bash
# Read language code (en, ko, ...)
# Allow only known language codes; default to "en"
_LANG=$(jq -r '.language // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
case "$_LANG" in
  en|ko) LANGUAGE="$_LANG" ;;
  *)     LANGUAGE="en" ;;
esac
export LANGUAGE
```

**Default**: `LANGUAGE="en"` (no translation, no API call).

---

## 4. Hook Update Pattern

Each hook follows this pattern:

```bash
# Before (existing):
source "$(dirname "$0")/load-config.sh"
# ... build MESSAGE ...
say -v "$VOICE" -r "$RATE" "$MESSAGE" &

# After (tts-i18n):
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"
# ... build MESSAGE ...
MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
```

### 4.1 permission-hook.sh

```bash
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

HOOK_INPUT=$(cat)
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")

if [[ -n "$TOOL_NAME" ]]; then
  MESSAGE="Permission required for ${TOOL_NAME}"
else
  MESSAGE="Permission required"
fi

MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
exit 0
```

### 4.2 subagent-stop-hook.sh

```bash
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

HOOK_INPUT=$(cat)
SUBAGENT_TYPE=$(echo "$HOOK_INPUT" | jq -r '.subagent_type // "subagent"' 2>/dev/null || echo "subagent")
MESSAGE="Subagent ${SUBAGENT_TYPE} completed"

MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
exit 0
```

### 4.3 task-completed-hook.sh

```bash
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

HOOK_INPUT=$(cat)
TITLE=$(echo "$HOOK_INPUT" | jq -r '.title // empty' 2>/dev/null || echo "")

if [[ -n "$TITLE" ]]; then
  MESSAGE="Task completed: ${TITLE}"
else
  MESSAGE="Task completed"
fi

MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
exit 0
```

### 4.4 notification-hook.sh

```bash
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

HOOK_INPUT=$(cat)
RAW_MSG=$(echo "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null || echo "")
MESSAGE="${RAW_MSG:0:$SUMMARY_MAX_CHARS}"

if [[ -z "$MESSAGE" ]]; then
  exit 0
fi

MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
exit 0
```

### 4.5 stop-hook.sh

Translation is applied to the extracted SUMMARY (after markdown cleanup and sentence extraction):

```bash
source "$(dirname "$0")/load-config.sh"
source "$(dirname "$0")/translate.sh"

# ... existing transcript extraction and summary logic unchanged ...

# After SUMMARY is built (existing logic), translate before speaking:
TRANSLATED=$(translate "$SUMMARY")
say -v "$VOICE" -r "$RATE" "$TRANSLATED" &
exit 0
```

---

## 5. Config Schema

### 5.1 Updated config.example.json (hooks/)

```json
{
  "voice": "Yuna",
  "language": "ko",
  "rate": 200,
  "volume": 50,
  "summary": {
    "maxChars": 200,
    "mode": "first-sentence"
  }
}
```

### 5.2 load-config.sh LANGUAGE validation

| Input | LANGUAGE exported |
|-------|------------------|
| `"ko"` | `"ko"` |
| `"en"` | `"en"` |
| `"ja"` | `"en"` (unsupported, default) |
| missing / null | `"en"` (default) |

---

## 6. Implementation Order

1. Create `translate.sh`
2. Update `load-config.sh` — add LANGUAGE read/export
3. Update `permission-hook.sh`
4. Update `subagent-stop-hook.sh`
5. Update `task-completed-hook.sh`
6. Update `notification-hook.sh`
7. Update `stop-hook.sh`
8. Update `config.example.json` (hooks/) — add `"language": "ko"`
9. Update `~/.agent-speech/config.json` — add `"language": "ko"`
10. Sync to plugin cache (`~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/`)
11. Verify translations end-to-end

---

## 7. Acceptance Criteria

| # | Criterion | Test Method |
|---|-----------|-------------|
| AC-01 | `"language": "ko"` → permission message spoken in Korean | Trigger PermissionRequest hook |
| AC-02 | `"language": "ko"` → subagent message spoken in Korean | Trigger SubagentStop hook |
| AC-03 | `"language": "ko"` → task completed message spoken in Korean | Trigger TaskCompleted hook |
| AC-04 | `"language": "ko"` → notification message translated to Korean | Trigger Notification hook |
| AC-05 | `"language": "ko"` → stop-hook SUMMARY spoken in Korean | Trigger Stop hook |
| AC-06 | `"language": "en"` → no translation, no API call | Set language to "en", verify say called with original text |
| AC-07 | language field absent → no translation (same as "en") | Remove language from config |
| AC-08 | Offline (no network) → original English text spoken | Disable network, trigger any hook |
| AC-09 | translate.sh sourced without errors | `source translate.sh; echo $?` == 0 |

---

## 8. Dependencies

| Dependency | Availability | Notes |
|------------|--------------|-------|
| `curl` | macOS built-in | Always available |
| `jq` | Required by other hooks | Already a dependency |
| `python3` | macOS built-in (Sonoma+) | Used for URL encoding |
| Internet | Optional | Fallback to original if unavailable |

---

## 9. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Google blocks unofficial endpoint | Low | 3s timeout + original text fallback |
| python3 not found | Low | Empty ENCODED → original text returned |
| Translation latency > 3s | Low | `--max-time 3` forces timeout |
| Translated text contains quotes causing `say` errors | Medium | `say` handles quoted strings; avoid extra quoting |

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial design |
