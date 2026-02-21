# extended-tts-hooks Design Document

> **Summary**: Add TTS to `Stop` and 4 other Claude Code hook events (`Notification`, `PermissionRequest`, `SubagentStop`, `TaskCompleted`). Each is implemented as an independent bash script and follows the existing `stop-hook.sh` pattern.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.1
> **Date**: 2026-02-16
> **References**: `extended-tts-hooks.plan.md`, `plugin-hooks-convention` (archived)

---

## 1. Architecture Overview

### 1.1 Before / After

```
Before (0.1.0):
hooks/
├── hooks.json          # Stop only
└── stop-hook.sh # Read transcript TTS

After (0.1.1):
hooks/
├── hooks.json                  # Stop + Notification + PermissionRequest + SubagentStop + TaskCompleted
├── stop-hook.sh # No change
├── notification-hook.sh # New: Read .message TTS
├── permission-hook.sh # New: Read TTS from .tool_name
├── subagent-stop-hook.sh # New: .subagent_type read TTS
└── task-completed-hook.sh # New: Read .task_title TTS
```

### 1.2 Hook Flow

```
Claude Code Event
      │
      ▼
hooks.json (${CLAUDE_PLUGIN_ROOT}/hooks/)
      │
├── Stop → stop-hook.sh → transcript parsing → say
      ├── Notification     → notification-hook.sh    → .message       → say
      ├── PermissionRequest→ permission-hook.sh      → .tool_name     → say
      ├── SubagentStop     → subagent-stop-hook.sh   → .subagent_type → say
      └── TaskCompleted    → task-completed-hook.sh  → .task_title    → say
                                                              │
                                                              ▼
say -v Samantha -r 200 & (asynchronous)
```

---

## 2. hooks.json — Updated Specification

**Path**: `.claude-plugin/agent-speech-claude-code/hooks/hooks.json`

```json
{
  "description": "Agent Speech Plugin — automatic TTS for Claude Code events",
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
    ],
    "Notification": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/notification-hook.sh"
          }
        ]
      }
    ],
    "PermissionRequest": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/permission-hook.sh"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/subagent-stop-hook.sh"
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/task-completed-hook.sh"
          }
        ]
      }
    ]
  }
}
```

---

## 3. Script Designs

### 3.1 Common Pattern

All new scripts follow this pattern:

```bash
#!/bin/bash
# [Hook Name] Hook
# [explanation]
set -euo pipefail

HOOK_INPUT=$(cat)

# 1. Extract dynamic message via jq (with fallback)
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '[FIELD] // empty' 2>/dev/null || echo "")

# 2. Use fallback if empty
if [[ -z "$MESSAGE" ]]; then
  MESSAGE="[FALLBACK_TEXT]"
fi

# 3. Limit length (different for each hook)
if [[ ${#MESSAGE} -gt [LIMIT] ]]; then
  MESSAGE="${MESSAGE:0:[LIMIT]}"
fi

# 4. Speak (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

---

### 3.2 notification-hook.sh

**Hook type**: `Notification`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "Notification",
  "message": "Waiting for your input on Bash command",
  "transcript_path": "..."
}
```

**TTS strategy**: Read `.message` field directly. 200 character limit (notification must be short).

**Full Script**:
```bash
#!/bin/bash
# Agent Speech Plugin — Notification Hook
# Speaks Claude Code notification messages via macOS TTS

set -euo pipefail

HOOK_INPUT=$(cat)

# Extract notification message
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null || echo "")

# Skip if empty or too short
if [[ -z "$MESSAGE" ]] || [[ ${#MESSAGE} -lt 5 ]]; then
  exit 0
fi

# Limit to 200 characters for notifications
if [[ ${#MESSAGE} -gt 200 ]]; then
  MESSAGE="${MESSAGE:0:200}"
fi

say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

**Example TTS output**: *"Waiting for your input on the Bash command"*

---

### 3.3 permission-hook.sh

**Hook type**: `PermissionRequest`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": { "command": "git push origin main" }
}
```

**TTS strategy**: Read `tool_name` and combine it into "Permission required for [Tool]". Fixed format.

**Full Script**:
```bash
#!/bin/bash
# Agent Speech Plugin — Permission Request Hook
# Announces when Claude Code requests tool execution permission

set -euo pipefail

HOOK_INPUT=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$TOOL_NAME" ]]; then
  MESSAGE="Permission required for ${TOOL_NAME}"
else
  MESSAGE="Permission required"
fi

say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

**Example TTS output**: *"Permission required for Bash"*

---

### 3.4 subagent-stop-hook.sh

**Hook Type**: `SubagentStop`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "SubagentStop",
  "subagent_type": "Bash",
  "transcript_path": "..."
}
```

**TTS Strategy**: Completion instructions including `subagent_type`. Short fixed format.

