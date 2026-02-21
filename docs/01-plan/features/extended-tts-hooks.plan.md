# extended-tts-hooks Planning Document

> **Summary**: Extend TTS trigger coverage beyond `Stop` hook to support all relevant Claude Code lifecycle events — Notification, SubagentStop, PermissionRequest, TaskCompleted, and TeammateIdle.
>
> **Project**: agent-speech-claude-code
> **Version**: 0.1.1
> **Author**: welico
> **Date**: 2026-02-16
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

Currently TTS only works with the `Stop` hook (when Claude completes the response). However, there are various events in Claude Code that users need to be aware of, and it is easy to miss these events in situations where the user is not looking at the screen (multitasking).

This feature adds TTS to key Claude Code lifecycle events, allowing you to hear the state of the AI ​​without having to look at the terminal.

### 1.2 Motivation

| Situation | Current Issues | Improvements with TTS |
|------|-----------|-----------|
| Waiting for permission request | Need to check screen | Automatic notification of “Permission requested for Bash” |
| Subagent completed | I don't know when it ended | Automatic notification of “Subagent task completed” |
| Task Completed | Missed Notification | “Task completed” automatic notification |
| System Notifications | Missed pop-up | Read notification content TTS |
| Team member agent waiting | Missed response | “Teammate is idle” automatic notification |

### 1.3 Reference

- Claude Code Hooks official documentation: https://code.claude.com/docs/en/hooks-guide
- Current implementation: `.claude-plugin/agent-speech-claude-code/hooks/stop-hook.sh`
- Reference implementation: `hookify` plugin (`hooks/hooks.json` — uses 4 hook types)

---

## 2. Claude Code Hook Types (full list)

All Hook types confirmed as a result of research:

| Hook type | Trigger Point | TTS fitness | planning |
|-----------|------------|-----------|------|
| `Stop` | Claude response completed | ★★★★★ | ✅ Current implementation |
| `Notification` | System notifications (permissions, idle, etc.) | ★★★★★ | ✅ Add |
| `PermissionRequest` | Permission request pop-up | ★★★★★ | ✅ Add |
| `SubagentStop` | Subagent completed | ★★★★☆ | ✅ Add |
| `TaskCompleted` | Task Completed | ★★★★☆ | ✅ Add |
| `TeammateIdle` | Team member agent waiting | ★★★☆☆ | ✅ Additional (optional) |
| `SessionStart` | Start/Resume Session | ★★☆☆☆ | 🔵 Options (short greeting) |
| `PostToolUse` | After running the tool | ★☆☆☆☆ | ❌ Too frequent |
| `PreToolUse` | Before running the tool | ★☆☆☆☆ | ❌ Inappropriate |
| `UserPromptSubmit` | Before user input | ★☆☆☆☆ | ❌ Inappropriate |
| `PreCompact` | Before context compression | ★☆☆☆☆ | ❌ Internal Event |
| `SessionEnd` | Session End | ★★☆☆☆ | 🔵 Options |

---

## 3. Scope

### 3.1 In Scope (Phase 1 - Core)

| Hook | Script | TTS content | Example |
|------|--------|---------|------|
| `Notification` | `notification-hook.sh` | Read notification message | "Permission request: Bash command" |
| `PermissionRequest` | `permission-hook.sh` | Permission request information | "Bash permission requested" |
| `SubagentStop` | `subagent-stop-hook.sh` | Subagent completed | "Subagent task completed" |
| `TaskCompleted` | `task-completed-hook.sh` | Task Completed | "Task: [name] completed" |

### 3.2 Optional (Phase 2 - Extra)

| Hook | Script | TTS content | Conditions |
|------|--------|---------|------|
| `TeammateIdle` | `teammate-idle-hook.sh` | Team member waiting information | Meaningful only in team sessions |
| `SessionStart` | `session-start-hook.sh` | Session start greetings | Short message only |

### 3.3 Out of Scope

- `PostToolUse` / `PreToolUse` — too frequent, generates TTS noise
- `UserPromptSubmit` / `PreCompact` — Internal events, not user responses
- Hook logic change (no modification of stop hook itself)

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `Notification` hook reads notification message as TTS | High | Pending |
| FR-02 | `PermissionRequest` hook informs the permission request tool name in TTS | High | Pending |
| FR-03 | `SubagentStop` hook notifies subagent completion with TTS | Medium | Pending |
| FR-04 | `TaskCompleted` hook notifies task completion with TTS | Medium | Pending |
| FR-05 | `hooks.json` defines all new hooks relative to `${CLAUDE_PLUGIN_ROOT}` | High | Pending |
| FR-06 | When each hook script fails, exit 0 is returned (Claude Code operation is uninterrupted) | High | Pending |
| FR-07 | Short fixed TTS message (if dynamic content is unnecessary) | Medium | Pending |
| FR-08 | Message length limit per Hook (Notification: 200 characters, Others: 100 characters) | Medium | Pending |

