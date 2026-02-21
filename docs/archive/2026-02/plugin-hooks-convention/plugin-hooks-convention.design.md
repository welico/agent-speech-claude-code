# plugin-hooks-convention Design Document

> **Summary**: Based on the ralph-loop official convention, move the TTS Hook to .claude-plugin/agent-speech-claude-code/hooks/ and replace it with a jq-based script.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.0
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft
> **Planning Doc**: [plugin-hooks-convention.plan.md](../01-plan/features/plugin-hooks-convention.plan.md)

---

## 1. Overview

### 1.1 Design Goals

- Securing hook route portability based on `hooks/hooks.json` + `${CLAUDE_PLUGIN_ROOT}` variable
- Remove python3 dependency with bash-native JSON parsing using `jq`
- Apply a layout that 100% matches the ralph-loop official plugin structure

### 1.2 Design Principles

- Apply the same pattern using the ralph-loop structure as a reference implementation.
- Simplicity first: conforms to conventions with minimal changes
- Portability: Remove absolute path, use `${CLAUDE_PLUGIN_ROOT}` variable

---

## 2. Architecture

### 2.1 Before / After structure

```
Before:
~/.claude/
├── claude-tts.sh ← Standalone script (non-standard)
└── settings.json ← Stop hook absolute path hard coding

After (goal):
repo/.claude-plugin/
└── agent-speech-claude-code/
    ├── hooks/
│ ├── hooks.json ← Hook settings (see ${CLAUDE_PLUGIN_ROOT})
│ └── stop-hook.sh ← TTS script (jq based)
    ├── plugin.json
    ├── .mcp.json
    └── README.md

~/.claude/
└── settings.json ← Remove hooks section (automatically applies hooks.json)
* If automatic application is not possible: keep reference to ${CLAUDE_PLUGIN_ROOT}
```

### 2.2 Data Flow

```
Claude Code response complete
→ Stop event occurs
→ Execute Stop hook in hooks.json
→ Run stop-hook.sh
→ Read JSONL from transcript_path (jq)
→ Extract the last assistant text block
→ Run TTS with say command (background)
```

---

## 3. File Specifications

### 3.1 `hooks/hooks.json`

Same structure as ralph-loop's `hooks.json`:

```json
{
  "description": "Agent Speech Plugin stop hook for automatic TTS",
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```

**Key**: The `${CLAUDE_PLUGIN_ROOT}` variable is automatically replaced with the plugin installation path.

### 3.2 `hooks/stop-hook.sh`

Adapting ralph-loop's `stop-hook.sh` approach (using jq):

```bash
#!/bin/bash
# Agent Speech Plugin Stop Hook - Auto TTS for Claude responses

set -euo pipefail

HOOK_INPUT=$(cat)

# Extract transcript path
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty')

if [[ -z "$TRANSCRIPT_PATH" ]] || [[ ! -f "$TRANSCRIPT_PATH" ]]; then
  exit 0
fi

# Extract last assistant text from JSONL transcript (jq)
LAST_TEXT=$(grep '"role":"assistant"' "$TRANSCRIPT_PATH" 2>/dev/null | tail -1 | \
  jq -r '.message.content | map(select(.type == "text")) | map(.text) | join(" ")' 2>/dev/null || echo "")

# Skip if empty or too short
if [[ -z "$LAST_TEXT" ]] || [[ ${#LAST_TEXT} -lt 10 ]]; then
  exit 0
fi

# Limit to 500 chars
if [[ ${#LAST_TEXT} -gt 500 ]]; then
  LAST_TEXT="${LAST_TEXT:0:500}..."
fi

# Speak (background, non-blocking)
say -v "Samantha" -r 200 "$LAST_TEXT" &

exit 0
```

**Improvements**:
- Apply `set -euo pipefail` (ralph-loop method)
- `jq` based parsing (python3 removed)
- `grep '"role":"assistant"'` direct search (ralph-loop method)

### 3.3 Changes to `~/.claude/settings.json`

**Before**:
```json
"hooks": {
  "Stop": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "command",
          "command": "/Users/warezio/.claude/claude-tts.sh"
        }
      ]
    }
  ]
}
```

**After** (Option A - hooks.json automatically applied):
```json
"hooks": {}
```

**After** (Option B - See ${CLAUDE_PLUGIN_ROOT}, fallback if automatic application is not possible):
```json
"hooks": {
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh"
        }
      ]
    }
  ]
}
```

> **Verification required**: Try Option A (automatically applied) first, if it does not work, apply Option B

---

## 4. Implementation Order

1. [ ] Create directory `.claude-plugin/agent-speech-claude-code/hooks/`
2. [ ] Create `hooks/hooks.json`
3. [ ] Write `hooks/stop-hook.sh` + grant execution permission
4. [ ] Replace `~/.claude/settings.json` Stop hook (Option B first)
5. [ ] Delete `~/.claude/claude-tts.sh`
6. [ ] Check operation (voice output after Claude responds)

---

## 5. Test Plan

| case | Expected results |
|--------|----------|
| After completing Claude's response | Automatic voice output (Samantha, 200WPM) |
| Short response (less than 10 characters) | Skip TTS, quietly exit |
| Long response (>500 characters) | Read only the first 500 characters |
| No transcript file | exit 0 (exit without error) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