**Full Script**:
```bash
#!/bin/bash
# Agent Speech Plugin — Subagent Stop Hook
# Announces subagent task completion via macOS TTS

set -euo pipefail

HOOK_INPUT=$(cat)

# Extract subagent type
AGENT_TYPE=$(echo "$HOOK_INPUT" | jq -r '.subagent_type // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$AGENT_TYPE" ]]; then
  MESSAGE="Subagent ${AGENT_TYPE} completed"
else
  MESSAGE="Subagent task completed"
fi

say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

**Example TTS output**: *"Subagent Bash completed"*

---

### 3.5 task-completed-hook.sh

**Hook type**: `TaskCompleted`

**stdin JSON** (expected):
```json
{
  "session_id": "...",
  "hook_event_name": "TaskCompleted",
  "task_id": "3",
  "task_title": "Implement authentication"
}
```

**TTS strategy**: Read `task_title` if present, fixed message if not. 100 character limit.

**Full Script**:
```bash
#!/bin/bash
# Agent Speech Plugin — Task Completed Hook
# Announces task completion via macOS TTS

set -euo pipefail

HOOK_INPUT=$(cat)

# Extract task title (field name may vary — try multiple)
TASK_TITLE=$(echo "$HOOK_INPUT" | jq -r '.task_title // .title // .subject // empty' 2>/dev/null || echo "")

# Build spoken message
if [[ -n "$TASK_TITLE" ]] && [[ ${#TASK_TITLE} -gt 3 ]]; then
  # Limit title length
  if [[ ${#TASK_TITLE} -gt 80 ]]; then
    TASK_TITLE="${TASK_TITLE:0:80}"
  fi
  MESSAGE="Task completed: ${TASK_TITLE}"
else
  MESSAGE="Task completed"
fi

say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

**Example TTS output**: *"Task completed: Implement authentication"*

---

## 4. Character Limits by Hook

| Hook | Limit | Reason |
|------|:-----:|------|
| `Stop` | 500 characters | All responses (keep existing) |
| `Notification` | 200 characters | Notification messages are usually short |
| `PermissionRequest` | N/A | Fixed Format ("Permission required for X") |
| `SubagentStop` | N/A | Fixed Format ("Subagent X completed") |
| `TaskCompleted` | 80 characters (title) | Read Title |

---

## 5. File Sync Plan

After implementation, synchronization is required in the following 3 locations:

| location | Use |
|------|------|
| `./` (source repo) | Source code management |
| `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/` | Actual operating location (current version) |
| `~/.claude/plugins/marketplaces/welico/` | Marketplace Clone |

**sync command**:
```bash
CACHE_DIR=~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/.claude-plugin/agent-speech-claude-code/hooks
SRC_DIR=./.claude-plugin/agent-speech-claude-code/hooks

cp $SRC_DIR/hooks.json $CACHE_DIR/
cp $SRC_DIR/notification-hook.sh $CACHE_DIR/
cp $SRC_DIR/permission-hook.sh $CACHE_DIR/
cp $SRC_DIR/subagent-stop-hook.sh $CACHE_DIR/
cp $SRC_DIR/task-completed-hook.sh $CACHE_DIR/
chmod +x $CACHE_DIR/*.sh
```

---

## 6. Implementation Order

1. **hooks.json update** — Added 4 hook items
2. Create **notification-hook.sh** + execute permission
3. Write **permission-hook.sh** + execute permission
4. Create **subagent-stop-hook.sh** + execute permission
5. Create **task-completed-hook.sh** + execute permission
6. **Cache/Marketplace Sync**
7. **Operation verification** — Trigger test for each hook type

---

## 7. Risk Details

### 7.1 stdin JSON field name uncertainty

The actual JSON field name of the `TaskCompleted` hook may be different from the document. Use a multi-field fallback for this:

```bash
TASK_TITLE=$(echo "$HOOK_INPUT" | jq -r '.task_title // .title // .subject // empty')
```

### 7.2 Simultaneous TTS overlap

If multiple hooks are fired simultaneously in a short period of time, TTS may overlap. The current design uses a simple `say &` and therefore does not break previous TTS.

**Option**: Before starting a new TTS, `pkill -x say 2>/dev/null || true` added — Implementation decision.

### 7.3 Unsupported hook type

`PermissionRequest`, `TaskCompleted` may not be supported in current Claude Code version. If an event does not occur even if registered in hooks.json, actual operation is not possible — verification is required after implementation.

---

## 8. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | When the `Notification` event occurs, the contents of `.message` are read as TTS |
| AC-02 | “Permission required for [Tool]” TTS utterance when requesting permission |
| AC-03 | “Subagent [Type] completed” TTS utterance when subagent is completed |
| AC-04 | When a task is completed, say "Task completed" or title TTS utterance |
| AC-05 | Maintain existing `Stop` hook TTS operation (no regression) |
| AC-06 | Guaranteed `exit 0` for all scripts (even when exceptions occur) |
| AC-07 | Grant all script execution permissions `+x` |
| AC-08 | Cache and Marketplace Path Sync Completed |

---

## 9. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial design | welico |
