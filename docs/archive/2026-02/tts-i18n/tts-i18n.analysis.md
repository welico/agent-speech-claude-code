# tts-i18n Gap Analysis

> **Feature**: tts-i18n
> **Version**: 0.3.0
> **Date**: 2026-02-16
> **Analyst**: gap-detector agent
> **Overall Match Rate**: 93%
> **Status**: PASS (>= 90%)

---

## 1. Executive Summary

The `tts-i18n` implementation achieves a **93% overall match rate** against the design specification. The core translation infrastructure (`translate.sh`, `load-config.sh` LANGUAGE export, config schema) is implemented exactly as designed. All 5 hooks correctly source `translate.sh` and apply translation before TTS output. All 9 acceptance criteria pass.

The 7% gap is attributed to minor implementation deviations in 3 hook scripts where the implementation adds defensive enhancements (extra field fallbacks, stricter length checks, different variable names) not present in the design. These are improvements over the design, not deficiencies.

---

## 2. Acceptance Criteria Analysis

| ID | Criterion | Status | Evidence |
|----|-----------|--------|----------|
| AC-01 | `"language": "ko"` → permission message spoken in Korean | PASS | `permission-hook.sh` sources `translate.sh`, calls `MSG=$(translate "$MESSAGE")`, passes to `say` |
| AC-02 | `"language": "ko"` → subagent message spoken in Korean | PASS | `subagent-stop-hook.sh` sources `translate.sh`, calls `MSG=$(translate "$MESSAGE")`, passes to `say` |
| AC-03 | `"language": "ko"` → task completed message spoken in Korean | PASS | `task-completed-hook.sh` sources `translate.sh`, calls `MSG=$(translate "$MESSAGE")`, passes to `say` |
| AC-04 | `"language": "ko"` → notification message translated to Korean | PASS | `notification-hook.sh` sources `translate.sh`, calls `MSG=$(translate "$MESSAGE")`, passes to `say` |
| AC-05 | `"language": "ko"` → stop-hook SUMMARY spoken in Korean | PASS | `stop-hook.sh` sources `translate.sh`, calls `TRANSLATED=$(translate "$SUMMARY")`, passes to `say` |
| AC-06 | `"language": "en"` → no translation, no API call | PASS | `translate.sh` line 11: `if [[ "$TARGET_LANG" == "en" ]]` returns original text immediately |
| AC-07 | language field absent → no translation (same as "en") | PASS | `load-config.sh`: `LANGUAGE="en"` default; case only accepts `en\|ko` |
| AC-08 | Offline (no network) → original English text spoken | PASS | `translate.sh` uses `curl --max-time 3` with fallback chain; all failure paths return original text |
| AC-09 | translate.sh sourced without errors | PASS | Well-formed bash script, proper function definition, `export -f translate` at end |

**Acceptance Score: 9/9 (100%)**

---

## 3. File-Level Comparison

### 3.1 translate.sh (NEW FILE)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| File location | `hooks/translate.sh` | `hooks/translate.sh` | MATCH |
| Function name | `translate()` | `translate()` | MATCH |
| TARGET_LANG default | `${LANGUAGE:-en}` | `${LANGUAGE:-en}` | MATCH |
| Skip when "en" | Yes | Yes (line 11) | MATCH |
| Skip when empty text | Yes | Yes (line 17) | MATCH |
| URL encoding via python3 | Yes | Yes (line 24) | MATCH |
| Encoding fallback | Return original | Return original (line 29-31) | MATCH |
| curl timeout | `--max-time 3` | `--max-time 3` (line 36) | MATCH |
| API URL | `translate.googleapis.com/...` | Identical URL (line 37) | MATCH |
| jq parse | `.[0][][0]` | `.[0][][0]` (line 38) | MATCH |
| tr pipe | `tr -d '\n'` | `tr -d '\n'` (line 38) | MATCH |
| Empty result fallback | Return original | Return original (line 41-44) | MATCH |
| export -f | Yes | Yes (line 48) | MATCH |

**translate.sh Score: 13/13 (100%)**

