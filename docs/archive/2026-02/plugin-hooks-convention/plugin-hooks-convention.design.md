# plugin-hooks-convention Design Document

> **Summary**: ralph-loop 공식 컨벤션 기반으로 TTS Hook을 .claude-plugin/agent-speech-claude-code/hooks/ 로 이동하고 jq 기반 스크립트로 교체한다.
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

- `hooks/hooks.json` + `${CLAUDE_PLUGIN_ROOT}` 변수 기반으로 Hook 경로 이식성 확보
- `jq`를 사용한 bash-native JSON 파싱으로 python3 의존성 제거
- ralph-loop 공식 플러그인 구조와 100% 일치하는 레이아웃 적용

### 1.2 Design Principles

- ralph-loop 구조를 레퍼런스 구현으로 삼아 동일한 패턴 적용
- 단순성 우선: 최소한의 변경으로 컨벤션 준수
- 이식성: 절대경로 제거, `${CLAUDE_PLUGIN_ROOT}` 변수 사용

---

## 2. Architecture

### 2.1 Before / After 구조

```
Before (현재):
~/.claude/
├── claude-tts.sh              ← 독립 스크립트 (비표준)
└── settings.json              ← Stop hook 절대경로 하드코딩

After (목표):
repo/.claude-plugin/
└── agent-speech-claude-code/
    ├── hooks/
    │   ├── hooks.json          ← Hook 설정 (${CLAUDE_PLUGIN_ROOT} 참조)
    │   └── stop-hook.sh        ← TTS 스크립트 (jq 기반)
    ├── plugin.json
    ├── .mcp.json
    └── README.md

~/.claude/
└── settings.json              ← hooks 섹션 제거 (hooks.json 자동 적용)
                                  * 자동 적용 불가 시: ${CLAUDE_PLUGIN_ROOT} 참조 유지
```

### 2.2 Data Flow

```
Claude Code 응답 완료
    → Stop 이벤트 발생
    → hooks.json의 Stop hook 실행
    → stop-hook.sh 실행
    → transcript_path에서 JSONL 읽기 (jq)
    → 마지막 assistant text 블록 추출
    → say 명령으로 TTS 실행 (백그라운드)
```

---

## 3. File Specifications

### 3.1 `hooks/hooks.json`

ralph-loop의 `hooks.json`과 동일한 구조:

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

**핵심**: `${CLAUDE_PLUGIN_ROOT}` 변수가 플러그인 설치 경로로 자동 치환됨

### 3.2 `hooks/stop-hook.sh`

ralph-loop의 `stop-hook.sh` 방식(jq 사용)을 채택:

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

**개선점**:
- `set -euo pipefail` 적용 (ralph-loop 방식)
- `jq` 기반 파싱 (python3 제거)
- `grep '"role":"assistant"'` 직접 검색 (ralph-loop 방식)

### 3.3 `~/.claude/settings.json` 변경

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

**After** (Option A - hooks.json 자동 적용):
```json
"hooks": {}
```

**After** (Option B - ${CLAUDE_PLUGIN_ROOT} 참조, 자동 적용 불가 시 fallback):
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

> **검증 필요**: Option A(자동 적용) 먼저 시도, 동작 안 할 경우 Option B 적용

---

## 4. Implementation Order

1. [ ] `.claude-plugin/agent-speech-claude-code/hooks/` 디렉토리 생성
2. [ ] `hooks/hooks.json` 작성
3. [ ] `hooks/stop-hook.sh` 작성 + 실행 권한 부여
4. [ ] `~/.claude/settings.json` Stop hook 교체 (Option B 우선)
5. [ ] `~/.claude/claude-tts.sh` 삭제
6. [ ] 동작 확인 (Claude 응답 후 음성 출력)

---

## 5. Test Plan

| 케이스 | 기대 결과 |
|--------|----------|
| Claude 응답 완료 후 | 음성 자동 출력 (Samantha, 200WPM) |
| 짧은 응답 (10자 미만) | TTS 스킵, 조용히 종료 |
| 긴 응답 (500자 초과) | 앞 500자만 읽기 |
| transcript 파일 없음 | exit 0 (오류 없이 종료) |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-16 | Initial draft | welico |
