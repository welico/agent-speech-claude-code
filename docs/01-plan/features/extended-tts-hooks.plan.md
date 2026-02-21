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

현재 TTS는 `Stop` hook에서만 동작한다 (Claude가 응답을 완료할 때). 그러나 Claude Code에는 사용자가 인지해야 할 다양한 이벤트가 존재하며, 화면을 보지 않는 상황(멀티태스킹)에서는 이러한 이벤트를 놓치기 쉽다.

이 기능은 주요 Claude Code 생명주기 이벤트에 TTS를 추가하여, 터미널을 보지 않아도 AI 상태를 청각으로 파악할 수 있도록 한다.

### 1.2 Motivation

| 상황 | 현재 문제 | TTS로 개선 |
|------|-----------|-----------|
| 권한 요청 대기 | 화면 확인 필요 | "Permission requested for Bash" 자동 안내 |
| 서브에이전트 완료 | 언제 끝났는지 모름 | "Subagent task completed" 자동 안내 |
| 태스크 완료 | 알림 놓침 | "Task completed" 자동 안내 |
| 시스템 알림 | 팝업 놓침 | 알림 내용 TTS 읽기 |
| 팀원 에이전트 대기 | 응답 놓침 | "Teammate is idle" 자동 안내 |

### 1.3 Reference

- Claude Code Hooks 공식 문서: https://code.claude.com/docs/en/hooks-guide
- 현재 구현: `.claude-plugin/agent-speech-claude-code/hooks/stop-hook.sh`
- 참조 구현: `hookify` plugin (`hooks/hooks.json` — 4개 hook 타입 사용)

---

## 2. Claude Code Hook Types (전체 목록)

Research 결과 확인된 전체 Hook 타입:

| Hook 타입 | 트리거 시점 | TTS 적합도 | 계획 |
|-----------|------------|-----------|------|
| `Stop` | Claude 응답 완료 | ★★★★★ | ✅ 현재 구현 |
| `Notification` | 시스템 알림 (권한, 유휴 등) | ★★★★★ | ✅ 추가 |
| `PermissionRequest` | 권한 요청 팝업 | ★★★★★ | ✅ 추가 |
| `SubagentStop` | 서브에이전트 완료 | ★★★★☆ | ✅ 추가 |
| `TaskCompleted` | 태스크 완료 | ★★★★☆ | ✅ 추가 |
| `TeammateIdle` | 팀원 에이전트 대기 | ★★★☆☆ | ✅ 추가 (optional) |
| `SessionStart` | 세션 시작/재개 | ★★☆☆☆ | 🔵 옵션 (짧은 인사) |
| `PostToolUse` | 도구 실행 후 | ★☆☆☆☆ | ❌ 너무 빈번 |
| `PreToolUse` | 도구 실행 전 | ★☆☆☆☆ | ❌ 부적합 |
| `UserPromptSubmit` | 사용자 입력 전 | ★☆☆☆☆ | ❌ 부적합 |
| `PreCompact` | 컨텍스트 압축 전 | ★☆☆☆☆ | ❌ 내부 이벤트 |
| `SessionEnd` | 세션 종료 | ★★☆☆☆ | 🔵 옵션 |

---

## 3. Scope

### 3.1 In Scope (Phase 1 - Core)

| Hook | Script | TTS 내용 | 예시 |
|------|--------|---------|------|
| `Notification` | `notification-hook.sh` | 알림 메시지 읽기 | "Permission request: Bash command" |
| `PermissionRequest` | `permission-hook.sh` | 권한 요청 안내 | "Bash permission requested" |
| `SubagentStop` | `subagent-stop-hook.sh` | 서브에이전트 완료 | "Subagent task completed" |
| `TaskCompleted` | `task-completed-hook.sh` | 태스크 완료 | "Task: [name] completed" |

### 3.2 Optional (Phase 2 - Extra)

| Hook | Script | TTS 내용 | 조건 |
|------|--------|---------|------|
| `TeammateIdle` | `teammate-idle-hook.sh` | 팀원 대기 안내 | 팀 세션에서만 의미 있음 |
| `SessionStart` | `session-start-hook.sh` | 세션 시작 인사 | 짧은 메시지만 |

### 3.3 Out of Scope

- `PostToolUse` / `PreToolUse` — 너무 빈번, TTS 노이즈 발생
- `UserPromptSubmit` / `PreCompact` — 사용자 응답이 아닌 내부 이벤트
- Hook 로직 변경 (Stop hook 자체 수정 없음)

---

## 4. Requirements