### 3.2 load-config.sh (MODIFIED)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| LANGUAGE variable added | Yes | Yes | MATCH |
| Default value | `"en"` | `"en"` | MATCH |
| jq extraction | `.language // empty` | `.language // empty` | MATCH |
| Validation via case | `en\|ko` accepted | `en\|ko` accepted | MATCH |
| Unknown defaults to "en" | Yes | Yes | MATCH |
| export LANGUAGE | Yes | Yes | MATCH |
| Placement | Inside existing if block | Separate if block | MINOR DEVIATION |

**load-config.sh Score: 6/7 (86%) — structural deviation is functionally equivalent**

### 3.3 permission-hook.sh (MODIFIED)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Source translate.sh | Yes | Yes | MATCH |
| Extract .tool_name | `.tool_name // empty` | `.tool_name // empty` | MATCH |
| Message format | `"Permission required for ${TOOL_NAME}"` | `"Permission required for ${TOOL_NAME}"` | MATCH |
| Translate call | `MSG=$(translate "$MESSAGE")` | `MSG=$(translate "$MESSAGE")` | MATCH |
| Say with MSG | `say -v "$VOICE" -r "$RATE" "$MSG" &` | `say -v "$VOICE" -r "$RATE" "$MSG" &` | MATCH |

**permission-hook.sh Score: 5/5 (100%)**

### 3.4 subagent-stop-hook.sh (MODIFIED)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Source translate.sh | Yes | Yes | MATCH |
| Variable name | `SUBAGENT_TYPE` | `AGENT_TYPE` | MINOR DEVIATION |
| jq default | `// "subagent"` | `// empty` with explicit else branch | MINOR DEVIATION |
| Fallback message | `"Subagent subagent completed"` (implicit) | `"Subagent task completed"` (explicit else) | MINOR DEVIATION |
| Translate call | `MSG=$(translate "$MESSAGE")` | `MSG=$(translate "$MESSAGE")` | MATCH |
| Say with MSG | `say -v "$VOICE" -r "$RATE" "$MSG" &` | `say -v "$VOICE" -r "$RATE" "$MSG" &` | MATCH |

**subagent-stop-hook.sh Score: 3/6 (50%) — 3 minor deviations, functionally improved**

### 3.5 task-completed-hook.sh (MODIFIED)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Source translate.sh | Yes | Yes | MATCH |
| jq field | `.title // empty` | `.task_title // .title // .subject // empty` | MINOR DEVIATION |
| Title length check | None in design | `${#TASK_TITLE} -gt 3` and truncate at 80 chars | ADDED (improvement) |
| Message format | `"Task completed: ${TITLE}"` | `"Task completed: ${TASK_TITLE}"` | MATCH |
| Fallback | `"Task completed"` | `"Task completed"` | MATCH |
| Translate call | `MSG=$(translate "$MESSAGE")` | `MSG=$(translate "$MESSAGE")` | MATCH |

**task-completed-hook.sh Score: 4/6 (67%) — deviations are defensive enhancements**

### 3.6 notification-hook.sh (MODIFIED)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| Source translate.sh | Yes | Yes | MATCH |
| Extract message | `RAW_MSG` variable, then truncate | Direct to `MESSAGE`, separate truncate step | MINOR DEVIATION |
| Empty check | `if [[ -z "$MESSAGE" ]]` | `if [[ -z "$MESSAGE" ]] \|\| [[ ${#MESSAGE} -lt 5 ]]` | MINOR DEVIATION (stricter) |
| Truncate | `${RAW_MSG:0:$SUMMARY_MAX_CHARS}` | `${MESSAGE:0:$SUMMARY_MAX_CHARS}` | MATCH (equivalent) |
| Translate call | `MSG=$(translate "$MESSAGE")` | `MSG=$(translate "$MESSAGE")` | MATCH |

**notification-hook.sh Score: 3/5 (60%) — deviations are defensive enhancements**

### 3.7 config.example.json (hooks/)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| `"language": "ko"` field | Yes | Yes | MATCH |
| voice | `"Yuna"` | `"Yuna"` | MATCH |
| rate | 200 | 200 | MATCH |
| volume | 50 | 50 | MATCH |
| summary.maxChars | 200 | 200 | MATCH |
| summary.mode | `"first-sentence"` | `"first-sentence"` | MATCH |

**config.example.json (hooks/) Score: 6/6 (100%)**

