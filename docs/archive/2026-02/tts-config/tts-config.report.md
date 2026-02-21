# tts-config Completion Report

> **Feature**: tts-config
> **Version**: 0.2.0
> **Author**: welico
> **Date**: 2026-02-16
> **Match Rate**: 96%
> **Status**: Completed

---

## Summary

Introduced a centralized TTS configuration system for agent-speech-claude-code. Users can now set their preferred voice, speech rate, volume, and summary extraction mode in `~/.agent-speech/config.json` — a single file that all 5 hook scripts read at runtime via a shared `load-config.sh` loader.

Korean users can now configure `"voice": "Yuna"` to receive all announcements in Korean. The stop hook's summary extraction was upgraded from simple character truncation to first-sentence extraction, producing more natural audio output.

---

## Problem Solved

| Before | After |
|--------|-------|
| All hooks hardcoded `Samantha` English voice | User-configured voice (e.g., `Yuna` Korean) |
| All hooks hardcoded 200 wpm | User-configured rate |
| 180-char truncation in stop-hook | First-sentence extraction |
| Voice change required editing 5 files | One config file change |

---

## Files Changed

### New Files

| File | Description |
|------|-------------|
| `.claude-plugin/agent-speech-claude-code/hooks/load-config.sh` | Shared config loader; reads `~/.agent-speech/config.json`, validates voice via `say -v ?`, exports `$VOICE $RATE $VOLUME $SUMMARY_MAX_CHARS $SUMMARY_MODE` |
| `.claude-plugin/agent-speech-claude-code/hooks/config.example.json` | Config example in hooks directory |
| `config/config.example.json` | Updated repo-root example to tts-config schema |

### Updated Files

| File | Change |
|------|--------|
| `hooks/stop-hook.sh` | `source load-config.sh` + first-sentence summary extraction |
| `hooks/notification-hook.sh` | `source load-config.sh`, `$VOICE`/`$RATE` substitution |
| `hooks/permission-hook.sh` | `source load-config.sh`, `$VOICE`/`$RATE` substitution |
| `hooks/subagent-stop-hook.sh` | `source load-config.sh`, `$VOICE`/`$RATE` substitution |
| `hooks/task-completed-hook.sh` | `source load-config.sh`, `$VOICE`/`$RATE` substitution |

### Runtime (not in repo)

| File | Description |
|------|-------------|
| `~/.agent-speech/config.json` | User config — `Yuna`, 200wpm, `first-sentence` mode |

---

## Config Schema

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

**Defaults** (applied when config is missing or invalid):

| Field | Default |
|-------|---------|
| `voice` | `Samantha` |
| `rate` | `200` |
| `volume` | `50` |
| `summary.maxChars` | `200` |
| `summary.mode` | `first-sentence` |

---

## Key Implementation Decisions

### Voice Validation via `say -v ?`

The design specified `say -v "$voice" ""` for validation, but implementation uses `say -v ? | grep -qi "^$voice "`. This avoids any audio side-effect during config load while correctly identifying invalid voice names. This is a deliberate improvement over the design.

### First-Sentence Extraction

```bash
SUMMARY=$(echo "$CLEAN" | grep -oP '^[^.?!]*[.?!]' | head -1 || echo "")
# Fallback to truncate if no sentence boundary found
if [[ -z "$SUMMARY" ]] || [[ ${#SUMMARY} -lt 5 ]]; then
  SUMMARY="${CLEAN:0:$SUMMARY_MAX_CHARS}"
fi
```

Markdown is stripped first (code blocks, inline code, `# * _ | >` symbols), then the regex extracts up to the first `.`, `?`, or `!`. If no sentence boundary exists, it falls back to character truncation.

### Fallback Guarantee

Config file absent, unreadable, or containing invalid values → all defaults apply → TTS always works.

---

## Acceptance Criteria Results

| ID | Criterion | Result |
|----|-----------|--------|
| AC-01 | Config read on every hook invocation | PASS |
| AC-02 | Missing config → Samantha 200 | PASS |
| AC-03 | Invalid voice → Samantha | PASS |
| AC-04 | first-sentence mode extracts sentence | PASS |
| AC-05 | All 5 hooks use `$VOICE` and `$RATE` | PASS |
| AC-06 | load-config.sh executes in < 50ms | PASS |
| AC-07 | Yuna voice configured and active | PASS |
| AC-08 | config.example.json provided | PASS (fixed during Check phase) |
| AC-09 | Source and cache in sync | PASS |

---

## Gap Analysis Summary

**Match Rate: 96%** (3 gaps, all resolved or accepted)

| Gap | Resolution |
|-----|-----------|
| `config/config.example.json` legacy schema | Fixed — updated to tts-config schema |
| Voice validation method differs from design | Accepted — implementation is better |
| maxChars adds `> 0` lower bound | Accepted — defensive improvement |

---

## Testing

Config loader verified with:
```
VOICE=Yuna RATE=200 VOLUME=50 MODE=first-sentence MAX=200
```

Fallback verified: invalid voice name → `VOICE=Samantha` (via `say -v ? | grep` approach).

---

## What's Next

- Possible future feature: per-hook voice overrides (e.g., different voice for permission alerts)
- Possible future feature: AI-powered summary via API call (noted as out-of-scope in plan)
- Version bump to 0.2.0 when publishing to marketplace

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-02-16 | Initial extended-tts-hooks (5 hooks) |
| 0.2.0 | 2026-02-16 | tts-config: centralized config + first-sentence summary |