### 4.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | `Notification` hook이 알림 메시지를 TTS로 읽음 | High | Pending |
| FR-02 | `PermissionRequest` hook이 권한 요청 도구명을 TTS로 안내 | High | Pending |
| FR-03 | `SubagentStop` hook이 서브에이전트 완료를 TTS로 알림 | Medium | Pending |
| FR-04 | `TaskCompleted` hook이 태스크 완료를 TTS로 알림 | Medium | Pending |
| FR-05 | `hooks.json`이 모든 새 hook을 `${CLAUDE_PLUGIN_ROOT}` 기준으로 정의 | High | Pending |
| FR-06 | 각 hook 스크립트가 실패 시 exit 0 반환 (Claude Code 동작 무중단) | High | Pending |
| FR-07 | 짧은 fixed TTS 메시지 (동적 content 불필요한 경우) | Medium | Pending |
| FR-08 | Hook별 메시지 길이 제한 (Notification: 200자, 기타: 100자) | Medium | Pending |

### 4.2 Non-Functional Requirements

| Category | Criteria |
|----------|----------|
| Non-blocking | 모든 TTS는 백그라운드 실행 (`say &`) |
| Portability | `${CLAUDE_PLUGIN_ROOT}` 사용, 하드코딩 경로 없음 |
| Reliability | exit 0 보장 — TTS 실패가 Claude Code에 영향 없음 |
| Performance | hook 스크립트 실행 < 100ms (TTS는 비동기) |

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
├── hooks.json                    ← 모든 hook 정의 (업데이트)
├── stop-hook.sh                  ← 현재 구현 (변경 없음)
├── notification-hook.sh          ← 신규: Notification TTS
├── permission-hook.sh            ← 신규: PermissionRequest TTS
├── subagent-stop-hook.sh         ← 신규: SubagentStop TTS
└── task-completed-hook.sh        ← 신규: TaskCompleted TTS
```

### 6.2 Updated hooks.json Structure

```json
{
  "hooks": {
    "Stop": [...],                    // 기존 유지
    "Notification": [...],            // 신규
    "PermissionRequest": [...],       // 신규
    "SubagentStop": [...],            // 신규
    "TaskCompleted": [...]            // 신규
  }
}
```

### 6.3 Common Script Pattern

모든 새 hook 스크립트는 동일한 패턴 따름:

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

| Hook | Dynamic? | TTS 메시지 예시 |
|------|----------|---------------|
| `Notification` | ✅ 메시지 읽기 | "Permission requested: Bash command" |
| `PermissionRequest` | ✅ 도구명 | "Permission required for Bash" |
| `SubagentStop` | ✅ 에이전트 타입 | "Subagent Bash completed" |
| `TaskCompleted` | ✅ 태스크 제목 | "Task completed" |

---

## 8. Success Criteria

### 8.1 Definition of Done

- [ ] `Notification` hook 동작 확인 (알림 발생 시 TTS)
- [ ] `PermissionRequest` hook 동작 확인 (권한 요청 시 TTS)
- [ ] `SubagentStop` hook 동작 확인 (서브에이전트 완료 시 TTS)
- [ ] `TaskCompleted` hook 동작 확인 (태스크 완료 시 TTS)
- [ ] 기존 `Stop` hook 동작 유지 (회귀 없음)
- [ ] 모든 스크립트 exit 0 보장
- [ ] hooks.json 업데이트 + 캐시 동기화

### 8.2 Quality Criteria

- [ ] 모든 스크립트가 `jq` 기반 JSON 파싱
- [ ] `${CLAUDE_PLUGIN_ROOT}` 사용 (하드코딩 없음)
- [ ] 백그라운드 실행 (`say &`)

---

## 9. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| `PermissionRequest`/`TaskCompleted` hook이 실제로 지원 안 될 수 있음 | Medium | Medium | 각 hook 타입 실제 동작 테스트 필수 |
| Notification hook이 너무 자주 발생 | Low | Medium | 중복 발화 방지 (`pkill say` 불필요) |
| stdin JSON 필드명이 예상과 다를 수 있음 | Medium | Medium | 다중 필드 fallback: `.message // .title // empty` |
| 여러 TTS가 동시 실행되면 겹침 | Low | High | `pkill say` 후 새 say 실행 (option) |

---

## 10. Next Steps

1. [ ] Design 문서 작성 (`extended-tts-hooks.design.md`)
2. [ ] 각 hook 타입의 실제 stdin JSON 필드 확인 (테스트 또는 공식 문서)
3. [ ] 스크립트 구현 및 hooks.json 업데이트

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