### 4.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Non-blocking | All TTS runs in the background (`say &`) |
| Portability | Use `${CLAUDE_PLUGIN_ROOT}`, no hardcoding path |
| Reliability | exit 0 guaranteed — TTS failure has no effect on Claude Code |
| Performance | Hook script execution < 100ms (TTS is asynchronous) |

---

## 5. Hook Payloads (stdin JSON)

### Notification Hook
```json
{
  "session_id": "...",
  "hook_event_name": "Notification",
  "message": "Permission requested for Bash",
  "transcript_path": "..."
}
```

### PermissionRequest Hook
```json
{
  "session_id": "...",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": { "command": "git push" }
}
```

### SubagentStop Hook
```json
{
  "session_id": "...",
  "hook_event_name": "SubagentStop",
  "subagent_type": "Bash",
  "transcript_path": "..."
}
```

### TaskCompleted Hook
```json
{
  "session_id": "...",
  "hook_event_name": "TaskCompleted",
  "task_id": "...",
  "task_title": "Implement authentication"
}
```

---

## 6. Architecture

### 6.1 Target File Structure

```
.claude-plugin/agent-speech-claude-code/hooks/
├── hooks.json ← All hook definitions (updated)
├── stop-hook.sh ← Current implementation (no changes)
├── notification-hook.sh ← New: Notification TTS
├── permission-hook.sh ← New: PermissionRequest TTS
├── subagent-stop-hook.sh ← New: SubagentStop TTS
└── task-completed-hook.sh ← New: TaskCompleted TTS
```

### 6.2 Updated hooks.json Structure

```json
{
  "hooks": {
"Stop": [...], // keep existing
"Notification": [...], // new
"PermissionRequest": [...], // new
"SubagentStop": [...], // new
"TaskCompleted": [...] // new
  }
}
```

### 6.3 Common Script Pattern

All new hook scripts follow the same pattern:

```bash
#!/bin/bash
set -euo pipefail
HOOK_INPUT=$(cat)

# Extract relevant field via jq
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '.message // .tool_name // empty' 2>/dev/null || echo "")

# Fallback to fixed message if no dynamic content
if [[ -z "$MESSAGE" ]]; then
  MESSAGE="[Event name]"
fi

# Limit length
if [[ ${#MESSAGE} -gt 100 ]]; then
  MESSAGE="${MESSAGE:0:100}..."
fi

say -v "Samantha" -r 200 "$MESSAGE" &
exit 0
```

---

## 7. TTS Messages Design

| Hook | Dynamic? | TTS message example |
|------|----------|---------------|
| `Notification` | ✅ Read messages | "Permission requested: Bash command" |
| `PermissionRequest` | ✅ Tool name | "Permission required for Bash" |
| `SubagentStop` | ✅ Agent Type | "Subagent Bash completed" |
| `TaskCompleted` | ✅ Task Title | "Task completed" |

---

## 8. Success Criteria

### 8.1 Definition of Done

- [ ] Check `Notification` hook operation (TTS when notification occurs)
- [ ] Check `PermissionRequest` hook operation (TTS when requesting permission)
- [ ] Check `SubagentStop` hook operation (TTS when subagent completes)
- [ ] Check `TaskCompleted` hook operation (TTS when task is completed)
- [ ] Maintain existing `Stop` hook operation (no regression)
- [ ] Guarantees exit 0 for all scripts
- [ ] hooks.json update + cache synchronization

### 8.2 Quality Criteria

- [ ] All scripts parse JSON based on `jq`
- [ ] Use `${CLAUDE_PLUGIN_ROOT}` (no hardcoding)
- [ ] Background execution (`say &`)

---

## 9. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `PermissionRequest`/`TaskCompleted` hooks may not actually be supported | Medium | Medium | Actual operation test for each hook type is required |
| Notification hook occurs too often | Low | Medium | Prevent duplicate utterances (no need for `pkill say`) |
| stdin JSON field name may be different than expected | Medium | Medium | Multi-field fallback: `.message // .title // empty` |
| When multiple TTSs run simultaneously, they overlap | Low | High | Execute new say after `pkill say` (option) |

---

## 10. Next Steps

1. [ ] Create a Design document (`extended-tts-hooks.design.md`)
2. [ ] Check the actual stdin JSON field of each hook type (test or official document)
3. [ ] Implement script and update hooks.json

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