### 3.8 config.example.json (config/)

| Item | Design | Implementation | Status |
|------|--------|----------------|--------|
| `"language": "ko"` field | Yes | Yes | MATCH |
| Full schema match | Same as hooks config | Identical content | MATCH |

**config.example.json (config/) Score: 2/2 (100%)**

---

## 4. Overall Score

| Category | Score | Weight | Weighted Score |
|----------|:-----:|:------:|:--------------:|
| Acceptance Criteria | 9/9 (100%) | 40% | 40.0% |
| Core Files (translate.sh + load-config.sh + configs) | 27/28 (96%) | 30% | 28.9% |
| Hook Updates (5 hooks) | 15/22 (68%) | 20% | 13.6% |
| Convention Compliance | 100% | 10% | 10.0% |
| **Overall** | | | **92.5% → 93%** |

Note: Hook deviations are all defensive improvements (extra field fallbacks, stricter validation, better variable naming). None are functional regressions.

---

## 5. Gap List

### 5.1 Minor Deviations (Non-blocking, Implementation Improvements)

| # | File | Design | Implementation | Impact |
|---|------|--------|----------------|--------|
| 1 | `subagent-stop-hook.sh` | Variable `SUBAGENT_TYPE` | Variable `AGENT_TYPE` | None — naming only |
| 2 | `subagent-stop-hook.sh` | jq default `// "subagent"` | jq default `// empty` with explicit else branch | Low — better fallback message |
| 3 | `subagent-stop-hook.sh` | Fallback: `"Subagent subagent completed"` | Fallback: `"Subagent task completed"` | Low — clearer message |
| 4 | `task-completed-hook.sh` | Extract `.title` only | Extract `.task_title // .title // .subject` | None — more compatible |
| 5 | `task-completed-hook.sh` | No length checks on title | Min 3 chars, max 80 chars truncation | None — defensive |
| 6 | `notification-hook.sh` | Single-step truncate via `RAW_MSG` | Two-step: extract then truncate | None — functionally equivalent |
| 7 | `notification-hook.sh` | Empty check only | Empty or < 5 chars check | None — stricter validation |
| 8 | `load-config.sh` | LANGUAGE block inside existing if | Separate if block for LANGUAGE | None — functionally identical |

### 5.2 Critical Gaps

None found.

### 5.3 Missing Features (Design present, Implementation absent)

None found. All designed features are implemented.

### 5.4 Added Features (Implementation present, Design absent)

| # | File | Addition | Description |
|---|------|----------|-------------|
| 1 | `task-completed-hook.sh` | Multi-field jq fallback | `.task_title // .title // .subject` instead of `.title` only |
| 2 | `task-completed-hook.sh` | Title length guards | Min 3 chars, max 80 chars |
| 3 | `notification-hook.sh` | Min length check | Requires message >= 5 chars |

---

## 6. Convention Compliance

| Convention | Requirement | Status |
|-----------|-------------|--------|
| Shebang | `#!/bin/bash` | PASS — all scripts |
| Error handling | `set -euo pipefail` | PASS — all hook scripts |
| Config sourcing | `source "$(dirname "$0")/load-config.sh"` | PASS — all hooks |
| Translate sourcing | `source "$(dirname "$0")/translate.sh"` | PASS — all hooks |
| JSON parsing | `jq -r '... // empty' 2>/dev/null \|\| echo ""` | PASS — all hooks |
| Non-blocking TTS | `say ... &` | PASS — all hooks |
| Exit code | `exit 0` | PASS — all hooks |
| Fallback chain | All translate() failure paths return original text | PASS |

**Convention Score: 8/8 (100%)**

---

## 7. Conclusion

The `tts-i18n` implementation is **production-ready** with a **93% match rate** against the design specification. All 9 acceptance criteria pass. The core translation infrastructure (`translate.sh`) matches the design exactly at 100%. All 5 hooks correctly integrate translation. Both `config.example.json` files include the `"language"` field as designed.

The 7% gap consists entirely of minor defensive enhancements in 3 hook scripts that improve robustness over the design specification. No features are missing and no regressions were introduced.

**Recommendation**: Proceed to Report phase (`/pdca report tts-i18n`).

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial gap analysis | gap-detector agent |
