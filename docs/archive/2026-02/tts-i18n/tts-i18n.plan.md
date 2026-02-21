# tts-i18n Planning Document

> **Summary**: All TTS messages are translated into a user-defined language using the free unofficial Google Translate API and then provided voice guidance. Read the original text as it is with offline fallback.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.3.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Currently, all hook messages are set to English. When the user sets `"language": "ko"`:
- "Permission required for Bash" → "Permissions required for Bash"
- "The task has been completed." → “The task is complete.”
- Claude's response summary (stop-hook) is also translated into Korean and provided with voice guidance

### 1.2 Translation method: Google Translate free unofficial API

```
https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&q=...
```

**Verified (macOS, curl default installation):**

| input | output |
|------|------|
| “The task has been completed.” | “The job is done.” |
| "Permission required for Bash" | "Permissions required by Bash" |
| "The implementation is complete. All 5 hooks updated." | "Implementation is complete. All five hooks have been updated." |

**characteristic:**
- No API key required
- `curl` + `jq` (existing dependencies, no additional installation)
- Internet connection required (original text fallback when offline)
- Unofficial endpoint (no long-term stability guaranteed — resolved with fallback)

---

## 2. Scope

### 2.1 In Scope (v0.3.0)

| Features | target hook | Description |
|------|--------|------|
| Permission message translation | `permission-hook.sh` | "Permission required for {tool}" |
| Subagent message translation | `subagent-stop-hook.sh` | "Subagent {type} completed" |
| Task message translation | `task-completed-hook.sh` | "Task completed: {title}" |
| Notification message translation | `notification-hook.sh` | Claude Code notification message |
| Stop summary translation | `stop-hook.sh` | Claude response first-sentence summary translation |
| Add language settings | `config.json` | `"language": "ko"` field |
| Translation Helper | `translate.sh` | curl + jq translation function, offline fallback |

### 2.2 Out of Scope

- Languages ​​other than Korean/English (structure can be expanded)
- Static translation table (replaced by API method)
- Windows/Linux support

---

## 3. Change Config

### 3.1 Additional fields

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

| field | Type | default | Description |
|------|------|--------|------|
| `language` | string | `"en"` | Translation language code (`"ko"`, `"en"`) |

---

## 4. translate.sh design

### 4.1 Translation function

```bash
#!/bin/bash
# Agent Speech Plugin — Translation Helper
# Usage: source translate.sh; MSG=$(translate "Hello")
# Uses Google Translate unofficial free API

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

  # URL-encode the text
  local ENCODED
  ENCODED=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "$TEXT" 2>/dev/null || echo "")

  if [[ -z "$ENCODED" ]]; then
    echo "$TEXT"
    return 0
  fi

  # Call Google Translate free API (timeout 3s to avoid blocking TTS)
  local TRANSLATED
  TRANSLATED=$(curl -s --max-time 3 \
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET_LANG}&dt=t&q=${ENCODED}" \
    2>/dev/null | jq -r '.[0][][0]' 2>/dev/null | tr -d '\n' || echo "")

  # Fallback to original text if translation fails
  if [[ -z "$TRANSLATED" ]]; then
    echo "$TEXT"
  else
    echo "$TRANSLATED"
  fi
}

export -f translate
```

### 4.2 Timeout strategy

- `--max-time 3`: If there is no response within 3 seconds, use the original text.
- TTS runs in the background (`say &`), so waiting for 3 seconds is within the acceptable range.
- curl fails immediately when offline → read the original text as is

---

## 5. Change load-config.sh

Add `LANGUAGE` to an existing variable:

```bash
# Read language code (en, ko, ...)
_LANG=$(jq -r '.language // empty' "$CONFIG_PATH" 2>/dev/null || echo "")
# Allow only known language codes; default to "en"
case "$_LANG" in
  en|ko) LANGUAGE="$_LANG" ;;
  *) LANGUAGE="en" ;;
esac
export LANGUAGE
```

---

## 6. Change by hook

### permission-hook.sh

```bash
source "$(dirname "$0")/translate.sh"
# ...
MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
```

### subagent-stop-hook.sh, task-completed-hook.sh

Same pattern — `translate "$MESSAGE"` followed by `say`

### notification-hook.sh

```bash
MSG=$(translate "$MESSAGE")
say -v "$VOICE" -r "$RATE" "$MSG" &
```

### stop-hook.sh

After extracting the summary, add translation:

```bash
SUMMARY=$(extract_summary "$LAST_TEXT") # Existing logic
TRANSLATED=$(translate "$SUMMARY")
say -v "$VOICE" -r "$RATE" "$TRANSLATED" &
```

---

## 7. Success criteria

- [ ] When setting `"language": "ko"`, permission/subagent/task message is in Korean.
- [ ] "The task has been completed." → Yuna voice guidance after Korean translation
- [ ] When offline, the original text is read in English (fallback)
- [ ] `"language": "en"` or if not present, no translation (no API call)
- [ ] When translation fails (API error), fall back to the original text.
- [ ] stop-hook summary also translated
- [ ] Cache synchronization completed

---

## 8. Risks and Mitigation

| Risk | Response |
|------|------|
| Google API blocking/changing | 3 second timeout + original text fallback → TTS always works |
| No internet | curl fails immediately → fallback to original |
| no python3 | URL encoding failure → original text fallback |
| Low translation quality | Fixed message is sufficient, stop summary is acceptable |
| translation time delay | 3 second max-time, TTS runs in background |

---

## 9. Implementation Order

1. Write `translate.sh`
2. `load-config.sh` — Add `LANGUAGE` field
3. Update `permission-hook.sh`
4. Update `subagent-stop-hook.sh`
5. Update `task-completed-hook.sh`
6. Update `notification-hook.sh`
7. Update `stop-hook.sh`
8. Add `"language": "ko"` to `~/.agent-speech/config.json`
9. Update `config.example.json`
10. Cache Sync
11. Operation verification

---

## 10. Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1 | 2026-02-16 | Initial draft (static i18n table) |
| 0.2 | 2026-02-16 | Revised: Google Translate API approach (all hooks + stop-hook) |
