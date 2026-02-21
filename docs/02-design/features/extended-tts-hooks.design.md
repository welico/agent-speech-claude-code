# extended-tts-hooks Design Document

> **Summary**: `Stop` 외 4개 Claude Code hook 이벤트(`Notification`, `PermissionRequest`, `SubagentStop`, `TaskCompleted`)에 TTS를 추가한다. 각각 독립 bash 스크립트로 구현하며, 기존 `stop-hook.sh` 패턴을 동일하게 따른다.
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
└── stop-hook.sh        # transcript 읽어 TTS

After (0.1.1):
hooks/
├── hooks.json                  # Stop + Notification + PermissionRequest + SubagentStop + TaskCompleted
├── stop-hook.sh                # 변경 없음
├── notification-hook.sh        # 신규: .message 읽어 TTS
├── permission-hook.sh          # 신규: .tool_name 읽어 TTS
├── subagent-stop-hook.sh       # 신규: .subagent_type 읽어 TTS
└── task-completed-hook.sh      # 신규: .task_title 읽어 TTS
```

### 1.2 Hook Flow

```
Claude Code Event
      │
      ▼
hooks.json (${CLAUDE_PLUGIN_ROOT}/hooks/)
      │
      ├── Stop             → stop-hook.sh            → transcript 파싱 → say
      ├── Notification     → notification-hook.sh    → .message       → say
      ├── PermissionRequest→ permission-hook.sh      → .tool_name     → say
      ├── SubagentStop     → subagent-stop-hook.sh   → .subagent_type → say
      └── TaskCompleted    → task-completed-hook.sh  → .task_title    → say
                                                              │
                                                              ▼
                                                    say -v Samantha -r 200 & (비동기)
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

모든 신규 스크립트는 다음 패턴을 따름:

```bash
#!/bin/bash
# [Hook Name] Hook
# [설명]
set -euo pipefail

HOOK_INPUT=$(cat)

# 1. Extract dynamic message via jq (with fallback)
MESSAGE=$(echo "$HOOK_INPUT" | jq -r '[FIELD] // empty' 2>/dev/null || echo "")

# 2. Use fallback if empty
if [[ -z "$MESSAGE" ]]; then
  MESSAGE="[FALLBACK_TEXT]"
fi

# 3. Limit length (각 hook별 상이)
if [[ ${#MESSAGE} -gt [LIMIT] ]]; then
  MESSAGE="${MESSAGE:0:[LIMIT]}"
fi

# 4. Speak (background, non-blocking)
say -v "Samantha" -r 200 "$MESSAGE" &

exit 0
```

---

### 3.2 notification-hook.sh

**Hook 타입**: `Notification`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "Notification",
  "message": "Waiting for your input on Bash command",
  "transcript_path": "..."
}
```

**TTS 전략**: `.message` 필드 직접 읽기. 200자 제한 (notification은 짧아야 함).

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

**예시 TTS 출력**: *"Waiting for your input on the Bash command"*

---

### 3.3 permission-hook.sh

**Hook 타입**: `PermissionRequest`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": { "command": "git push origin main" }
}
```

**TTS 전략**: `tool_name`을 읽어 "Permission required for [Tool]" 형태로 조합. 고정 포맷.

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

**예시 TTS 출력**: *"Permission required for Bash"*

---

### 3.4 subagent-stop-hook.sh

**Hook 타입**: `SubagentStop`

**stdin JSON**:
```json
{
  "session_id": "...",
  "hook_event_name": "SubagentStop",
  "subagent_type": "Bash",
  "transcript_path": "..."
}
```

**TTS 전략**: `subagent_type` 포함한 완료 안내. 짧은 고정 포맷.

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

**예시 TTS 출력**: *"Subagent Bash completed"*

---

### 3.5 task-completed-hook.sh

**Hook 타입**: `TaskCompleted`

**stdin JSON** (예상):
```json
{
  "session_id": "...",
  "hook_event_name": "TaskCompleted",
  "task_id": "3",
  "task_title": "Implement authentication"
}
```

**TTS 전략**: `task_title` 있으면 읽기, 없으면 고정 메시지. 100자 제한.

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

**예시 TTS 출력**: *"Task completed: Implement authentication"*

---

## 4. Character Limits by Hook

| Hook | Limit | 이유 |
|------|:-----:|------|
| `Stop` | 500자 | 전체 응답 (기존 유지) |
| `Notification` | 200자 | 알림 메시지는 보통 짧음 |
| `PermissionRequest` | N/A | 고정 포맷 ("Permission required for X") |
| `SubagentStop` | N/A | 고정 포맷 ("Subagent X completed") |
| `TaskCompleted` | 80자 (title) | 제목 읽기 |

---

## 5. File Sync Plan

구현 후 아래 3개 위치에 동기화 필요:

| 위치 | 용도 |
|------|------|
| `./` (source repo) | 소스 코드 관리 |
| `~/.claude/plugins/cache/welico/agent-speech-claude-code/0.1.0/` | 실제 동작 위치 (현재 버전) |
| `~/.claude/plugins/marketplaces/welico/` | 마켓플레이스 클론 |

**sync 명령어**:
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

1. **hooks.json 업데이트** — 4개 hook 항목 추가
2. **notification-hook.sh** 작성 + 실행 권한
3. **permission-hook.sh** 작성 + 실행 권한
4. **subagent-stop-hook.sh** 작성 + 실행 권한
5. **task-completed-hook.sh** 작성 + 실행 권한
6. **캐시/마켓플레이스 동기화**
7. **동작 검증** — 각 hook 타입별 트리거 테스트

---

## 7. Risk Details

### 7.1 stdin JSON 필드명 불확실성

`TaskCompleted` hook의 실제 JSON 필드명이 문서와 다를 수 있음. 이를 대비해 다중 필드 fallback 사용:

```bash
TASK_TITLE=$(echo "$HOOK_INPUT" | jq -r '.task_title // .title // .subject // empty')
```

### 7.2 동시 TTS 겹침

여러 hook이 짧은 시간에 동시 발화될 경우 TTS가 겹칠 수 있음. 현재 설계는 단순 `say &`를 사용하므로 이전 TTS를 중단하지 않음.

**옵션**: 새 TTS 시작 전 `pkill -x say 2>/dev/null || true` 추가 — 구현 시 판단.

### 7.3 미지원 hook 타입

`PermissionRequest`, `TaskCompleted`가 현재 Claude Code 버전에서 지원되지 않을 수 있음. hooks.json에 등록해도 이벤트가 발생하지 않을 경우 실제 동작 불가 — 구현 후 검증 필수.

---

## 8. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | `Notification` 이벤트 발생 시 `.message` 내용이 TTS로 읽힘 |
| AC-02 | 권한 요청 시 "Permission required for [Tool]" TTS 발화 |
| AC-03 | 서브에이전트 완료 시 "Subagent [Type] completed" TTS 발화 |
| AC-04 | 태스크 완료 시 "Task completed" 또는 제목 TTS 발화 |
| AC-05 | 기존 `Stop` hook TTS 동작 유지 (회귀 없음) |
| AC-06 | 모든 스크립트 `exit 0` 보장 (예외 발생 시에도) |
| AC-07 | 모든 스크립트 실행 권한 `+x` 부여 |
| AC-08 | 캐시 및 마켓플레이스 경로 동기화 완료 |

---

## 9. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial design | welico |
