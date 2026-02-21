# Plan: CLI Interactive Commands

**Feature**: `cli-interactive-commands`
**Date**: 2026-02-17
**Level**: Starter
**Phase**: Plan

---

## Overview

Add two interactive CLI commands to `agent-speech`:

1. **`agent-speech language`** — Display list of supported languages; user selects one; `language` field in `~/.agent-speech/config.json` updated immediately.
2. **`agent-speech mute`** — Display duration options (5min, 10min, 15min, 30min, 1hr, 2hr, permanent); user selects; TTS hooks silenced for that duration.

---

## Problem Statement

Currently, users must manually edit `~/.agent-speech/config.json` to change language or mute TTS. There is no CLI interface for these two common operations, creating friction especially for non-developer users.

---

## Acceptance Criteria

| ID | Criteria | Priority |
|----|----------|----------|
| AC-01 | `agent-speech language` shows numbered list of supported languages | High |
| AC-02 | User can select language by number; config updated immediately | High |
| AC-03 | `agent-speech mute` shows duration menu | High |
| AC-04 | User can select duration; mute state file created with expiry timestamp | High |
| AC-05 | All hooks check mute state before speaking; skip TTS if muted | High |
| AC-06 | `permanent` mute option supported (no expiry) | Medium |
| AC-07 | `agent-speech status` shows active mute duration remaining | Medium |
| AC-08 | Mute expires automatically (hooks check timestamp) | High |
| AC-09 | `agent-speech mute off` cancels active mute | Medium |
| AC-10 | Interactive prompts use Node.js built-in `readline` (no new dependencies) | High |

---

## Supported Languages

Initial set (expandable via config):

| # | Code | Name |
|---|------|------|
| 1 | en | English |
| 2 | ko | Korean |
| 3 | ja | Japanese |
| 4 | zh | Chinese (Simplified) |
| 5 | es | Spanish |
| 6 | fr | French |
| 7 | de | German |
| 8 | it | Italian |

---

## Technical Design

### `language` command flow

```
agent-speech language
  → Show numbered language list
  → Read user input (readline)
  → Validate selection
  → Read ~/.agent-speech/config.json (raw JSON)
  → Update "language" field
  → Write back
  → Print confirmation
```

**Important**: The hooks use a flat config schema (`{voice, language, rate, volume, summary}`). The TypeScript CLI uses a nested schema (`{version, global, tools}`). The `language` field must be written at the **top level** of the JSON file so that `load-config.sh` can read it.

Solution: Use `readJSON` / `writeJSON` from `infrastructure/fs.ts` with `Record<string, unknown>` to patch only the `language` key without disturbing the rest of the file.

### `mute` command flow

```
agent-speech mute [off]
  → If "off": delete ~/.agent-speech/mute.json, print confirmation
  → Else: show duration menu
  → Read user input
  → Calculate expiry timestamp (or null for permanent)
  → Write ~/.agent-speech/mute.json: {until: ISO_string | null, duration: "5min"}
  → Print confirmation
```

**Mute state file**: `~/.agent-speech/mute.json`
```json
{
  "until": "2026-02-17T10:35:00.000Z",
  "duration": "5min"
}
```
- `until: null` = permanent mute
- File absent = not muted

### Hook mute check

All 5 hooks must check `~/.agent-speech/mute.json` before speaking:

```bash
# In load-config.sh (after existing config loading)
MUTE_FILE="$HOME/.agent-speech/mute.json"
IS_MUTED=false
if [[ -f "$MUTE_FILE" ]]; then
  UNTIL=$(jq -r '.until // empty' "$MUTE_FILE" 2>/dev/null || echo "")
  if [[ -z "$UNTIL" ]]; then
    IS_MUTED=true  # permanent
  else
    NOW=$(date -u +%s)
    UNTIL_EPOCH=$(date -u -jf "%Y-%m-%dT%H:%M:%S" "${UNTIL%.*}" +%s 2>/dev/null || echo 0)
    if [[ $NOW -lt $UNTIL_EPOCH ]]; then
      IS_MUTED=true
    else
      rm -f "$MUTE_FILE"  # expired, auto-cleanup
    fi
  fi
fi
export IS_MUTED
```

Each hook skips TTS when `IS_MUTED=true`:
```bash
if [[ "$IS_MUTED" == "true" ]]; then exit 0; fi
```

---

## Files to Create/Modify

### New files (TypeScript CLI)
- `src/commands/language.ts` — `cmdLanguage()` implementation
- `src/commands/mute.ts` — `cmdMute(arg?: string)` implementation

### Modified files (TypeScript CLI)
- `src/commands/index.ts` — export `cmdLanguage`, `cmdMute`
- `src/cli.ts` — add `language`, `mute` cases to switch

### Modified files (Bash hooks)
- `.claude-plugin/agent-speech-claude-code/hooks/load-config.sh` — add mute check, export `IS_MUTED`
- All 5 hook scripts — add `if [[ "$IS_MUTED" == "true" ]]; then exit 0; fi`

### Plugin cache sync
- Copy updated hooks to `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/.claude-plugin/`

---

## Duration Map

| Option | Display | Milliseconds |
|--------|---------|-------------|
| 1 | 5 minutes | 300,000 |
| 2 | 10 minutes | 600,000 |
| 3 | 15 minutes | 900,000 |
| 4 | 30 minutes | 1,800,000 |
| 5 | 1 hour | 3,600,000 |
| 6 | 2 hours | 7,200,000 |
| 7 | Permanent | N/A (null) |

---

## Out of Scope

- Voice selection interactivity (covered by existing `set-voice` + `list-voices`)
- Per-tool mute (global mute only)
- Scheduled un-mute notifications

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Flat vs nested config schema conflict | Patch only `language` key using raw JSON read/write |
| macOS `date` format differences (BSD vs GNU) | Use `-jf` flag (BSD date on macOS) |
| Hooks executed without mute.json existing | Guard with `[[ -f "$MUTE_FILE" ]]` |
| Readline not closing on Ctrl+C | Use `rl.close()` in SIGINT handler |

---

## Estimated Scope

- TypeScript: ~100 lines (2 command files + index/cli updates)
- Bash: ~20 lines (load-config.sh mute check + 5 hook guard lines)
- Total: Small change (~120 lines)
